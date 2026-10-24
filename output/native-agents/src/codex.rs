use crate::{rpc::RpcClient, types::*};
use async_trait::async_trait;
use serde_json::{json, Value};
use std::{
    collections::{HashMap, HashSet},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
};
use tokio::sync::{Mutex, OnceCell};

struct Pending {
    id: Value,
    questions: Option<Vec<Question>>,
    permissions: Option<Value>,
}
pub struct CodexConnector {
    config: ConnectorConfig,
    rpc: OnceCell<Arc<RpcClient>>,
    pending: Mutex<HashMap<(String, String), Pending>>,
    turns: Mutex<HashMap<String, String>>,
    cancelled: Mutex<HashSet<String>>,
    disposed: AtomicBool,
}
impl CodexConnector {
    pub fn new(config: ConnectorConfig) -> Self {
        Self {
            config,
            rpc: OnceCell::new(),
            pending: Mutex::new(HashMap::new()),
            turns: Mutex::new(HashMap::new()),
            cancelled: Mutex::new(HashSet::new()),
            disposed: AtomicBool::new(false),
        }
    }
    async fn connection(&self) -> Result<&Arc<RpcClient>> {
        if self.disposed.load(Ordering::Acquire) {
            return Err(AgentError::msg("Codex connector disposed"));
        }
        self.rpc.get_or_try_init(|| async {
            let rpc = RpcClient::spawn(&self.config, "codex", &["app-server"]).await?;
            if let Err(error) = rpc.request("initialize", json!({"clientInfo":{"name":"frame_agents","title":"Frame agents","version":"0.1.0"}})).await { let _ = rpc.shutdown().await; return Err(error); }
            rpc.notify("initialized", json!({})).await?; Ok(rpc)
        }).await
    }
    async fn cancel_requests(&self, session: &str) {
        let keys: Vec<_> = self
            .pending
            .lock()
            .await
            .keys()
            .filter(|(s, _)| s == session)
            .cloned()
            .collect();
        for (_, id) in keys {
            let _ = self
                .respond(session, &id, InteractionResponse::Cancel)
                .await;
        }
    }
}

