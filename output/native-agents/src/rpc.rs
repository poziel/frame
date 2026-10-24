use crate::types::{AgentError, ConnectorConfig, Result};
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicBool, AtomicU64, Ordering},
        Arc,
    },
    time::Duration,
};
use tokio::{
    io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader},
    process::{Child, ChildStdin, Command},
    sync::{broadcast, oneshot, Mutex},
};

type Pending = HashMap<u64, oneshot::Sender<Result<Value>>>;
pub const MAX_FRAME_BYTES: u64 = 16 * 1024 * 1024;

/// A bidirectional JSONL process. Only explicit spawn starts external work.
pub struct RpcClient {
    input: Mutex<Option<ChildStdin>>,
    child: Mutex<Option<Child>>,
    pending: Mutex<Pending>,
    events: broadcast::Sender<Value>,
    next_id: AtomicU64,
    closed: AtomicBool,
}
impl RpcClient {
    pub async fn spawn(
        config: &ConnectorConfig,
        default_program: &str,
        default_args: &[&str],
    ) -> Result<Arc<Self>> {
        let mut command = Command::new(
            config
                .executable
                .as_deref()
                .unwrap_or(std::path::Path::new(default_program)),
        );
        if config.args.is_empty() {
            command.args(default_args);
        } else {
            command.args(&config.args);
        }
        command
            .envs(&config.env)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .kill_on_drop(true);
        #[cfg(windows)]
        command.creation_flags(0x08000000);
        let mut child = command.spawn()?;
        let input = child
            .stdin
            .take()
            .ok_or_else(|| AgentError::msg("Process stdin unavailable"))?;
        let output = child
            .stdout
            .take()
            .ok_or_else(|| AgentError::msg("Process stdout unavailable"))?;
        if let Some(mut stderr) = child.stderr.take() {
            // Drain without retaining/logging potentially sensitive provider diagnostics.
            tokio::spawn(async move {
                let _ = tokio::io::copy(&mut stderr, &mut tokio::io::sink()).await;
            });
        }
        let (events, _) = broadcast::channel(2048);
        let client = Arc::new(Self {
            input: Mutex::new(Some(input)),
            child: Mutex::new(Some(child)),
            pending: Mutex::new(HashMap::new()),
            events,
            next_id: AtomicU64::new(1),
            closed: AtomicBool::new(false),
        });
        let weak = Arc::downgrade(&client);
        tokio::spawn(async move {
            let mut reader = BufReader::new(output);
            loop {
                let mut line = Vec::new();
                let read = (&mut reader)
                    .take(MAX_FRAME_BYTES + 1)
                    .read_until(b'\n', &mut line)
                    .await;
                let Some(client) = weak.upgrade() else { break };
                let error = match read {
                    Ok(0) => Some("Agent process disconnected".to_string()),
                    Ok(n) if n as u64 > MAX_FRAME_BYTES => {
                        Some("Agent JSON frame exceeds 16 MB".to_string())
                    }
                    Err(error) => Some(format!("Agent output read failed: {error}")),
                    _ => None,
                };
                if let Some(error) = error {
                    client.fail_pending(&error).await;
                    break;
                }
                if line.iter().all(u8::is_ascii_whitespace) {
                    continue;
                }
                match serde_json::from_slice::<Value>(&line) {
                    Ok(value) => client.dispatch(value).await,
                    Err(_) => {
                        client.fail_pending("Agent emitted invalid JSON").await;
                        break;
                    }
                }
            }
        });
        Ok(client)
    }
    async fn dispatch(&self, value: Value) {
        if value.get("method").is_none() {
            if let Some(id) = value.get("id").and_then(Value::as_u64) {
                if let Some(sender) = self.pending.lock().await.remove(&id) {
                    let result = if let Some(error) = value.get("error") {
                        Err(AgentError::msg(
                            error
                                .get("message")
                                .and_then(Value::as_str)
                                .unwrap_or("Agent RPC request failed"),
                        ))
                    } else {
                        Ok(value.get("result").cloned().unwrap_or(Value::Null))
                    };
                    let _ = sender.send(result);
                }
                return;
            }
        }
        let _ = self.events.send(value);
    }
    async fn fail_pending(&self, error: &str) {
        self.closed.store(true, Ordering::Release);
        for (_, sender) in self.pending.lock().await.drain() {
            let _ = sender.send(Err(AgentError::msg(error)));
        }
        let _ = self
            .events
            .send(json!({"method":"transport/closed","params":{"message":error}}));
    }
    async fn write(&self, message: Value) -> Result<()> {
        if self.closed.load(Ordering::Acquire) {
            return Err(AgentError::msg("Agent connection is closed"));
        }
        let mut frame = serde_json::to_vec(&message)?;
        frame.push(b'\n');
        let mut input = self.input.lock().await;
        let input = input
            .as_mut()
            .ok_or_else(|| AgentError::msg("Agent input is closed"))?;
        input.write_all(&frame).await?;
        input.flush().await?;
        Ok(())
    }
    pub async fn request(&self, method: &str, params: Value) -> Result<Value> {
        self.request_timeout(method, params, Duration::from_secs(30))
            .await
    }
    pub async fn request_long(&self, method: &str, params: Value) -> Result<Value> {
        self.request_timeout(method, params, Duration::from_secs(3600))
            .await
    }
    pub async fn request_timeout(
        &self,
        method: &str,
        params: Value,
        timeout: Duration,
    ) -> Result<Value> {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        let (sender, receiver) = oneshot::channel();
        self.pending.lock().await.insert(id, sender);
        if let Err(error) = self
            .write(json!({"jsonrpc":"2.0","id":id,"method":method,"params":params}))
            .await
        {
            self.pending.lock().await.remove(&id);
            return Err(error);
        }
        let result = tokio::time::timeout(timeout, receiver).await;
        self.pending.lock().await.remove(&id);
        match result {
            Ok(Ok(result)) => result,
            Ok(Err(_)) => Err(AgentError::msg("Agent request was cancelled")),
            Err(_) => Err(AgentError::msg(format!(
                "Agent request timed out: {method}"
            ))),
        }
    }
    pub async fn notify(&self, method: &str, params: Value) -> Result<()> {
        self.write(json!({"jsonrpc":"2.0","method":method,"params":params}))
            .await
    }
    pub async fn respond(&self, id: Value, result: Value) -> Result<()> {
        self.write(json!({"jsonrpc":"2.0","id":id,"result":result}))
            .await
    }
    pub async fn respond_error(&self, id: Value, code: i64, message: &str) -> Result<()> {
        self.write(json!({"jsonrpc":"2.0","id":id,"error":{"code":code,"message":message}}))
            .await
    }
    pub fn subscribe(&self) -> broadcast::Receiver<Value> {
        self.events.subscribe()
    }
    pub async fn shutdown(&self) -> Result<()> {
        self.input.lock().await.take();
        if let Some(mut child) = self.child.lock().await.take() {
            if tokio::time::timeout(Duration::from_secs(2), child.wait())
                .await
                .is_err()
            {
                let _ = child.kill().await;
                let _ = child.wait().await;
            }
        }
        self.fail_pending("Agent connection disposed").await;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn python() -> std::path::PathBuf {
        std::env::var_os("FRAME_TEST_PYTHON")
            .unwrap_or_else(|| "python".into())
            .into()
    }
    #[tokio::test]
    async fn process_rpc_routes_out_of_order_responses_notifications_and_server_requests() {
        let config = ConnectorConfig { executable: Some(python()), args: vec!["-u".into(), "-c".into(), "import sys,json\na=json.loads(sys.stdin.readline()); b=json.loads(sys.stdin.readline()); print(json.dumps({'method':'notice','params':{}}),flush=True); print(json.dumps({'id':b['id'],'result':'second'}),flush=True); print(json.dumps({'id':a['id'],'result':'first'}),flush=True); sys.stdin.read()".into()], ..Default::default() };
        let client = RpcClient::spawn(&config, "unused", &[]).await.unwrap();
        let mut events = client.subscribe();
        let (first, second) = tokio::join!(
            client.request("a", json!({})),
            client.request("b", json!({}))
        );
        assert_eq!(first.unwrap(), "first");
        assert_eq!(second.unwrap(), "second");
        assert_eq!(events.recv().await.unwrap()["method"], "notice");
        client.shutdown().await.unwrap();
    }
    #[tokio::test]
    async fn disconnect_and_malformed_frames_fail_pending_calls() {
        for script in [
            "import sys; sys.stdin.readline()",
            "import sys; sys.stdin.readline(); print('not-json',flush=True)",
        ] {
            let config = ConnectorConfig {
                executable: Some(python()),
                args: vec!["-u".into(), "-c".into(), script.into()],
                ..Default::default()
            };
            let client = RpcClient::spawn(&config, "unused", &[]).await.unwrap();
            assert!(client.request("test", json!({})).await.is_err());
            client.shutdown().await.unwrap();
        }
    }
}
