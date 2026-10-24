//! Explicit GitHub Copilot SDK adapter. No runtime is started until a host operation.
use crate::types::*;
use async_trait::async_trait;
use futures_util::FutureExt;
use github_copilot_sdk::{
    self as sdk,
    handler::{PermissionHandler, PermissionResult, UserInputHandler, UserInputResponse},
};
use serde_json::Value;
#[cfg(test)]
use serde_json::json;
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
};
use tokio::sync::{oneshot, watch, Mutex, OnceCell};

#[derive(Clone)]
struct Turn {
    id: String,
    sink: EventSink,
    stop: watch::Sender<bool>,
}
struct Pending {
    session: String,
    question: Option<Question>,
    reply: oneshot::Sender<InteractionResponse>,
}
#[derive(Default)]
struct Hub {
    turns: HashMap<String, Turn>,
    pending: HashMap<String, Pending>,
}
struct Handlers(Arc<Mutex<Hub>>);
impl Handlers {
    async fn ask(
        &self,
        session: &str,
        request: &str,
        question: Option<Question>,
        event: EventKind,
    ) -> Option<InteractionResponse> {
        let (tx, rx) = oneshot::channel();
        {
            let mut hub = self.0.lock().await;
            let turn = hub.turns.get(session)?.clone();
            if turn.sink.is_closed() || *turn.stop.borrow() {
                return None;
            }
            if hub.pending.contains_key(request) {
                return None;
            }
            hub.pending.insert(
                request.into(),
                Pending {
                    session: session.into(),
                    question,
                    reply: tx,
                },
            );
            emit(&turn.sink, session, &turn.id, event);
        }
        rx.await.ok()
    }
}
#[async_trait]
impl PermissionHandler for Handlers {
    async fn handle(
        &self,
        session: sdk::SessionId,
        request: sdk::RequestId,
        data: sdk::PermissionRequestData,
    ) -> PermissionResult {
        let id = request.to_string();
        let raw = serde_json::to_value(&data).unwrap_or(Value::Null);
        let text = data
            .kind
            .as_ref()
            .and_then(|k| serde_json::to_value(k).ok())
            .and_then(|v| v.as_str().map(str::to_owned))
            .unwrap_or_else(|| "Permission required".into());
        match self
            .ask(
                &session.to_string(),
                &id,
                None,
                EventKind::Approval {
                    request_id: id.clone(),
                    text,
                    detail: Some(raw.to_string()),
                },
            )
            .await
        {
            Some(InteractionResponse::Approval { decision })
                if decision == "allow" || decision == "approve" || decision == "once" =>
            {
                PermissionResult::approve_once()
            }
            _ => PermissionResult::reject(None),
        }
    }
}
#[async_trait]
impl UserInputHandler for Handlers {
    async fn handle(
        &self,
        session: sdk::SessionId,
        text: String,
        choices: Option<Vec<String>>,
        allow: Option<bool>,
    ) -> Option<UserInputResponse> {
        let id = format!("input_{}", uuid::Uuid::new_v4().simple());
        let question = Question {
            id: "0".into(),
            text: text.clone(),
            choices: choices
                .unwrap_or_default()
                .into_iter()
                .map(|label| Choice {
                    id: label.clone(),
                    label,
                    description: None,
                })
                .collect(),
            multiple: false,
            allow_custom: allow.unwrap_or(true),
        };
        let response = self
            .ask(
                &session.to_string(),
                &id,
                Some(question.clone()),
                EventKind::Questions {
                    request_id: id.clone(),
                    text,
                    questions: vec![question.clone()],
                },
            )
            .await?;
        match response {
            InteractionResponse::Answers { answers } => validate_answer(&question, &answers).ok(),
            _ => None,
        }
    }
}
fn validate_answer(question: &Question, answers: &[Answer]) -> Result<UserInputResponse> {
    if answers.len() != 1 || answers[0].question_id != question.id {
        return Err(AgentError::msg(
            "Exactly one matching question answer is required",
        ));
    }
    let answer = &answers[0];
    if let Some(custom) = answer.custom_text.as_ref().filter(|s| !s.trim().is_empty()) {
        if !question.allow_custom || !answer.choice_ids.is_empty() {
            return Err(AgentError::msg(
                "Custom answer is unavailable or mixed with choices",
            ));
        }
        return Ok(UserInputResponse {
            answer: custom.clone(),
            was_freeform: true,
        });
    }
    if answer.choice_ids.len() != 1
        || !question
            .choices
            .iter()
            .any(|c| c.id == answer.choice_ids[0])
    {
        return Err(AgentError::msg("Select exactly one offered option"));
    }
    Ok(UserInputResponse {
        answer: answer.choice_ids[0].clone(),
        was_freeform: false,
    })
}
pub struct CopilotConnector {
    config: ConnectorConfig,
    client: OnceCell<sdk::Client>,
    lifecycle: Mutex<()>,
    sessions: Mutex<HashMap<String, Arc<sdk::session::Session>>>,
    hub: Arc<Mutex<Hub>>,
    disposed: AtomicBool,
}
impl CopilotConnector {
    pub fn new(config: ConnectorConfig) -> Self {
        Self {
            config,
            client: OnceCell::new(),
            lifecycle: Mutex::new(()),
            sessions: Mutex::new(HashMap::new()),
            hub: Arc::new(Mutex::new(Hub::default())),
            disposed: AtomicBool::new(false),
        }
    }
    fn check(&self) -> Result<()> {
        if self.disposed.load(Ordering::SeqCst) {
            Err(AgentError::msg("Copilot connector disposed"))
        } else {
            Ok(())
        }
    }
    fn client_options(&self) -> sdk::ClientOptions {
        let mut options = sdk::ClientOptions::default();
        options.program = sdk::CliProgram::Path(
            self.config
                .executable
                .clone()
                .unwrap_or_else(|| PathBuf::from("copilot")),
        );
        options.transport = sdk::Transport::Stdio;
        options.extra_args = self.config.args.clone();
        options.env = self
            .config
            .env
            .iter()
            .map(|(k, v)| (k.into(), v.into()))
            .collect();
        options
    }
    async fn client(&self) -> Result<sdk::Client> {
        let _guard = self.lifecycle.lock().await;
        self.check()?;
        let client = self
            .client
            .get_or_try_init(|| async {
                sdk::Client::start(self.client_options())
                    .await
                    .map_err(sdk_error)
            })
            .await?;
        Ok(client.clone())
    }
    async fn session(&self, id: &str) -> Result<Arc<sdk::session::Session>> {
        self.check()?;
        self.sessions
            .lock()
            .await
            .get(id)
            .cloned()
            .ok_or_else(|| AgentError::msg("Session must be created or resumed on this connector"))
    }
    async fn settle(&self, id: &str, stop: bool) {
        let mut hub = self.hub.lock().await;
        if stop {
            if let Some(turn) = hub.turns.get(id) {
                let _ = turn.stop.send(true);
            }
        }
        hub.pending.retain(|_, p| p.session != id);
    }
}
fn sdk_error(error: impl std::fmt::Display) -> AgentError {
    AgentError::msg(format!("Copilot SDK: {error}"))
}
#[async_trait]
impl AgentConnector for CopilotConnector {
    fn provider(&self) -> Provider {
        Provider::Copilot
    }
    fn capabilities(&self) -> Capabilities {
        Capabilities {
            resume: true,
            list_sessions: true,
            approvals: true,
            questions: true,
            tools: true,
            artifacts: true,
        }
    }
    async fn create_session(&self, options: SessionOptions) -> Result<SessionInfo> {
        self.check()?;
        if let Some(id) = &options.resume_id {
            if let Some(session) = self.sessions.lock().await.get(id) {
                return Ok(SessionInfo {
                    id: session.id().to_string(),
                    title: None,
                    cwd: Some(options.cwd),
                });
            }
        }
        let client = self.client().await?;
        let handlers = Arc::new(Handlers(self.hub.clone()));
        let system = options.system_prompt.as_ref().map(|s| {
            sdk::SystemMessageConfig::new()
                .with_mode("append")
                .with_content(s)
        });
        let session = if let Some(id) = &options.resume_id {
            let mut config = sdk::ResumeSessionConfig::new(sdk::SessionId::new(id))
                .with_streaming(true)
                .with_working_directory(&options.cwd)
                .with_permission_handler(handlers.clone())
                .with_user_input_handler(handlers.clone());
            config.model = options.model;
            config.system_message = system;
            client.resume_session(config).await.map_err(sdk_error)?
        } else {
            let mut config = sdk::SessionConfig::default()
                .with_streaming(true)
                .with_working_directory(&options.cwd)
                .with_permission_handler(handlers.clone())
                .with_user_input_handler(handlers);
            config.model = options.model;
            config.system_message = system;
            client.create_session(config).await.map_err(sdk_error)?
        };
        if self.disposed.load(Ordering::SeqCst) {
            session.stop_event_loop().await;
            return Err(AgentError::msg("Copilot connector disposed"));
        }
        let info = SessionInfo {
            id: session.id().to_string(),
            title: None,
            cwd: Some(options.cwd),
        };
        self.sessions
            .lock()
            .await
            .insert(info.id.clone(), Arc::new(session));
        Ok(info)
    }
    async fn list_sessions(&self) -> Result<Vec<SessionInfo>> {
        Ok(self
            .client()
            .await?
            .list_sessions(None)
            .await
            .map_err(sdk_error)?
            .into_iter()
            .map(|s| SessionInfo {
                id: s.session_id.to_string(),
                title: s.summary,
                cwd: None,
            })
            .collect())
    }
    async fn send(&self, id: &str, prompt: Prompt, sink: EventSink) -> Result<()> {
        let session = self.session(id).await?;
        let (stop, mut stopped) = watch::channel(false);
        {
            let mut hub = self.hub.lock().await;
            self.check()?;
            if hub.turns.contains_key(id) {
                return Err(AgentError::msg(
                    "Copilot session already has an active turn",
                ));
            }
            hub.turns.insert(
                id.into(),
                Turn {
                    id: prompt.turn_id.clone(),
                    sink: sink.clone(),
                    stop,
                },
            );
        }
        let mut subscription = session.subscribe();
        let result = tokio::select! {
            _=stopped.changed()=>{emit(&sink,id,&prompt.turn_id,EventKind::Completed{status:"cancelled".into(),error:None});Ok(())},
            result=async {
                while let Some(startup) = subscription.recv().now_or_never() { let event=startup.map_err(sdk_error)?; emit(&sink,id,&prompt.turn_id,EventKind::Metadata{name:"copilot.bootstrap".into(),data:serde_json::to_value(&event)?}); }
                session.send(prompt.text.clone()).await.map_err(sdk_error)?;
                let mut mapping=Mapping::default();
                loop {let event=subscription.recv().await.map_err(sdk_error)?;let done=event.event_type=="session.idle" || event.event_type=="session.error";
                    for mapped in mapping.event(&event.event_type,&event.data,&event.id){emit(&sink,id,&prompt.turn_id,mapped);}
                    emit(&sink,id,&prompt.turn_id,EventKind::Metadata{name:"copilot.event".into(),data:serde_json::to_value(&event)?});
                    if done{return Ok(());}
                }
            }=>result,
        };
        self.settle(id, false).await;
        self.hub.lock().await.turns.remove(id);
        result
    }
    async fn respond(&self, id: &str, request: &str, response: InteractionResponse) -> Result<()> {
        self.check()?;
        let mut hub = self.hub.lock().await;
        let pending = hub
            .pending
            .get(request)
            .filter(|p| p.session == id)
            .ok_or_else(|| AgentError::msg("Unknown pending interaction"))?;
        match (&pending.question, &response) {
            (None, InteractionResponse::Approval { decision })
                if ["allow", "approve", "once", "reject", "deny"].contains(&decision.as_str()) => {}
            (Some(question), InteractionResponse::Answers { answers }) => {
                validate_answer(question, answers)?;
            }
            (_, InteractionResponse::Cancel) => {}
            _ => {
                return Err(AgentError::msg(
                    "Invalid response for pending Copilot interaction",
                ))
            }
        }
        hub.pending
            .remove(request)
            .unwrap()
            .reply
            .send(response)
            .map_err(|_| AgentError::msg("Interaction is no longer pending"))
    }
    async fn cancel(&self, id: &str) -> Result<()> {
        let session = self.session(id).await?;
        self.settle(id, true).await;
        session.abort().await.map_err(sdk_error)
    }
    async fn dispose(&self) -> Result<()> {
        let _guard = self.lifecycle.lock().await;
        if self.disposed.swap(true, Ordering::SeqCst) {
            return Ok(());
        }
        {
            let mut hub = self.hub.lock().await;
            for turn in hub.turns.values() {
                let _ = turn.stop.send(true);
            }
            hub.pending.clear();
        }
        let sessions: Vec<_> = self.sessions.lock().await.drain().map(|(_, s)| s).collect();
        for session in sessions {
            session.stop_event_loop().await;
        }
        if let Some(client) = self.client.get() {
            client.stop().await.map_err(sdk_error)?;
        }
        Ok(())
    }
}
#[derive(Default)]
struct Mapping {
    phases: HashMap<String, String>,
    messages: HashMap<String, String>,
    last_message: Option<String>,
    tools: HashMap<String, String>,
    outputs: HashMap<String, String>,
}
impl Mapping {
    fn event(&mut self, kind: &str, data: &Value, event_id: &str) -> Vec<EventKind> {
        let s = |key: &str| data[key].as_str().unwrap_or("").to_string();
        let mut out = vec![];
        match kind {
            "assistant.message_start" => {
                self.phases.insert(s("messageId"), s("phase"));
            }
            "assistant.message_delta" => {
                let id = s("messageId");
                let text = s("deltaContent");
                self.messages.entry(id.clone()).or_default().push_str(&text);
                self.last_message = Some(id.clone());
                out.push(EventKind::Message {
                    id: id.clone(),
                    text,
                    phase: phase(self.phases.get(&id).map(String::as_str)),
                    delta: true,
                });
            }
            "assistant.message" => {
                let id = s("messageId");
                let p = data["phase"].as_str();
                let intermediate = data["toolRequests"]
                    .as_array()
                    .is_some_and(|v| !v.is_empty());
                let message_phase = if p.is_none() && intermediate {
                    "intermediate".into()
                } else {
                    phase(p)
                };
                self.phases.insert(
                    id.clone(),
                    if p.is_none() && !intermediate {
                        String::new()
                    } else {
                        message_phase.clone()
                    },
                );
                self.messages.insert(id.clone(), s("content"));
                self.last_message = Some(id.clone());
                out.push(EventKind::Message {
                    id,
                    text: s("content"),
                    phase: message_phase,
                    delta: false,
                });
            }
            "assistant.reasoning_delta" | "assistant.reasoning" => out.push(EventKind::Thinking {
                id: s("reasoningId"),
                text: if kind.ends_with("delta") {
                    s("deltaContent")
                } else {
                    s("content")
                },
                delta: kind.ends_with("delta"),
                finished: !kind.ends_with("delta"),
            }),
            "tool.shell_output" => {
                let id = s("toolCallId");
                let output = self.outputs.entry(id.clone()).or_default();
                output.push_str(&s("text"));
                out.push(EventKind::Activity {
                    id: id.clone(),
                    label: self
                        .tools
                        .get(&id)
                        .cloned()
                        .unwrap_or_else(|| "Tool".into()),
                    text: String::new(),
                    output: output.clone(),
                    status: "running".into(),
                });
            }
            "tool.execution_start" => {
                let id = s("toolCallId");
                let label = s("toolName");
                self.tools.insert(id.clone(), label.clone());
                out.push(EventKind::Activity {
                    id,
                    label,
                    text: data["arguments"].to_string(),
                    output: String::new(),
                    status: "running".into(),
                });
            }
            "tool.execution_progress"
            | "tool.execution_partial_result"
            | "tool.execution_complete" => {
                let id = s("toolCallId");
                let complete = kind == "tool.execution_complete";
                out.push(EventKind::Activity {
                    id: id.clone(),
                    label: self
                        .tools
                        .get(&id)
                        .cloned()
                        .unwrap_or_else(|| "Tool".into()),
                    text: s("progressMessage"),
                    output: if complete {
                        data["result"]["content"]
                            .as_str()
                            .map(str::to_owned)
                            .unwrap_or_else(|| data["result"].to_string())
                    } else {
                        s("partialOutput")
                    },
                    status: if complete {
                        if data["success"] == false {
                            "failed"
                        } else {
                            "completed"
                        }
                    } else {
                        "running"
                    }
                    .into(),
                });
                if complete {
                    for edit in data["fileEdits"].as_array().unwrap_or(&vec![]) {
                        if let Some(path) = edit["path"].as_str() {
                            out.push(EventKind::Artifact {
                                id: format!("{id}:{path}"),
                                name: PathBuf::from(path)
                                    .file_name()
                                    .unwrap_or_default()
                                    .to_string_lossy()
                                    .into(),
                                url: None,
                                path: Some(path.into()),
                                mime_type: None,
                            });
                        }
                    }
                }
            }
            "session.idle" => {
                if let Some(id) = &self.last_message {
                    let known = self.phases.get(id).map(String::as_str);
                    if data["aborted"] != true
                        && !matches!(known, Some("intermediate") | Some("commentary"))
                    {
                        out.push(EventKind::Message {
                            id: id.clone(),
                            text: self.messages.get(id).cloned().unwrap_or_default(),
                            phase: "final".into(),
                            delta: false,
                        });
                    }
                }
                out.push(EventKind::Completed {
                    status: if data["aborted"] == true {
                        "cancelled"
                    } else {
                        "completed"
                    }
                    .into(),
                    error: None,
                });
            }
            "session.error" => out.push(EventKind::Completed {
                status: "failed".into(),
                error: Some(
                    data["message"]
                        .as_str()
                        .map(str::to_owned)
                        .unwrap_or_else(|| data.to_string()),
                ),
            }),
            "session.info" => out.push(EventKind::Status {
                message: data["message"].as_str().unwrap_or(event_id).into(),
            }),
            _ => {}
        }
        out
    }
}
fn phase(value: Option<&str>) -> String {
    match value {
        Some("final_answer") | Some("final") | Some("response") | Some("answer") => "final".into(),
        Some("commentary") | Some("thinking") | Some("intermediate") => "intermediate".into(),
        Some(_) => "intermediate".into(),
        _ => "intermediate".into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn question() -> Question {
        Question {
            id: "0".into(),
            text: "Pick".into(),
            choices: vec![Choice {
                id: "A".into(),
                label: "A".into(),
                description: None,
            }],
            multiple: false,
            allow_custom: false,
        }
    }
    #[test]
    fn rejects_unknown_and_custom_answers() {
        let q = question();
        assert!(validate_answer(
            &q,
            &[Answer {
                question_id: "0".into(),
                choice_ids: vec!["B".into()],
                custom_text: None
            }]
        )
        .is_err());
        assert!(validate_answer(
            &q,
            &[Answer {
                question_id: "0".into(),
                choice_ids: vec![],
                custom_text: Some("custom".into())
            }]
        )
        .is_err());
    }
    #[test]
    fn preserves_intermediate_and_final_phases() {
        let mut m = Mapping::default();
        let result = m.event(
            "assistant.message",
            &json!({"messageId":"m","content":"plan","phase":"commentary"}),
            "e",
        );
        assert!(matches!(&result[0],EventKind::Message{phase,..}if phase=="intermediate"));
        let done = m.event("session.idle", &json!({}), "e");
        assert_eq!(done.len(), 1);
        let result = m.event(
            "assistant.message",
            &json!({"messageId":"f","content":"answer","phase":"final_answer"}),
            "e",
        );
        assert!(matches!(&result[0],EventKind::Message{phase,..}if phase=="final"));
    }
    #[tokio::test]
    async fn construction_and_disposal_never_start_client() {
        let c = CopilotConnector::new(Default::default());
        assert!(c.client.get().is_none());
        c.dispose().await.unwrap();
        assert!(c.client.get().is_none());
        assert!(c.list_sessions().await.is_err());
    }
    #[tokio::test]
    async fn permission_handler_waits_and_rejects_when_cancelled() {
        let c = CopilotConnector::new(Default::default());
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        let (stop, _) = watch::channel(false);
        c.hub.lock().await.turns.insert(
            "s".into(),
            Turn {
                id: "t".into(),
                sink,
                stop,
            },
        );
        let handlers = Handlers(c.hub.clone());
        let task = tokio::spawn(async move {
            PermissionHandler::handle(
                &handlers,
                sdk::SessionId::new("s"),
                sdk::RequestId::new("r"),
                Default::default(),
            )
            .await
        });
        assert!(matches!(
            events.recv().await.unwrap().event,
            EventKind::Approval { .. }
        ));
        assert!(!task.is_finished());
        c.settle("s", true).await;
        let result = task.await.unwrap();
        assert!(format!("{result:?}").contains("Reject"));
    }
    #[tokio::test]
    async fn host_answers_callback_without_observer_subscription() {
        let c = CopilotConnector::new(Default::default());
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        let (stop, _) = watch::channel(false);
        c.hub.lock().await.turns.insert(
            "s".into(),
            Turn {
                id: "t".into(),
                sink,
                stop,
            },
        );
        let handlers = Handlers(c.hub.clone());
        let task = tokio::spawn(async move {
            UserInputHandler::handle(
                &handlers,
                sdk::SessionId::new("s"),
                "Pick".into(),
                Some(vec!["A".into()]),
                Some(false),
            )
            .await
        });
        let request = match events.recv().await.unwrap().event {
            EventKind::Questions { request_id, .. } => request_id,
            _ => panic!(),
        };
        c.respond(
            "s",
            &request,
            InteractionResponse::Answers {
                answers: vec![Answer {
                    question_id: "0".into(),
                    choice_ids: vec!["A".into()],
                    custom_text: None,
                }],
            },
        )
        .await
        .unwrap();
        let answer = task.await.unwrap().unwrap();
        assert_eq!(answer.answer, "A");
        assert!(!answer.was_freeform);
    }
}

#[cfg(test)]
mod stream_tests {
    use super::*;
    #[test]
    fn unphased_text_is_promoted_only_at_successful_idle() {
        let mut mapping = Mapping::default();
        let provisional = mapping.event(
            "assistant.message",
            &json!({"messageId":"m","content":"Answer"}),
            "e",
        );
        assert!(matches!(&provisional[0],EventKind::Message{phase,..}if phase=="intermediate"));
        let completed = mapping.event("session.idle", &json!({}), "e");
        assert!(
            matches!(&completed[0],EventKind::Message{text,phase,delta:false,..}if text=="Answer" && phase=="final")
        );
        let cancelled = mapping.event("session.idle", &json!({"aborted":true}), "e");
        assert_eq!(cancelled.len(), 1);
        assert!(matches!(&cancelled[0],EventKind::Completed{status,..}if status=="cancelled"));
    }
    #[test]
    fn shell_chunks_accumulate_and_file_edits_remain_paths() {
        let mut mapping = Mapping::default();
        mapping.event(
            "tool.shell_output",
            &json!({"toolCallId":"tool","text":"a"}),
            "e",
        );
        let second = mapping.event(
            "tool.shell_output",
            &json!({"toolCallId":"tool","text":"b"}),
            "e",
        );
        assert!(matches!(&second[0],EventKind::Activity{output,..}if output=="ab"));
        let complete=mapping.event("tool.execution_complete",&json!({"toolCallId":"tool","success":true,"fileEdits":[{"kind":"update","path":"/work/result.txt"}]}),"e");
        assert!(
            matches!(&complete[1],EventKind::Artifact{url:None,path:Some(path),..}if path=="/work/result.txt")
        );
    }
    #[tokio::test]
    async fn host_permission_decision_resolves_exact_request() {
        let connector = CopilotConnector::new(Default::default());
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        let (stop, _) = watch::channel(false);
        connector.hub.lock().await.turns.insert(
            "s".into(),
            Turn {
                id: "t".into(),
                sink,
                stop,
            },
        );
        let handlers = Handlers(connector.hub.clone());
        let pending = tokio::spawn(async move {
            PermissionHandler::handle(
                &handlers,
                sdk::SessionId::new("s"),
                sdk::RequestId::new("r"),
                Default::default(),
            )
            .await
        });
        events.recv().await.unwrap();
        assert!(connector
            .respond(
                "other",
                "r",
                InteractionResponse::Approval {
                    decision: "once".into()
                }
            )
            .await
            .is_err());
        connector
            .respond(
                "s",
                "r",
                InteractionResponse::Approval {
                    decision: "once".into(),
                },
            )
            .await
            .unwrap();
        assert!(format!("{:?}", pending.await.unwrap()).contains("ApproveOnce"));
        assert!(connector.hub.lock().await.pending.is_empty());
    }
}

#[cfg(test)]
mod canonical_wire_tests {
    use super::*;
    #[tokio::test]
    async fn chat_allow_and_deny_resolve_real_sdk_permission_handler() {
        for (decision, expected) in [("allow", "ApproveOnce"), ("deny", "Reject")] {
            let connector = CopilotConnector::new(Default::default());
            let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
            let (stop, _) = watch::channel(false);
            connector.hub.lock().await.turns.insert(
                "s".into(),
                Turn {
                    id: "t".into(),
                    sink,
                    stop,
                },
            );
            let handlers = Handlers(connector.hub.clone());
            let pending = tokio::spawn(async move {
                PermissionHandler::handle(
                    &handlers,
                    sdk::SessionId::new("s"),
                    sdk::RequestId::new("r"),
                    Default::default(),
                )
                .await
            });
            events.recv().await.unwrap();
            connector
                .respond(
                    "s",
                    "r",
                    InteractionResponse::Approval {
                        decision: decision.into(),
                    },
                )
                .await
                .unwrap();
            assert!(format!("{:?}", pending.await.unwrap()).contains(expected));
        }
    }
    #[test]
    fn provider_phases_always_normalize_to_public_contract() {
        for (provider, expected) in [
            ("answer", "final"),
            ("final_answer", "final"),
            ("response", "final"),
            ("final", "final"),
            ("commentary", "intermediate"),
            ("future_phase", "intermediate"),
        ] {
            assert_eq!(phase(Some(provider)), expected);
            let mut mapping = Mapping::default();
            let events = mapping.event(
                "assistant.message",
                &json!({"messageId":"m","content":"Text","phase":provider}),
                "e",
            );
            assert!(matches!(&events[0],EventKind::Message{phase,..}if phase==expected));
        }
    }
}
