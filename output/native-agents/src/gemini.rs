//! Gemini CLI's official ACP v1 stdio transport. No process is started by construction.
use crate::{rpc::RpcClient, types::*};
use async_trait::async_trait;
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
};
use tokio::sync::{Mutex, OnceCell};

type Active = Arc<Mutex<HashMap<String, (String, EventSink)>>>;
struct Permission {
    session: String,
    id: Value,
    options: Vec<Value>,
}
struct TurnGuard {
    active: Active,
    pending: Arc<Mutex<HashMap<String, Permission>>>,
    rpc: Arc<RpcClient>,
    session: String,
    turn: String,
}
impl Drop for TurnGuard {
    fn drop(&mut self) {
        let active = self.active.clone();
        let pending = self.pending.clone();
        let rpc = self.rpc.clone();
        let session = self.session.clone();
        let turn = self.turn.clone();
        if let Ok(runtime) = tokio::runtime::Handle::try_current() {
            runtime.spawn(async move {
                let mut active = active.lock().await;
                if active.get(&session).is_some_and(|(id, _)| id == &turn) {
                    active.remove(&session);
                    drop(active);
                    let _ = rpc
                        .notify("session/cancel", json!({"sessionId":session}))
                        .await;
                    let mut pending = pending.lock().await;
                    let keys: Vec<_> = pending
                        .iter()
                        .filter(|(_, p)| p.session == session)
                        .map(|(key, _)| key.clone())
                        .collect();
                    for key in keys {
                        if let Some(permission) = pending.remove(&key) {
                            let _ = rpc
                                .respond(permission.id, json!({"outcome":{"outcome":"cancelled"}}))
                                .await;
                        }
                    }
                }
            });
        }
    }
}
pub struct GeminiConnector {
    config: ConnectorConfig,
    rpc: OnceCell<Arc<RpcClient>>,
    active: Active,
    pending: Arc<Mutex<HashMap<String, Permission>>>,
    sessions: Mutex<HashMap<String, SessionInfo>>,
    load: AtomicBool,
    closed: AtomicBool,
}
impl GeminiConnector {
    pub fn new(config: ConnectorConfig) -> Self {
        Self {
            config,
            rpc: OnceCell::new(),
            active: Arc::default(),
            pending: Arc::default(),
            sessions: Mutex::default(),
            load: AtomicBool::new(false),
            closed: AtomicBool::new(false),
        }
    }
    async fn client(&self) -> Result<&Arc<RpcClient>> {
        if self.closed.load(Ordering::SeqCst) {
            return Err(AgentError::msg("Gemini connector disposed"));
        }
        let rpc = self.rpc.get_or_try_init(|| async {
            let rpc = RpcClient::spawn(&self.config, "gemini", &["--acp"]).await?;
            let mut incoming = rpc.subscribe();
            let client = Arc::downgrade(&rpc);
            let active = self.active.clone();
            let pending = self.pending.clone();
            tokio::spawn(async move {
                while let Ok(message) = incoming.recv().await {
                    let Some(rpc) = client.upgrade() else { break };
                    let Some(id) = message.get("id").cloned() else { continue };
                    let Some(method) = message["method"].as_str() else { continue };
                    let params = &message["params"];
                    let session = params["sessionId"].as_str().unwrap_or("");
                    if method == "session/request_permission" {
                        let target = active.lock().await.get(session).cloned();
                        if let Some((turn, sink)) = target {
                            let request_id = id.to_string();
                            pending.lock().await.insert(request_id.clone(), Permission { session: session.into(), id, options: params["options"].as_array().cloned().unwrap_or_default() });
                            emit(&sink, session, &turn, EventKind::Metadata { name: "gemini.permission".into(), data: params.clone() });
                            emit(&sink, session, &turn, EventKind::Approval { request_id, text: params["toolCall"]["title"].as_str().unwrap_or("Allow tool call?").into(), detail: Some(params.to_string()) });
                        } else { let _ = rpc.respond(id, json!({"outcome":{"outcome":"cancelled"}})).await; }
                    } else { let _ = rpc.respond_error(id, -32601, "Unsupported ACP client method").await; }
                }
            });
            let result = rpc.request("initialize", json!({"protocolVersion":1,"clientCapabilities":{},"clientInfo":{"name":"frame-native-agents","version":env!("CARGO_PKG_VERSION")}})).await;
            match result {
                Ok(result) if result["protocolVersion"] == 1 => { self.load.store(result["agentCapabilities"]["loadSession"].as_bool().unwrap_or(false), Ordering::SeqCst); Ok(rpc) }
                Ok(_) => { let _ = rpc.shutdown().await; Err(AgentError::msg("Gemini negotiated unsupported ACP version")) }
                Err(error) => { let _ = rpc.shutdown().await; Err(error) }
            }
        }).await?;
        if self.closed.load(Ordering::SeqCst) {
            let _ = rpc.shutdown().await;
            return Err(AgentError::msg("Gemini connector disposed"));
        }
        Ok(rpc)
    }
    async fn clear_permissions(&self, rpc: &RpcClient, session: &str) {
        let mut pending = self.pending.lock().await;
        let keys: Vec<_> = pending
            .iter()
            .filter(|(_, p)| p.session == session)
            .map(|(k, _)| k.clone())
            .collect();
        for key in keys {
            if let Some(p) = pending.remove(&key) {
                let _ = rpc
                    .respond(p.id, json!({"outcome":{"outcome":"cancelled"}}))
                    .await;
            }
        }
    }
}
fn normalize(update: &Value, turn: &str) -> EventKind {
    let kind = update["sessionUpdate"].as_str().unwrap_or("unknown");
    let text = update["content"]["text"].as_str();
    match kind {
        "agent_message_chunk" if text.is_some() => EventKind::Message {
            id: format!("{turn}:message"),
            text: text.unwrap().into(),
            phase: "final".into(),
            delta: true,
        },
        "agent_thought_chunk" if text.is_some() => EventKind::Thinking {
            id: format!("{turn}:thought"),
            text: text.unwrap().into(),
            delta: true,
            finished: false,
        },
        "tool_call" | "tool_call_update" => EventKind::Activity {
            id: update["toolCallId"].as_str().unwrap_or("tool").into(),
            label: update["title"].as_str().unwrap_or("").into(),
            text: update["rawInput"]
                .as_str()
                .map(str::to_owned)
                .unwrap_or_else(|| {
                    update
                        .get("rawInput")
                        .map(Value::to_string)
                        .unwrap_or_default()
                }),
            output: update
                .get("content")
                .map(Value::to_string)
                .unwrap_or_default(),
            status: update["status"].as_str().unwrap_or("pending").into(),
        },
        _ => EventKind::Metadata {
            name: format!("gemini.{kind}"),
            data: update.clone(),
        },
    }
}
#[async_trait]
impl AgentConnector for GeminiConnector {
    fn provider(&self) -> Provider {
        Provider::Gemini
    }
    fn capabilities(&self) -> Capabilities {
        Capabilities {
            resume: self.load.load(Ordering::SeqCst),
            approvals: true,
            tools: true,
            ..Default::default()
        }
    }
    async fn create_session(&self, options: SessionOptions) -> Result<SessionInfo> {
        if options.system_prompt.is_some() {
            return Err(AgentError::Unsupported("ACP system prompt override".into()));
        }
        let rpc = self.client().await?;
        let value = if let Some(id) = &options.resume_id {
            if !self.load.load(Ordering::SeqCst) {
                return Err(AgentError::Unsupported("Gemini session/load".into()));
            }
            rpc.request(
                "session/load",
                json!({"sessionId":id,"cwd":options.cwd,"mcpServers":[]}),
            )
            .await?;
            json!({"sessionId":id})
        } else {
            rpc.request("session/new", json!({"cwd":options.cwd,"mcpServers":[]}))
                .await?
        };
        let id = value["sessionId"]
            .as_str()
            .ok_or_else(|| AgentError::msg("ACP session response missing sessionId"))?
            .to_owned();
        if let Some(model) = options.model {
            rpc.request("session/set_model", json!({"sessionId":id,"modelId":model}))
                .await?;
        }
        let info = SessionInfo {
            id: id.clone(),
            title: None,
            cwd: Some(options.cwd),
        };
        self.sessions.lock().await.insert(id, info.clone());
        Ok(info)
    }
    async fn send(&self, session: &str, prompt: Prompt, sink: EventSink) -> Result<()> {
        let rpc = self.client().await?;
        if !self.sessions.lock().await.contains_key(session) {
            return Err(AgentError::msg("Unknown Gemini session"));
        }
        {
            let mut active = self.active.lock().await;
            if active.contains_key(session) {
                return Err(AgentError::msg("Gemini session already has an active turn"));
            }
            active.insert(session.into(), (prompt.turn_id.clone(), sink.clone()));
        }
        let _guard = TurnGuard {
            active: self.active.clone(),
            pending: self.pending.clone(),
            rpc: rpc.clone(),
            session: session.into(),
            turn: prompt.turn_id.clone(),
        };
        let mut updates = rpc.subscribe();
        let request = rpc.request_long(
            "session/prompt",
            json!({"sessionId":session,"prompt":[{"type":"text","text":prompt.text}]}),
        );
        tokio::pin!(request);
        let result = loop {
            tokio::select! {
                biased;
                update = updates.recv() => match update {
                    Ok(message) => if message["method"] == "session/update" && message["params"]["sessionId"] == session { let update = &message["params"]["update"]; emit(&sink, session, &prompt.turn_id, normalize(update, &prompt.turn_id)); if matches!(update["sessionUpdate"].as_str(), Some("tool_call" | "tool_call_update")) { emit(&sink, session, &prompt.turn_id, EventKind::Metadata { name: "gemini.tool".into(), data: update.clone() }); } },
                    Err(error) => break Err(AgentError::msg(format!("Gemini event stream lost: {error}"))),
                },
                result = &mut request => break result,
            }
        };
        if result.is_err() {
            let _ = rpc
                .notify("session/cancel", json!({"sessionId":session}))
                .await;
        }
        self.active.lock().await.remove(session);
        self.clear_permissions(rpc, session).await;
        match result {
            Ok(value) => {
                emit(
                    &sink,
                    session,
                    &prompt.turn_id,
                    EventKind::Completed {
                        status: value["stopReason"].as_str().unwrap_or("completed").into(),
                        error: None,
                    },
                );
                Ok(())
            }
            Err(error) => {
                emit(
                    &sink,
                    session,
                    &prompt.turn_id,
                    EventKind::Completed {
                        status: "failed".into(),
                        error: Some(error.to_string()),
                    },
                );
                Err(error)
            }
        }
    }
    async fn respond(
        &self,
        session: &str,
        request_id: &str,
        response: InteractionResponse,
    ) -> Result<()> {
        let rpc = self.client().await?;
        let mut pending = self.pending.lock().await;
        let permission = pending
            .get(request_id)
            .filter(|p| p.session == session)
            .ok_or_else(|| AgentError::msg("Unknown Gemini permission request"))?;
        let outcome = match response {
            InteractionResponse::Cancel => json!({"outcome":"cancelled"}),
            InteractionResponse::Approval { decision } => {
                let option = permission
                    .options
                    .iter()
                    .find(|v| v["optionId"] == decision)
                    .or_else(|| {
                        permission.options.iter().find(|v| match decision.as_str() {
                            "allow" | "approve" => v["kind"] == "allow_once",
                            "deny" | "reject" => v["kind"] == "reject_once",
                            _ => false,
                        })
                    })
                    .ok_or_else(|| {
                        AgentError::msg(
                            "Decision must match an advertised ACP optionId (or allow/deny)",
                        )
                    })?;
                json!({"outcome":"selected","optionId":option["optionId"]})
            }
            InteractionResponse::Answers { .. } => {
                return Err(AgentError::Unsupported(
                    "ACP elicitation was not negotiated".into(),
                ))
            }
        };
        rpc.respond(permission.id.clone(), json!({"outcome":outcome}))
            .await?;
        pending.remove(request_id);
        Ok(())
    }
    async fn cancel(&self, session: &str) -> Result<()> {
        let rpc = self.client().await?;
        rpc.notify("session/cancel", json!({"sessionId":session}))
            .await?;
        self.clear_permissions(rpc, session).await;
        Ok(())
    }
    async fn dispose(&self) -> Result<()> {
        self.closed.store(true, Ordering::SeqCst);
        if let Some(rpc) = self.rpc.get() {
            rpc.shutdown().await?;
        }
        self.pending.lock().await.clear();
        self.active.lock().await.clear();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn message_chunks_preserve_text_and_turn() {
        assert!(
            matches!(normalize(&json!({"sessionUpdate":"agent_message_chunk","content":{"type":"text","text":"hello"}}), "turn"), EventKind::Message { id, text, delta: true, .. } if id == "turn:message" && text == "hello")
        );
    }
    #[test]
    fn unknown_and_nontext_updates_preserve_original_payload() {
        let update =
            json!({"sessionUpdate":"agent_message_chunk","content":{"type":"image","data":"abc"}});
        assert!(matches!(normalize(&update,"t"),EventKind::Metadata {data,..} if data == update));
    }
    #[test]
    fn tool_updates_preserve_identity_and_status() {
        assert!(
            matches!(normalize(&json!({"sessionUpdate":"tool_call_update","toolCallId":"x","status":"completed","content":[]}),"t"),EventKind::Activity { id,status,..} if id == "x" && status == "completed")
        );
    }
    #[tokio::test]
    async fn construction_and_disposal_never_spawn() {
        let connector = GeminiConnector::new(ConnectorConfig {
            executable: Some("missing-program".into()),
            ..Default::default()
        });
        assert!(!connector.capabilities().questions);
        connector.dispose().await.unwrap();
        assert!(connector
            .create_session(SessionOptions {
                cwd: ".".into(),
                model: None,
                system_prompt: None,
                resume_id: None
            })
            .await
            .is_err());
    }
}

#[cfg(test)]
mod wire_tests {
    use super::*;
    #[tokio::test]
    async fn acp_streams_before_completion_and_waits_for_explicit_permission() {
        let directory = tempfile::tempdir().unwrap();
        let script = directory.path().join("fake_acp.py");
        std::fs::write(&script, r#"
import json, sys

def send(value):
    print(json.dumps(value), flush=True)

for line in sys.stdin:
    request = json.loads(line)
    method = request.get('method')
    if method == 'initialize':
        assert request['params']['clientCapabilities'] == {}
        send({'jsonrpc':'2.0','id':request['id'],'result':{'protocolVersion':1,'agentCapabilities':{'loadSession':True}}})
    elif method == 'session/new':
        send({'jsonrpc':'2.0','id':request['id'],'result':{'sessionId':'test-session'}})
    elif method == 'session/prompt':
        turn = request['id']
        send({'jsonrpc':'2.0','method':'session/update','params':{'sessionId':'other-session','update':{'sessionUpdate':'agent_message_chunk','content':{'type':'text','text':'wrong-session'}}}})
        send({'jsonrpc':'2.0','method':'session/update','params':{'sessionId':'test-session','update':{'sessionUpdate':'agent_message_chunk','content':{'type':'text','text':'streamed'}}}})
        send({'jsonrpc':'2.0','id':'unknown','method':'elicitation/create','params':{}})
        send({'jsonrpc':'2.0','id':'permission','method':'session/request_permission','params':{'sessionId':'test-session','toolCall':{'title':'Run test'},'options':[{'optionId':'allow-once','kind':'allow_once','name':'Allow once'}]}})
        received = set()
        while len(received) < 2:
            response = json.loads(sys.stdin.readline())
            received.add(response['id'])
            if response['id'] == 'unknown':
                assert response['error']['code'] == -32601
            else:
                assert response['result']['outcome'] == {'outcome':'selected','optionId':'allow-once'}
        send({'jsonrpc':'2.0','id':turn,'result':{'stopReason':'end_turn'}})
"#).unwrap();
        let connector = GeminiConnector::new(ConnectorConfig {
            executable: Some(
                std::env::var_os("FRAME_TEST_PYTHON")
                    .map(Into::into)
                    .unwrap_or_else(|| "python".into()),
            ),
            args: vec!["-u".into(), script.to_string_lossy().into()],
            ..Default::default()
        });
        let session = connector
            .create_session(SessionOptions {
                cwd: directory.path().to_string_lossy().into(),
                model: None,
                system_prompt: None,
                resume_id: None,
            })
            .await
            .unwrap();
        assert!(connector.capabilities().resume);
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        let sending = connector.send(
            &session.id,
            Prompt {
                text: "test".into(),
                turn_id: "turn".into(),
            },
            sink,
        );
        let interacting = async {
            let mut streamed = false;
            while let Some(event) = events.recv().await {
                assert_eq!(event.session_id, session.id);
                match event.event {
                    EventKind::Message { text, .. } => {
                        assert_eq!(text, "streamed");
                        streamed = true;
                    }
                    EventKind::Approval { request_id, .. } => {
                        connector
                            .respond(
                                &session.id,
                                &request_id,
                                InteractionResponse::Approval {
                                    decision: "allow".into(),
                                },
                            )
                            .await
                            .unwrap();
                    }
                    EventKind::Completed { status, .. } => {
                        assert_eq!(status, "end_turn");
                        assert!(streamed);
                        break;
                    }
                    _ => {}
                }
            }
        };
        tokio::time::timeout(std::time::Duration::from_secs(10), async {
            let (result, _) = tokio::join!(sending, interacting);
            result.unwrap();
        })
        .await
        .unwrap();
        connector.dispose().await.unwrap();
    }
}
