//! OpenCode's explicit HTTP/SSE connector. Construction never contacts or starts a server.
use crate::types::*;
use async_trait::async_trait;
use futures_util::StreamExt;
use reqwest::{Client, Method, RequestBuilder};
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
};
use tokio::sync::{watch, Mutex};

#[derive(Default)]
struct Sse {
    bytes: Vec<u8>,
    data: Vec<String>,
}
impl Sse {
    fn push(&mut self, bytes: &[u8]) -> Result<Vec<Value>> {
        self.bytes.extend_from_slice(bytes);
        if self.bytes.len() + self.data.iter().map(String::len).sum::<usize>() > 8 * 1024 * 1024 {
            return Err(AgentError::msg("OpenCode SSE frame exceeds 8 MiB"));
        }
        let mut events = vec![];
        while let Some(end) = self.bytes.iter().position(|b| *b == b'\n') {
            let line: Vec<_> = self.bytes.drain(..=end).collect();
            let line = std::str::from_utf8(&line)
                .map_err(|_| AgentError::msg("Invalid SSE UTF-8"))?
                .trim_end_matches(['\r', '\n']);
            if line.is_empty() {
                if !self.data.is_empty() {
                    events.push(serde_json::from_str(&self.data.join("\n"))?);
                    self.data.clear();
                }
            } else if let Some(data) = line.strip_prefix("data:") {
                self.data
                    .push(data.strip_prefix(' ').unwrap_or(data).into());
            }
        }
        Ok(events)
    }
}
#[derive(Clone)]
struct Pending {
    session: String,
    questions: Option<Vec<Question>>,
}
struct State {
    options: HashMap<String, SessionOptions>,
    active: HashMap<String, watch::Sender<bool>>,
    pending: HashMap<String, Pending>,
}
pub struct OpenCodeConnector {
    config: ConnectorConfig,
    client: Client,
    state: Arc<Mutex<State>>,
    disposed: AtomicBool,
}
impl OpenCodeConnector {
    pub fn new(config: ConnectorConfig) -> Self {
        Self {
            config,
            client: Client::new(),
            state: Arc::new(Mutex::new(State {
                options: HashMap::new(),
                active: HashMap::new(),
                pending: HashMap::new(),
            })),
            disposed: AtomicBool::new(false),
        }
    }
    fn check(&self) -> Result<()> {
        if self.disposed.load(Ordering::SeqCst) {
            Err(AgentError::msg("OpenCode connector disposed"))
        } else {
            Ok(())
        }
    }
    fn request(&self, method: Method, path: &str, cwd: Option<&str>) -> Result<RequestBuilder> {
        self.check()?;
        let mut url = reqwest::Url::parse(
            self.config
                .endpoint
                .as_deref()
                .unwrap_or("http://127.0.0.1:4096"),
        )
        .map_err(|e| AgentError::msg(e.to_string()))?;
        {
            let mut segments = url
                .path_segments_mut()
                .map_err(|_| AgentError::msg("Invalid OpenCode endpoint"))?;
            segments.pop_if_empty();
            for segment in path.trim_start_matches('/').split('/') {
                segments.push(segment);
            }
        }
        let mut req = self.client.request(method, url);
        if let Some(cwd) = cwd {
            req = req.query(&[("directory", cwd)]);
        }
        if let Some(token) = &self.config.bearer_token {
            req = req.bearer_auth(token);
        } else if let Some(password) = self.config.env.get("OPENCODE_SERVER_PASSWORD") {
            req = req.basic_auth(
                self.config
                    .env
                    .get("OPENCODE_SERVER_USERNAME")
                    .map(String::as_str)
                    .unwrap_or("opencode"),
                Some(password),
            );
        }
        Ok(req)
    }
    async fn options(&self, session: &str) -> Result<SessionOptions> {
        validate_id(session)?;
        self.state
            .lock()
            .await
            .options
            .get(session)
            .cloned()
            .ok_or_else(|| AgentError::msg("Session must be created or resumed on this connector"))
    }
    async fn event(
        &self,
        session: &str,
        turn: &str,
        sink: &EventSink,
        v: Value,
        parts: &mut HashMap<String, String>,
    ) -> Result<bool> {
        let p = &v["properties"];
        let sid = p["sessionID"]
            .as_str()
            .or_else(|| p["part"]["sessionID"].as_str())
            .or_else(|| p["info"]["sessionID"].as_str());
        if sid != Some(session) {
            return Ok(false);
        }
        emit(
            sink,
            session,
            turn,
            EventKind::Metadata {
                name: "opencode.event".into(),
                data: v.clone(),
            },
        );
        let s = |key: &str| p[key].as_str().unwrap_or("").to_string();
        match v["type"].as_str().unwrap_or("") {
            "message.part.delta" => {
                if p["messageID"]
                    .as_str()
                    .and_then(|id| parts.get(&format!("message:{id}")))
                    .map(String::as_str)
                    == Some("user")
                {
                    return Ok(false);
                }
                let id = s("partID");
                let text = s("delta");
                if p["field"] == "text" {
                    if parts.get(&id).map(String::as_str) == Some("reasoning") {
                        emit(
                            sink,
                            session,
                            turn,
                            EventKind::Thinking {
                                id,
                                text,
                                delta: true,
                                finished: false,
                            },
                        );
                    } else {
                        emit(
                            sink,
                            session,
                            turn,
                            EventKind::Message {
                                id,
                                text,
                                phase: "final".into(),
                                delta: true,
                            },
                        );
                    }
                }
            }
            "message.updated" => {
                if let (Some(id), Some(role)) =
                    (p["info"]["id"].as_str(), p["info"]["role"].as_str())
                {
                    parts.insert(format!("message:{id}"), role.into());
                }
            }
            "message.part.updated" => {
                let part = &p["part"];
                if part["messageID"]
                    .as_str()
                    .and_then(|id| parts.get(&format!("message:{id}")))
                    .map(String::as_str)
                    == Some("user")
                {
                    return Ok(false);
                }
                let id = part["id"].as_str().unwrap_or("").to_string();
                let kind = part["type"].as_str().unwrap_or("");
                parts.insert(id.clone(), kind.into());
                match kind {
                    "text" => emit(
                        sink,
                        session,
                        turn,
                        EventKind::Message {
                            id,
                            text: part["text"].as_str().unwrap_or("").into(),
                            phase: "final".into(),
                            delta: false,
                        },
                    ),
                    "reasoning" => emit(
                        sink,
                        session,
                        turn,
                        EventKind::Thinking {
                            id,
                            text: part["text"].as_str().unwrap_or("").into(),
                            delta: false,
                            finished: part["time"]["end"].is_number(),
                        },
                    ),
                    "tool" => {
                        let state = &part["state"];
                        emit(
                            sink,
                            session,
                            turn,
                            EventKind::Activity {
                                id,
                                label: part["tool"].as_str().unwrap_or("Tool").into(),
                                text: state["title"].as_str().unwrap_or("").into(),
                                output: state["output"]
                                    .as_str()
                                    .or_else(|| state["error"].as_str())
                                    .unwrap_or("")
                                    .into(),
                                status: state["status"].as_str().unwrap_or("pending").into(),
                            },
                        );
                    }
                    "file" => {
                        let raw = part["url"].as_str().unwrap_or("");
                        let path = part["source"]["path"].as_str().map(str::to_owned);
                        let url = reqwest::Url::parse(raw)
                            .ok()
                            .filter(|u| matches!(u.scheme(), "https" | "http"))
                            .map(|u| u.to_string());
                        emit(
                            sink,
                            session,
                            turn,
                            EventKind::Artifact {
                                id,
                                name: part["filename"].as_str().unwrap_or("File").into(),
                                url,
                                path,
                                mime_type: part["mime"].as_str().map(str::to_owned),
                            },
                        );
                    }
                    _ => {}
                }
            }
            "permission.asked" => {
                let id = s("id");
                self.state.lock().await.pending.insert(
                    id.clone(),
                    Pending {
                        session: session.into(),
                        questions: None,
                    },
                );
                emit(
                    sink,
                    session,
                    turn,
                    EventKind::Approval {
                        request_id: id,
                        text: s("permission"),
                        detail: Some(p.to_string()),
                    },
                );
            }
            "question.asked" => {
                let id = s("id");
                let mut questions = vec![];
                for (index, q) in p["questions"]
                    .as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .enumerate()
                {
                    questions.push(Question {
                        id: index.to_string(),
                        text: q["question"].as_str().unwrap_or("").into(),
                        choices: q["options"]
                            .as_array()
                            .unwrap_or(&vec![])
                            .iter()
                            .map(|o| Choice {
                                id: o["label"].as_str().unwrap_or("").into(),
                                label: o["label"].as_str().unwrap_or("").into(),
                                description: o["description"].as_str().map(str::to_owned),
                            })
                            .collect(),
                        multiple: q["multiple"].as_bool().unwrap_or(false),
                        allow_custom: q["custom"].as_bool().unwrap_or(true),
                    });
                }
                self.state.lock().await.pending.insert(
                    id.clone(),
                    Pending {
                        session: session.into(),
                        questions: Some(questions.clone()),
                    },
                );
                emit(
                    sink,
                    session,
                    turn,
                    EventKind::Questions {
                        request_id: id,
                        text: "OpenCode needs your input".into(),
                        questions,
                    },
                );
            }
            "session.idle" => {
                emit(
                    sink,
                    session,
                    turn,
                    EventKind::Completed {
                        status: "completed".into(),
                        error: None,
                    },
                );
                return Ok(true);
            }
            "session.error" => {
                emit(
                    sink,
                    session,
                    turn,
                    EventKind::Completed {
                        status: "failed".into(),
                        error: Some(p["error"].to_string()),
                    },
                );
                return Ok(true);
            }
            _ => {}
        }
        Ok(false)
    }
}
#[async_trait]
impl AgentConnector for OpenCodeConnector {
    fn provider(&self) -> Provider {
        Provider::Opencode
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
        let req = if let Some(id) = &options.resume_id {
            validate_id(id)?;
            self.request(Method::GET, &format!("session/{id}"), Some(&options.cwd))?
        } else {
            self.request(Method::POST, "session", Some(&options.cwd))?
                .json(&json!({}))
        };
        let v: Value = req.send().await?.error_for_status()?.json().await?;
        let info = session_info(&v)?;
        self.state
            .lock()
            .await
            .options
            .insert(info.id.clone(), options);
        Ok(info)
    }
    async fn list_sessions(&self) -> Result<Vec<SessionInfo>> {
        let v: Vec<Value> = self
            .request(Method::GET, "session", None)?
            .send()
            .await?
            .error_for_status()?
            .json()
            .await?;
        v.iter().map(session_info).collect()
    }
    async fn send(&self, session: &str, prompt: Prompt, sink: EventSink) -> Result<()> {
        let options = self.options(session).await?;
        let (stop, mut stopped) = watch::channel(false);
        {
            let mut state = self.state.lock().await;
            if state.active.contains_key(session) {
                return Err(AgentError::msg(
                    "OpenCode session already has an active turn",
                ));
            }
            state.active.insert(session.into(), stop);
        }
        let mut aborted = stopped.clone();
        let result = tokio::select! {
            _ = aborted.changed() => { emit(&sink,session,&prompt.turn_id,EventKind::Completed{status:"cancelled".into(),error:None}); Ok(()) },
            result = async {
            let response=self.request(Method::GET,"event",Some(&options.cwd))?.header("Accept","text/event-stream").send().await?.error_for_status()?;
            let mut stream=response.bytes_stream(); let mut parser=Sse::default(); let mut parts=HashMap::new();
            let message_id=format!("msg_{}",uuid::Uuid::new_v4().simple()); parts.insert(format!("message:{message_id}"),"user".into()); let mut body=json!({"messageID":message_id,"parts":[{"type":"text","text":prompt.text}]});
            if let Some(system)=&options.system_prompt {body["system"]=json!(system);}
            if let Some(model)=&options.model { let (provider,model)=model.split_once('/').ok_or_else(||AgentError::msg("OpenCode model must be providerID/modelID"))?; body["model"]=json!({"providerID":provider,"modelID":model}); }
            self.request(Method::POST,&format!("session/{session}/prompt_async"),Some(&options.cwd))?.json(&body).send().await?.error_for_status()?;
            loop { tokio::select! {
                _=stopped.changed()=> { emit(&sink,session,&prompt.turn_id,EventKind::Completed{status:"cancelled".into(),error:None}); return Ok(()); }
                chunk=stream.next()=> { match chunk { Some(chunk)=>for event in parser.push(&chunk?)? { if self.event(session,&prompt.turn_id,&sink,event,&mut parts).await? { return Ok(()); } }, None=>return Err(AgentError::msg("OpenCode event stream closed before session completion")) } }
            }}
        } => result,
        };
        let mut state = self.state.lock().await;
        state.active.remove(session);
        state.pending.retain(|_, p| p.session != session);
        result
    }
    async fn respond(
        &self,
        session: &str,
        request_id: &str,
        response: InteractionResponse,
    ) -> Result<()> {
        validate_id(request_id)?;
        let options = self.options(session).await?;
        let pending = self
            .state
            .lock()
            .await
            .pending
            .get(request_id)
            .cloned()
            .filter(|p| p.session == session)
            .ok_or_else(|| AgentError::msg("Unknown pending interaction"))?;
        let (path, body) = match (pending.questions, response) {
            (None, InteractionResponse::Approval { decision }) => {
                let decision = match decision.as_str() {
                    "allow" | "once" => "once",
                    "deny" | "reject" => "reject",
                    "always" => "always",
                    _ => return Err(AgentError::msg("Approval decision must be allow or deny")),
                };
                (
                    format!("permission/{request_id}/reply"),
                    json!({"reply":decision}),
                )
            }
            (None, InteractionResponse::Cancel) => (
                format!("permission/{request_id}/reply"),
                json!({"reply":"reject"}),
            ),
            (Some(_), InteractionResponse::Cancel) => {
                (format!("question/{request_id}/reject"), json!({}))
            }
            (Some(questions), InteractionResponse::Answers { answers }) => {
                if answers.len() != questions.len() {
                    return Err(AgentError::msg("Every question needs exactly one answer"));
                }
                let mut output = vec![];
                for q in questions {
                    let matching: Vec<_> =
                        answers.iter().filter(|a| a.question_id == q.id).collect();
                    if matching.len() != 1 {
                        return Err(AgentError::msg("Duplicate or missing question answer"));
                    }
                    let a = matching[0];
                    let mut selected = a.choice_ids.clone();
                    if selected
                        .iter()
                        .any(|id| !q.choices.iter().any(|c| &c.id == id))
                    {
                        return Err(AgentError::msg("Answer contains an unknown option"));
                    }
                    let mut unique = selected.clone();
                    unique.sort();
                    unique.dedup();
                    if unique.len() != selected.len() {
                        return Err(AgentError::msg("Duplicate selected option"));
                    }
                    if let Some(custom) = &a.custom_text {
                        if !q.allow_custom {
                            return Err(AgentError::msg("Custom answers are disabled"));
                        }
                        if !custom.trim().is_empty() {
                            selected.push(custom.clone());
                        }
                    }
                    if selected.is_empty() || (!q.multiple && selected.len() != 1) {
                        return Err(AgentError::msg("Invalid answer selection count"));
                    }
                    output.push(selected);
                }
                (
                    format!("question/{request_id}/reply"),
                    json!({"answers":output}),
                )
            }
            _ => {
                return Err(AgentError::msg(
                    "Interaction response does not match request",
                ))
            }
        };
        self.request(Method::POST, &path, Some(&options.cwd))?
            .json(&body)
            .send()
            .await?
            .error_for_status()?;
        self.state.lock().await.pending.remove(request_id);
        Ok(())
    }
    async fn cancel(&self, session: &str) -> Result<()> {
        let options = self.options(session).await?;
        self.request(
            Method::POST,
            &format!("session/{session}/abort"),
            Some(&options.cwd),
        )?
        .send()
        .await?
        .error_for_status()?;
        if let Some(stop) = self.state.lock().await.active.get(session) {
            let _ = stop.send(true);
        }
        Ok(())
    }
    async fn dispose(&self) -> Result<()> {
        self.disposed.store(true, Ordering::SeqCst);
        let mut state = self.state.lock().await;
        for (_, stop) in state.active.drain() {
            let _ = stop.send(true);
        }
        state.pending.clear();
        state.options.clear();
        Ok(())
    }
}
fn validate_id(id: &str) -> Result<()> {
    if id.is_empty()
        || !id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-')
    {
        return Err(AgentError::msg("Invalid OpenCode identifier"));
    }
    Ok(())
}
fn session_info(v: &Value) -> Result<SessionInfo> {
    Ok(SessionInfo {
        id: v["id"]
            .as_str()
            .ok_or_else(|| AgentError::msg("OpenCode session response has no id"))?
            .into(),
        title: v["title"].as_str().map(str::to_owned),
        cwd: v["directory"].as_str().map(str::to_owned),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn sse_chunked_utf8_and_multiline() {
        let mut parser = Sse::default();
        let wire = "data: {\"type\":\"hello\",\r\ndata: \"text\":\"é\"}\r\n\r\n".as_bytes();
        let mut out = vec![];
        for byte in wire {
            out.extend(parser.push(&[*byte]).unwrap());
        }
        assert_eq!(out, vec![json!({"type":"hello","text":"é"})]);
    }
    #[test]
    fn sse_comments_and_multiple_events() {
        let mut p = Sse::default();
        assert_eq!(
            p.push(b": keepalive\n\ndata: {}\n\ndata: []\n\n").unwrap(),
            vec![json!({}), json!([])]
        );
    }
    #[tokio::test]
    async fn filters_sessions_and_maps_completion() {
        let c = OpenCodeConnector::new(Default::default());
        let (sink, mut rx) = tokio::sync::mpsc::unbounded_channel();
        let mut parts = HashMap::new();
        assert!(!c
            .event(
                "a",
                "t",
                &sink,
                json!({"type":"session.idle","properties":{"sessionID":"b"}}),
                &mut parts
            )
            .await
            .unwrap());
        assert!(rx.try_recv().is_err());
        assert!(c
            .event(
                "a",
                "t",
                &sink,
                json!({"type":"session.idle","properties":{"sessionID":"a"}}),
                &mut parts
            )
            .await
            .unwrap());
        assert!(matches!(
            rx.recv().await.unwrap().event,
            EventKind::Metadata { .. }
        ));
        assert!(matches!(
            rx.recv().await.unwrap().event,
            EventKind::Completed { .. }
        ));
    }
}

#[cfg(test)]
mod http_tests {
    use super::*;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    pub(super) async fn request(socket: &mut tokio::net::TcpStream) -> String {
        let mut bytes = Vec::new();
        loop {
            let mut buffer = [0; 1024];
            let count = socket.read(&mut buffer).await.unwrap();
            assert!(count > 0);
            bytes.extend_from_slice(&buffer[..count]);
            if let Some(end) = bytes.windows(4).position(|w| w == b"\r\n\r\n") {
                let headers = String::from_utf8_lossy(&bytes[..end]);
                let length = headers
                    .lines()
                    .find_map(|line| {
                        line.to_ascii_lowercase()
                            .strip_prefix("content-length:")
                            .map(|v| v.trim().parse::<usize>().unwrap())
                    })
                    .unwrap_or(0);
                if bytes.len() >= end + 4 + length {
                    return String::from_utf8(bytes).unwrap();
                }
            }
        }
    }
    #[tokio::test]
    async fn subscribes_before_prompt_and_waits_for_session_idle() {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let endpoint = format!("http://{}", listener.local_addr().unwrap());
        let server = tokio::spawn(async move {
            let (mut create, _) = listener.accept().await.unwrap();
            assert!(request(&mut create)
                .await
                .starts_with("POST /session?directory="));
            let body = r#"{"id":"ses_test","directory":"/work"}"#;
            create.write_all(format!("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",body.len(),body).as_bytes()).await.unwrap();
            drop(create);
            let (mut events, _) = listener.accept().await.unwrap();
            assert!(request(&mut events)
                .await
                .starts_with("GET /event?directory="));
            events.write_all(b"HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nConnection: close\r\n\r\ndata: {\"type\":\"server.connected\",\"properties\":{}}\n\n").await.unwrap();
            let (mut prompt, _) = listener.accept().await.unwrap();
            let req = request(&mut prompt).await;
            assert!(req.starts_with("POST /session/ses_test/prompt_async?directory="));
            assert!(req.contains("hello"));
            prompt
                .write_all(b"HTTP/1.1 204 No Content\r\nConnection: close\r\n\r\n")
                .await
                .unwrap();
            events.write_all(b"data: {\"type\":\"session.idle\",\"properties\":{\"sessionID\":\"ses_test\"}}\n\n").await.unwrap();
        });
        let connector = OpenCodeConnector::new(ConnectorConfig {
            endpoint: Some(endpoint),
            ..Default::default()
        });
        let session = connector
            .create_session(SessionOptions {
                cwd: "/work".into(),
                model: None,
                system_prompt: None,
                resume_id: None,
            })
            .await
            .unwrap();
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        tokio::time::timeout(
            std::time::Duration::from_secs(3),
            connector.send(
                &session.id,
                Prompt {
                    text: "hello".into(),
                    turn_id: "turn".into(),
                },
                sink,
            ),
        )
        .await
        .unwrap()
        .unwrap();
        let mut completed = false;
        while let Ok(event) = events.try_recv() {
            if matches!(event.event, EventKind::Completed { .. }) {
                completed = true;
            }
        }
        assert!(completed);
        server.await.unwrap();
        connector.dispose().await.unwrap();
    }
}

#[cfg(test)]
mod interaction_tests {
    use super::*;
    #[tokio::test]
    async fn rejects_unoffered_answers_without_contacting_server() {
        let connector = OpenCodeConnector::new(Default::default());
        let mut state = connector.state.lock().await;
        state.options.insert(
            "ses_test".into(),
            SessionOptions {
                cwd: "/work".into(),
                model: None,
                system_prompt: None,
                resume_id: None,
            },
        );
        state.pending.insert(
            "que_test".into(),
            Pending {
                session: "ses_test".into(),
                questions: Some(vec![Question {
                    id: "0".into(),
                    text: "Choose".into(),
                    choices: vec![Choice {
                        id: "One".into(),
                        label: "One".into(),
                        description: None,
                    }],
                    multiple: false,
                    allow_custom: false,
                }]),
            },
        );
        drop(state);
        let error = connector
            .respond(
                "ses_test",
                "que_test",
                InteractionResponse::Answers {
                    answers: vec![Answer {
                        question_id: "0".into(),
                        choice_ids: vec!["Unknown".into()],
                        custom_text: None,
                    }],
                },
            )
            .await
            .unwrap_err();
        assert!(error.to_string().contains("unknown option"));
        assert!(connector
            .state
            .lock()
            .await
            .pending
            .contains_key("que_test"));
    }
}

#[cfg(test)]
mod canonical_wire_tests {
    use super::*;
    use tokio::io::AsyncWriteExt;
    #[tokio::test]
    async fn chat_allow_and_deny_reach_opencode_as_once_and_reject() {
        for (decision, expected) in [("allow", "once"), ("deny", "reject")] {
            let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
            let connector = OpenCodeConnector::new(ConnectorConfig {
                endpoint: Some(format!("http://{}", listener.local_addr().unwrap())),
                ..Default::default()
            });
            {
                let mut state = connector.state.lock().await;
                state.options.insert(
                    "ses_test".into(),
                    SessionOptions {
                        cwd: "/work".into(),
                        model: None,
                        system_prompt: None,
                        resume_id: None,
                    },
                );
                state.pending.insert(
                    "per_test".into(),
                    Pending {
                        session: "ses_test".into(),
                        questions: None,
                    },
                );
            }
            let server = tokio::spawn(async move {
                let (mut socket, _) = listener.accept().await.unwrap();
                let wire = super::http_tests::request(&mut socket).await;
                assert!(wire.starts_with("POST /permission/per_test/reply?directory="));
                let body = wire.split_once("\r\n\r\n").unwrap().1;
                assert_eq!(
                    serde_json::from_str::<Value>(body).unwrap(),
                    json!({"reply":expected})
                );
                socket
                    .write_all(
                        b"HTTP/1.1 200 OK\r\nContent-Length: 4\r\nConnection: close\r\n\r\ntrue",
                    )
                    .await
                    .unwrap();
            });
            connector
                .respond(
                    "ses_test",
                    "per_test",
                    InteractionResponse::Approval {
                        decision: decision.into(),
                    },
                )
                .await
                .unwrap();
            server.await.unwrap();
            assert!(connector.state.lock().await.pending.is_empty());
        }
    }
    #[tokio::test]
    async fn opencode_messages_use_public_final_phase() {
        let connector = OpenCodeConnector::new(Default::default());
        let (sink, mut events) = tokio::sync::mpsc::unbounded_channel();
        connector.event("s","t",&sink,json!({"type":"message.part.updated","properties":{"sessionID":"s","part":{"id":"p","type":"text","text":"Hello"}}}),&mut HashMap::new()).await.unwrap();
        events.recv().await.unwrap();
        assert!(
            matches!(events.recv().await.unwrap().event,EventKind::Message{phase,..}if phase=="final")
        );
    }
}