fn str_at<'a>(value: &'a Value, name: &str) -> &'a str {
    value.get(name).and_then(Value::as_str).unwrap_or("")
}
fn questions_from(value: &Value) -> Vec<Question> {
    value
        .as_array()
        .into_iter()
        .flatten()
        .enumerate()
        .map(|(i, q)| Question {
            id: q["id"]
                .as_str()
                .map(str::to_owned)
                .unwrap_or_else(|| i.to_string()),
            text: str_at(q, "question").into(),
            choices: q["options"]
                .as_array()
                .into_iter()
                .flatten()
                .enumerate()
                .map(|(j, c)| Choice {
                    id: j.to_string(),
                    label: str_at(c, "label").into(),
                    description: c["description"].as_str().map(str::to_owned),
                })
                .collect(),
            multiple: false,
            allow_custom: q["isOther"].as_bool().unwrap_or(false) || !q["options"].is_array(),
        })
        .collect()
}
fn map_event(method: &str, params: &Value) -> Vec<EventKind> {
    let id = str_at(params, "itemId").to_string();
    match method {
        "item/agentMessage/delta" => vec![EventKind::Message {
            id,
            text: str_at(params, "delta").into(),
            phase: "intermediate".into(),
            delta: true,
        }],
        "item/reasoning/summaryTextDelta" => vec![EventKind::Thinking {
            id,
            text: str_at(params, "delta").into(),
            delta: true,
            finished: false,
        }],
        "item/commandExecution/outputDelta" => vec![EventKind::Metadata {
            name: "toolOutputDelta".into(),
            data: params.clone(),
        }],
        "item/started" | "item/completed" => {
            let item = &params["item"];
            let id = str_at(item, "id").into();
            let done = method == "item/completed";
            match str_at(item, "type") {
                "agentMessage" => {
                    if done {
                        vec![EventKind::Message {
                            id,
                            text: str_at(item, "text").into(),
                            phase: if str_at(item, "phase") == "commentary" {
                                "intermediate"
                            } else {
                                "final"
                            }
                            .into(),
                            delta: false,
                        }]
                    } else {
                        vec![]
                    }
                }
                "reasoning" => vec![EventKind::Thinking {
                    id,
                    text: item["summary"]
                        .as_array()
                        .map(|a| {
                            a.iter()
                                .filter_map(Value::as_str)
                                .collect::<Vec<_>>()
                                .join("\n")
                        })
                        .unwrap_or_default(),
                    delta: false,
                    finished: done,
                }],
                "commandExecution" | "fileChange" | "mcpToolCall" | "dynamicToolCall"
                | "webSearch" | "collabToolCall" => vec![EventKind::Activity {
                    id,
                    label: item["command"]
                        .as_str()
                        .or(item["tool"].as_str())
                        .unwrap_or(str_at(item, "type"))
                        .into(),
                    text: if str_at(item, "type") == "fileChange" {
                        item["changes"].to_string()
                    } else {
                        item["arguments"].as_str().unwrap_or("").into()
                    },
                    output: item["aggregatedOutput"]
                        .as_str()
                        .map(str::to_owned)
                        .unwrap_or_else(|| {
                            if item["result"].is_null() {
                                String::new()
                            } else {
                                item["result"].to_string()
                            }
                        }),
                    status: if !done {
                        "running"
                    } else if str_at(item, "status") == "failed"
                        || str_at(item, "status") == "declined"
                    {
                        "failed"
                    } else {
                        "completed"
                    }
                    .into(),
                }],
                _ => vec![EventKind::Metadata {
                    name: method.into(),
                    data: params.clone(),
                }],
            }
        }
        "turn/completed" => vec![EventKind::Completed {
            status: match str_at(&params["turn"], "status") {
                "interrupted" => "stopped",
                "failed" => "error",
                _ => "complete",
            }
            .into(),
            error: params["turn"]["error"]["message"]
                .as_str()
                .map(str::to_owned),
        }],
        "error" => vec![
            EventKind::Status {
                message: params["error"]["message"]
                    .as_str()
                    .unwrap_or("Codex reported an error")
                    .into(),
            },
            EventKind::Metadata {
                name: method.into(),
                data: params.clone(),
            },
        ],
        _ => vec![EventKind::Metadata {
            name: method.into(),
            data: params.clone(),
        }],
    }
}

