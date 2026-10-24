use crate::{rpc::RpcClient, types::*};
use async_trait::async_trait;
use serde_json::{json, Value};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tokio::sync::OnceCell;

pub struct ClaudeConnector {
    config: ConnectorConfig,
    rpc: OnceCell<Arc<RpcClient>>,
    disposed: AtomicBool,
}
impl ClaudeConnector {
    pub fn new(config: ConnectorConfig) -> Self {
        Self {
            config,
            rpc: OnceCell::new(),
            disposed: AtomicBool::new(false),
        }
    }
    async fn connection(&self) -> Result<&Arc<RpcClient>> {
        if self.disposed.load(Ordering::Acquire) {
            return Err(AgentError::msg("Claude connector disposed"));
        }
        self.rpc
            .get_or_try_init(|| async {
                let mut config = self.config.clone();
                config.executable = Some(
                    config
                        .python
                        .clone()
                        .or(config.executable.clone())
                        .unwrap_or_else(|| "python".into()),
                );
                let helper = config.helper.clone().unwrap_or_else(|| {
                    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                        .join("python/frame_claude_agent.py")
                });
                if config.args.is_empty() {
                    config.args = vec!["-u".into(), helper.to_string_lossy().into_owned()];
                }
                let rpc = RpcClient::spawn(&config, "python", &[]).await?;
                if let Err(error) = rpc.request("initialize", json!({})).await {
                    let _ = rpc.shutdown().await;
                    return Err(error);
                }
                Ok(rpc)
            })
            .await
    }
}
#[async_trait]
impl AgentConnector for ClaudeConnector {
    fn provider(&self) -> Provider {
        Provider::Claude
    }
    fn capabilities(&self) -> Capabilities {
        Capabilities {
            resume: true,
            list_sessions: true,
            approvals: true,
            questions: true,
            tools: true,
            artifacts: false,
        }
    }
    async fn create_session(&self, options: SessionOptions) -> Result<SessionInfo> {
        let value = self
            .connection()
            .await?
            .request("session/create", serde_json::to_value(options)?)
            .await?;
        Ok(serde_json::from_value(value)?)
    }
    async fn list_sessions(&self) -> Result<Vec<SessionInfo>> {
        Ok(serde_json::from_value(
            self.connection()
                .await?
                .request("session/list", json!({}))
                .await?,
        )?)
    }
    async fn send(&self, session: &str, prompt: Prompt, sink: EventSink) -> Result<()> {
        let rpc = self.connection().await?;
        let mut events = rpc.subscribe();
        let request = rpc.request_long(
            "turn/send",
            json!({"sessionId":session,"turnId":prompt.turn_id,"text":prompt.text}),
        );
        tokio::pin!(request);
        loop {
            tokio::select! {biased;
                event=events.recv()=>{
                    let value=event.map_err(|e|AgentError::msg(format!("Claude helper event stream failed: {e}")))?;
                    if value["method"]=="transport/closed" {return Err(AgentError::msg("Claude helper disconnected"));}
                    if value["method"]!="event" {continue;}
                    let event:AgentEvent=serde_json::from_value(value["params"].clone())?;
                    if event.session_id!=session||event.turn_id!=prompt.turn_id {continue;}
                    let done=matches!(event.event,EventKind::Completed{..});let _=sink.send(event);
                    if done {let _=request.await?;return Ok(());}
                },
                result=&mut request=>{result?;return Ok(());}
            }
        }
    }
    async fn respond(
        &self,
        session: &str,
        request_id: &str,
        response: InteractionResponse,
    ) -> Result<()> {
        self.connection()
            .await?
            .request(
                "interaction/respond",
                json!({"sessionId":session,"requestId":request_id,"response":response}),
            )
            .await?;
        Ok(())
    }
    async fn cancel(&self, session: &str) -> Result<()> {
        if let Some(rpc) = self.rpc.get() {
            rpc.request("turn/cancel", json!({"sessionId":session}))
                .await?;
        }
        Ok(())
    }
    async fn dispose(&self) -> Result<()> {
        self.disposed.store(true, Ordering::Release);
        if let Some(rpc) = self.rpc.get() {
            let _ = tokio::time::timeout(
                std::time::Duration::from_millis(500),
                rpc.request("shutdown", Value::Null),
            )
            .await;
            rpc.shutdown().await?;
        }
        Ok(())
    }
}