#[async_trait]
impl AgentConnector for CodexConnector {
    fn provider(&self) -> Provider {
        Provider::Codex
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
        let rpc = self.connection().await?;
        let mut params =
            json!({"cwd":options.cwd,"approvalPolicy":"on-request","sandbox":"readOnly"});
        if let Some(model) = options.model {
            params["model"] = model.into();
        }
        if let Some(prompt) = options.system_prompt {
            params["developerInstructions"] = prompt.into();
        }
        let method = if let Some(id) = options.resume_id {
            params["threadId"] = id.into();
            params["excludeTurns"] = true.into();
            "thread/resume"
        } else {
            "thread/start"
        };
        let result = rpc.request(method, params).await?;
        let id = result["thread"]["id"]
            .as_str()
            .ok_or_else(|| AgentError::msg("Codex omitted thread ID"))?;
        Ok(SessionInfo {
            id: id.into(),
            title: result["thread"]["name"].as_str().map(str::to_owned),
            cwd: Some(options.cwd),
        })
    }
    async fn list_sessions(&self) -> Result<Vec<SessionInfo>> {
        let rpc = self.connection().await?;
        let mut cursor = Value::Null;
        let mut sessions = Vec::new();
        loop {
            let result = rpc
                .request("thread/list", json!({"limit":100,"cursor":cursor}))
                .await?;
            for item in result["data"].as_array().into_iter().flatten() {
                if let Some(id) = item["id"].as_str() {
                    sessions.push(SessionInfo {
                        id: id.into(),
                        title: item["name"]
                            .as_str()
                            .or(item["preview"].as_str())
                            .map(str::to_owned),
                        cwd: item["cwd"].as_str().map(str::to_owned),
                    });
                }
            }
            let next = result["nextCursor"].clone();
            if next.is_null() {
                break;
            }
            if next == cursor {
                return Err(AgentError::msg("Codex repeated a history cursor"));
            }
            cursor = next;
        }
        Ok(sessions)
    }
    async fn send(&self, session: &str, prompt: Prompt, sink: EventSink) -> Result<()> {
        {
            let mut turns = self.turns.lock().await;
            if turns.contains_key(session) {
                return Err(AgentError::msg("Codex session already has an active turn"));
            }
            self.cancelled.lock().await.remove(session);
            turns.insert(session.into(), String::new());
        }
        let outcome = async {
            let rpc = self.connection().await?;
            let mut events = rpc.subscribe();
            let result = rpc
                .request(
                    "turn/start",
                    json!({"threadId":session,"input":[{"type":"text","text":prompt.text}]}),
                )
                .await?;
            let turn = result["turn"]["id"]
                .as_str()
                .ok_or_else(|| AgentError::msg("Codex omitted turn ID"))?
                .to_string();
            let interrupted = {
                let mut turns = self.turns.lock().await;
                turns.insert(session.into(), turn.clone());
                self.cancelled.lock().await.remove(session)
            };
            if interrupted {
                rpc.request("turn/interrupt", json!({"threadId":session,"turnId":turn}))
                    .await?;
            }
            loop {
                let message = events
                    .recv()
                    .await
                    .map_err(|e| AgentError::msg(format!("Codex event stream failed: {e}")))?;
                let method = str_at(&message, "method");
                let params = &message["params"];
                if method == "transport/closed" {
                    return Err(AgentError::msg("Codex process disconnected"));
                }
                if params["threadId"].as_str() != Some(session) {
                    continue;
                }
                if params["turnId"].as_str().is_some_and(|id| id != turn) {
                    continue;
                }
                if let Some(id) = message.get("id") {
                    let request_id = id.to_string();
                    let questions = if method == "item/tool/requestUserInput" {
                        Some(questions_from(&params["questions"]))
                    } else {
                        None
                    };
                    let permissions = method == "item/permissions/requestApproval";
                    if let Some(ref questions) = questions {
                        if params["questions"]
                            .as_array()
                            .is_some_and(|q| q.iter().any(|q| q["isSecret"] == true))
                        {
                            rpc.respond_error(
                                id.clone(),
                                -32602,
                                "Secret input requires a dedicated host UI",
                            )
                            .await?;
                            continue;
                        }
                        self.pending.lock().await.insert(
                            (session.into(), request_id.clone()),
                            Pending {
                                id: id.clone(),
                                questions: Some(questions.clone()),
                                permissions: None,
                            },
                        );
                        emit(
                            &sink,
                            session,
                            &prompt.turn_id,
                            EventKind::Questions {
                                request_id,
                                text: "Codex needs your input".into(),
                                questions: questions.clone(),
                            },
                        );
                    } else if method == "item/commandExecution/requestApproval"
                        || method == "item/fileChange/requestApproval"
                        || permissions
                    {
                        self.pending.lock().await.insert(
                            (session.into(), request_id.clone()),
                            Pending {
                                id: id.clone(),
                                questions: None,
                                permissions: permissions.then(|| params["permissions"].clone()),
                            },
                        );
                        emit(
                            &sink,
                            session,
                            &prompt.turn_id,
                            EventKind::Approval {
                                request_id,
                                text: params["command"]
                                    .as_str()
                                    .unwrap_or("Allow the requested operation?")
                                    .into(),
                                detail: Some(params.to_string()),
                            },
                        );
                    } else {
                        rpc.respond_error(id.clone(), -32601, "Unsupported Codex server request")
                            .await?;
                    }
                    continue;
                }
                let mapped = map_event(method, params);
                let completed = mapped
                    .iter()
                    .any(|e| matches!(e, EventKind::Completed { .. }));
                for event in mapped {
                    emit(&sink, session, &prompt.turn_id, event);
                }
                if completed {
                    break;
                }
            }
            Ok(())
        }
        .await;
        {
            let mut turns = self.turns.lock().await;
            turns.remove(session);
            self.cancelled.lock().await.remove(session);
        }
        self.cancel_requests(session).await;
        outcome
    }
    async fn respond(
        &self,
        session: &str,
        request_id: &str,
        response: InteractionResponse,
    ) -> Result<()> {
        let key = (session.to_string(), request_id.to_string());
        let mut pending = self.pending.lock().await;
        let item = pending
            .get(&key)
            .ok_or_else(|| AgentError::msg("Unknown or settled Codex request"))?;
        let result = match (&item.questions, response) {
            (Some(questions), InteractionResponse::Answers { answers }) => {
                validate_answers(questions, &answers)?;
                let mut out = serde_json::Map::new();
                for answer in answers {
                    let q = questions
                        .iter()
                        .find(|q| q.id == answer.question_id)
                        .unwrap();
                    let mut labels: Vec<String> = answer
                        .choice_ids
                        .iter()
                        .map(|id| {
                            q.choices
                                .iter()
                                .find(|c| &c.id == id)
                                .unwrap()
                                .label
                                .clone()
                        })
                        .collect();
                    if let Some(custom) = answer.custom_text.filter(|s| !s.trim().is_empty()) {
                        labels.push(custom.trim().into());
                    }
                    out.insert(answer.question_id, json!({"answers":labels}));
                }
                json!({"answers":out})
            }
            (Some(_), InteractionResponse::Cancel) => json!({"answers":{}}),
            (None, InteractionResponse::Approval { decision })
                if decision == "allow" || decision == "deny" =>
            {
                if let Some(permissions) = &item.permissions {
                    if !permissions.is_object() {
                        return Err(AgentError::msg(
                            "Codex permission request omitted requested permission profile",
                        ));
                    }
                    json!({"permissions":if decision=="allow"{permissions.clone()}else{json!({})},"scope":"turn"})
                } else {
                    json!({"decision":if decision=="allow"{"accept"}else{"decline"}})
                }
            }
            (None, InteractionResponse::Cancel) => {
                if item.permissions.is_some() {
                    json!({"permissions":{},"scope":"turn"})
                } else {
                    json!({"decision":"cancel"})
                }
            }
            _ => return Err(AgentError::msg("Wrong Codex interaction response")),
        };
        let id = item.id.clone();
        self.connection().await?.respond(id, result).await?;
        pending.remove(&key);
        Ok(())
    }
    async fn cancel(&self, session: &str) -> Result<()> {
        self.cancel_requests(session).await;
        let turn = {
            let turns = self.turns.lock().await;
            match turns.get(session) {
                Some(turn) if turn.is_empty() => {
                    self.cancelled.lock().await.insert(session.into());
                    None
                }
                Some(turn) => Some(turn.clone()),
                None => None,
            }
        };
        if let Some(turn) = turn {
            self.connection()
                .await?
                .request("turn/interrupt", json!({"threadId":session,"turnId":turn}))
                .await?;
        }
        Ok(())
    }
    async fn dispose(&self) -> Result<()> {
        self.disposed.store(true, Ordering::Release);
        if let Some(rpc) = self.rpc.get() {
            rpc.shutdown().await?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn final_snapshots_promote_streamed_text_and_tool_outputs_keep_status() {
        assert!(matches!(
            &map_event(
                "item/agentMessage/delta",
                &json!({"itemId":"m","delta":"Hi"})
            )[0],
            EventKind::Message { delta: true, .. }
        ));
        assert!(
            matches!(&map_event("item/completed",&json!({"item":{"id":"m","type":"agentMessage","phase":"final_answer","text":"Hi"}}))[0],EventKind::Message{phase,delta:false,..} if phase=="final")
        );
        assert!(
            matches!(&map_event("turn/completed",&json!({"turn":{"status":"interrupted"}}))[0],EventKind::Completed{status,..} if status=="stopped")
        );
    }
    #[test]
    fn codex_questions_keep_provider_ids_and_map_choice_labels() {
        let q = questions_from(
            &json!([{"id":"style","question":"Style?","isOther":true,"options":[{"label":"Pixel","description":"Small"}]}]),
        );
        assert_eq!(q[0].id, "style");
        assert_eq!(q[0].choices[0].label, "Pixel");
        assert!(q[0].allow_custom);
    }
}

#[cfg(test)]
mod control_wire_tests {
    use super::*;
    use std::{path::PathBuf, time::Duration};
    async fn connector(scenario: &str) -> Arc<CodexConnector> {
        let python = std::env::var_os("FRAME_TEST_PYTHON").unwrap_or_else(|| "python".into());
        let fixture =
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/codex_control_peer.py");
        let connector = Arc::new(CodexConnector::new(ConnectorConfig {
            executable: Some(python.into()),
            args: vec![
                "-u".into(),
                fixture.to_string_lossy().into(),
                scenario.into(),
            ],
            ..Default::default()
        }));
        connector
            .create_session(SessionOptions {
                cwd: "/work".into(),
                model: None,
                system_prompt: None,
                resume_id: None,
            })
            .await
            .unwrap();
        connector
    }
    #[tokio::test]
    async fn cancellation_during_turn_start_interrupts_once_and_does_not_leak_to_next_turn() {
        let connector = connector("early").await;
        let mut wire = connector.rpc.get().unwrap().subscribe();
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        let sending = connector.clone();
        let send = tokio::spawn(async move {
            sending
                .send(
                    "s",
                    Prompt {
                        text: "first".into(),
                        turn_id: "host-1".into(),
                    },
                    sink,
                )
                .await
        });
        loop {
            let notification = tokio::time::timeout(Duration::from_secs(5), wire.recv())
                .await
                .unwrap()
                .unwrap();
            if notification["method"] == "test/turnStarting" {
                break;
            }
        }
        connector.cancel("s").await.unwrap();
        tokio::time::timeout(Duration::from_secs(5), send)
            .await
            .unwrap()
            .unwrap()
            .unwrap();
        let mut stopped = false;
        while let Ok(event) = events.try_recv() {
            if matches!(event.event,EventKind::Completed{status,..}if status=="stopped") {
                stopped = true;
            }
        }
        assert!(stopped);
        assert!(connector.cancelled.lock().await.is_empty());
        assert!(connector.turns.lock().await.is_empty());
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        tokio::time::timeout(
            Duration::from_secs(5),
            connector.send(
                "s",
                Prompt {
                    text: "second".into(),
                    turn_id: "host-2".into(),
                },
                sink,
            ),
        )
        .await
        .unwrap()
        .unwrap();
        assert!(
            matches!(events.recv().await.unwrap().event,EventKind::Completed{status,..}if status=="complete")
        );
        connector.dispose().await.unwrap();
    }
    #[tokio::test]
    async fn permission_approval_grants_exact_request_for_turn_and_deny_grants_nothing() {
        for decision in ["allow", "deny"] {
            let connector = connector(decision).await;
            let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
            let sending = connector.clone();
            let send = tokio::spawn(async move {
                sending
                    .send(
                        "s",
                        Prompt {
                            text: "permissions".into(),
                            turn_id: "host".into(),
                        },
                        sink,
                    )
                    .await
            });
            let request = match tokio::time::timeout(Duration::from_secs(5), events.recv())
                .await
                .unwrap()
                .unwrap()
                .event
            {
                EventKind::Approval { request_id, .. } => request_id,
                other => panic!("Unexpected {other:?}"),
            };
            connector
                .respond(
                    "s",
                    &request,
                    InteractionResponse::Approval {
                        decision: decision.into(),
                    },
                )
                .await
                .unwrap();
            tokio::time::timeout(Duration::from_secs(5), send)
                .await
                .unwrap()
                .unwrap()
                .unwrap();
            assert!(
                matches!(events.recv().await.unwrap().event,EventKind::Completed{status,..}if status=="complete")
            );
            connector.dispose().await.unwrap();
        }
    }
}
