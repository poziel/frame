use crate::{
    claude::ClaudeConnector, codex::CodexConnector, gemini::GeminiConnector,
    opencode::OpenCodeConnector, types::*,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::Duration,
};
use tokio::sync::{mpsc, watch, Mutex};

#[derive(Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeConfig {
    #[serde(default)]
    pub connectors: HashMap<Provider, ConnectorConfig>,
    pub application_id: Option<String>,
    pub history_path: Option<PathBuf>,
    #[serde(default)]
    pub allow_all_history: bool,
    #[serde(default)]
    pub allowed_roots: Vec<PathBuf>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnedSession {
    pub provider: Provider,
    pub provider_session_id: String,
    pub application_id: String,
    pub title: Option<String>,
    pub cwd: Option<String>,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionHandle {
    pub session_id: String,
    pub provider_session_id: String,
    pub provider: Provider,
    pub capabilities: Capabilities,
}
struct Active {
    turn: String,
    cancel: watch::Sender<bool>,
}
struct Live {
    handle: SessionHandle,
    active: Mutex<Option<Active>>,
}

pub struct AgentRuntime {
    config: RuntimeConfig,
    connectors: HashMap<Provider, Arc<dyn AgentConnector>>,
    live: Mutex<HashMap<String, Arc<Live>>>,
    history: Mutex<Vec<OwnedSession>>,
    disposed: AtomicBool,
}
impl AgentRuntime {
    /// Loads only the host's ownership registry. Does not start providers or authenticate.
    pub async fn new(config: RuntimeConfig) -> Result<Self> {
        let get = |provider| {
            config
                .connectors
                .get(&provider)
                .cloned()
                .unwrap_or_default()
        };
        let mut connectors: HashMap<Provider, Arc<dyn AgentConnector>> = HashMap::new();
        connectors.insert(
            Provider::Codex,
            Arc::new(CodexConnector::new(get(Provider::Codex))),
        );
        connectors.insert(
            Provider::Claude,
            Arc::new(ClaudeConnector::new(get(Provider::Claude))),
        );
        connectors.insert(
            Provider::Gemini,
            Arc::new(GeminiConnector::new(get(Provider::Gemini))),
        );
        connectors.insert(
            Provider::Opencode,
            Arc::new(OpenCodeConnector::new(get(Provider::Opencode))),
        );
        connectors.insert(
            Provider::Copilot,
            Arc::new(crate::copilot::CopilotConnector::new(get(
                Provider::Copilot,
            ))),
        );
        Self::with_connectors(config, connectors).await
    }
    pub async fn with_connectors(
        config: RuntimeConfig,
        connectors: HashMap<Provider, Arc<dyn AgentConnector>>,
    ) -> Result<Self> {
        let history = if let Some(path) = &config.history_path {
            match tokio::fs::read(path).await {
                Ok(data) => serde_json::from_slice(&data)?,
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => Vec::new(),
                Err(error) => return Err(error.into()),
            }
        } else {
            Vec::new()
        };
        Ok(Self {
            config,
            connectors,
            live: Mutex::new(HashMap::new()),
            history: Mutex::new(history),
            disposed: AtomicBool::new(false),
        })
    }
    fn check(&self) -> Result<()> {
        if self.disposed.load(Ordering::Acquire) {
            Err(AgentError::msg("Agent runtime disposed"))
        } else {
            Ok(())
        }
    }
    fn connector(&self, provider: Provider) -> Result<&Arc<dyn AgentConnector>> {
        self.check()?;
        self.connectors
            .get(&provider)
            .ok_or_else(|| AgentError::Unsupported(format!("Provider {provider}")))
    }
    fn application(&self, id: &str) -> Result<String> {
        if id.trim().is_empty() {
            return Err(AgentError::msg("An application ID is required"));
        }
        if self
            .config
            .application_id
            .as_deref()
            .is_some_and(|expected| expected != id)
        {
            return Err(AgentError::msg(
                "Application ID is not authorized for this runtime",
            ));
        }
        Ok(id.into())
    }
    pub fn capabilities(&self) -> Value {
        json!(self.connectors.iter().map(|(provider,connector)|json!({"provider":provider,"capabilities":connector.capabilities()})).collect::<Vec<_>>())
    }
    pub async fn create_session(
        &self,
        provider: Provider,
        application_id: &str,
        options: SessionOptions,
    ) -> Result<SessionHandle> {
        let app = self.application(application_id)?;
        let connector = self.connector(provider)?;
        let cwd = tokio::fs::canonicalize(&options.cwd).await?;
        if !cwd.is_dir() {
            return Err(AgentError::msg(
                "Session working directory must be a directory",
            ));
        }
        if !self.config.allowed_roots.is_empty() {
            let mut allowed = false;
            for root in &self.config.allowed_roots {
                if cwd.starts_with(tokio::fs::canonicalize(root).await?) {
                    allowed = true;
                    break;
                }
            }
            if !allowed {
                return Err(AgentError::msg(
                    "Working directory is outside the host's allowed roots",
                ));
            }
        }
        if let Some(id) = &options.resume_id {
            let owned = self.history.lock().await.iter().any(|s| {
                s.provider == provider && s.provider_session_id == *id && s.application_id == app
            });
            if !owned && !self.config.allow_all_history {
                return Err(AgentError::msg("Session does not belong to this application; provider-wide access requires host configuration"));
            }
            if let Some(live) = self
                .live
                .lock()
                .await
                .values()
                .find(|s| s.handle.provider == provider && s.handle.provider_session_id == *id)
            {
                return Ok(live.handle.clone());
            }
        }
        let info = connector.create_session(options).await?;
        self.check()?;
        let handle = SessionHandle {
            session_id: uuid::Uuid::new_v4().to_string(),
            provider_session_id: info.id.clone(),
            provider,
            capabilities: connector.capabilities(),
        };
        {
            let mut history = self.history.lock().await;
            if !history.iter().any(|s| {
                s.provider == provider
                    && s.provider_session_id == info.id
                    && s.application_id == app
            }) {
                history.push(OwnedSession {
                    provider,
                    provider_session_id: info.id,
                    application_id: app,
                    title: info.title,
                    cwd: info.cwd,
                });
            }
            self.persist(&history).await?;
        }
        self.live.lock().await.insert(
            handle.session_id.clone(),
            Arc::new(Live {
                handle: handle.clone(),
                active: Mutex::new(None),
            }),
        );
        Ok(handle)
    }
    async fn persist(&self, history: &[OwnedSession]) -> Result<()> {
        if let Some(path) = &self.config.history_path {
            if let Some(parent) = path.parent() {
                tokio::fs::create_dir_all(parent).await?;
            }
            let temporary = path.with_extension(format!("{}.tmp", uuid::Uuid::new_v4()));
            tokio::fs::write(&temporary, serde_json::to_vec_pretty(history)?).await?;
            if let Err(error) = tokio::fs::rename(&temporary, path).await {
                let _ = tokio::fs::remove_file(&temporary).await;
                return Err(error.into());
            }
        }
        Ok(())
    }
    pub async fn list_sessions(
        &self,
        provider: Provider,
        application_id: &str,
        all: bool,
    ) -> Result<Vec<OwnedSession>> {
        self.check()?;
        let app = self.application(application_id)?;
        if !all {
            return Ok(self
                .history
                .lock()
                .await
                .iter()
                .filter(|s| s.provider == provider && s.application_id == app)
                .cloned()
                .collect());
        }
        if !self.config.allow_all_history {
            return Err(AgentError::msg(
                "Provider-wide history is disabled by the host",
            ));
        }
        Ok(self
            .connector(provider)?
            .list_sessions()
            .await?
            .into_iter()
            .map(|s| OwnedSession {
                provider,
                provider_session_id: s.id,
                application_id: app.clone(),
                title: s.title,
                cwd: s.cwd,
            })
            .collect())
    }
    async fn session(&self, id: &str) -> Result<Arc<Live>> {
        self.check()?;
        self.live
            .lock()
            .await
            .get(id)
            .cloned()
            .ok_or_else(|| AgentError::msg("Unknown or closed session handle"))
    }
    pub async fn send(&self, id: &str, prompt: Prompt, sink: EventSink) -> Result<()> {
        let live = self.session(id).await?;
        let connector = self.connector(live.handle.provider)?.clone();
        if prompt.turn_id.trim().is_empty() || prompt.text.trim().is_empty() {
            return Err(AgentError::msg("Prompt and turn ID cannot be empty"));
        }
        let (cancel_tx, mut cancel_rx) = watch::channel(false);
        {
            let mut active = live.active.lock().await;
            if active.is_some() {
                return Err(AgentError::msg("A turn is already running in this session"));
            }
            *active = Some(Active {
                turn: prompt.turn_id.clone(),
                cancel: cancel_tx,
            });
        }
        let provider_id = &live.handle.provider_session_id;
        let turn = &prompt.turn_id;
        let (events, mut receiver) = mpsc::unbounded_channel();
        let started = Arc::new(AtomicBool::new(false));
        let work_started = started.clone();
        let work = async {
            work_started.store(true, Ordering::Release);
            connector.send(provider_id, prompt.clone(), events).await
        };
        tokio::pin!(work);
        let mut terminal = None;
        let result = loop {
            tokio::select! {biased;
                _=cancel_rx.changed()=>{
                    if started.load(Ordering::Acquire) {
                        // Keep polling send while cancellation runs: connectors must
                        // finish in-flight starts, settle requests and drain output.
                        let cleanup=tokio::time::timeout(Duration::from_secs(5),async {
                            tokio::join!(connector.cancel(provider_id),&mut work)
                        }).await;
                        if !matches!(cleanup,Ok((Ok(()),_))) {
                            let _=tokio::time::timeout(Duration::from_secs(3),connector.dispose()).await;
                            break Err(AgentError::msg("Provider cancellation did not finish; connector disposed"));
                        }
                    }
                    terminal=Some(EventKind::Completed{status:"stopped".into(),error:None});break Ok(());
                },
                result=&mut work=>{break result;},
                event=receiver.recv()=>{if let Some(mut event)=event {if event.session_id==*provider_id&&event.turn_id==*turn {if matches!(event.event,EventKind::Completed{..}){terminal=Some(event.event);}else if terminal.is_none(){event.session_id=id.into();let _=sink.send(event);}}}}
            }
        };
        while let Ok(mut event) = receiver.try_recv() {
            if event.session_id == *provider_id && event.turn_id == *turn {
                if matches!(event.event, EventKind::Completed { .. }) {
                    if terminal.is_none() {
                        terminal = Some(event.event);
                    }
                } else if terminal.is_none() {
                    event.session_id = id.into();
                    let _ = sink.send(event);
                }
            }
        }
        if let Err(error) = &result {
            terminal = Some(EventKind::Completed {
                status: "error".into(),
                error: Some(error.to_string()),
            });
        }
        let event = terminal.unwrap_or(EventKind::Completed {
            status: "complete".into(),
            error: None,
        });
        live.active.lock().await.take();
        emit(&sink, id, turn, event);
        result
    }
    pub async fn respond(
        &self,
        id: &str,
        turn: &str,
        request_id: &str,
        response: InteractionResponse,
    ) -> Result<()> {
        let live = self.session(id).await?;
        if !live
            .active
            .lock()
            .await
            .as_ref()
            .is_some_and(|a| a.turn == turn)
        {
            return Err(AgentError::msg("Interaction belongs to an inactive turn"));
        }
        self.connector(live.handle.provider)?
            .respond(&live.handle.provider_session_id, request_id, response)
            .await
    }
    pub async fn cancel(&self, id: &str, turn: Option<&str>) -> Result<()> {
        let live = self.session(id).await?;
        let active = live.active.lock().await;
        if let Some(active) = active.as_ref() {
            if turn.is_some_and(|turn| turn != active.turn) {
                return Err(AgentError::msg("Cancel belongs to a different turn"));
            }
            let _ = active.cancel.send(true);
        }
        Ok(())
    }
    pub async fn close_session(&self, id: &str) -> Result<()> {
        let live = self.session(id).await?;
        if let Some(active) = live.active.lock().await.as_ref() {
            let _ = active.cancel.send(true);
        }
        self.live.lock().await.remove(id);
        Ok(())
    }
    pub async fn dispose(&self) -> Result<()> {
        if self.disposed.swap(true, Ordering::AcqRel) {
            return Ok(());
        }
        let live: Vec<_> = self.live.lock().await.drain().map(|(_, s)| s).collect();
        for session in live {
            if let Some(active) = session.active.lock().await.as_ref() {
                let _ = active.cancel.send(true);
            }
        }
        for connector in self.connectors.values() {
            let _ = connector.dispose().await;
        }
        Ok(())
    }
    pub async fn handle(&self, method: &str, params: Value, sink: EventSink) -> Result<Value> {
        fn field<'a>(params: &'a Value, name: &str) -> Result<&'a str> {
            params[name]
                .as_str()
                .ok_or_else(|| AgentError::msg(format!("Missing {name}")))
        }
        match method {
            "initialize" | "connector/capabilities" => Ok(self.capabilities()),
            "session/create" => {
                let provider: Provider = serde_json::from_value(params["provider"].clone())?;
                let options: SessionOptions = serde_json::from_value(params.clone())?;
                Ok(serde_json::to_value(
                    self.create_session(provider, field(&params, "applicationId")?, options)
                        .await?,
                )?)
            }
            "session/list" => {
                let provider: Provider = serde_json::from_value(params["provider"].clone())?;
                Ok(serde_json::to_value(
                    self.list_sessions(
                        provider,
                        field(&params, "applicationId")?,
                        params["scope"] == "all",
                    )
                    .await?,
                )?)
            }
            "turn/send" => {
                let prompt: Prompt = serde_json::from_value(params.clone())?;
                self.send(field(&params, "sessionId")?, prompt, sink)
                    .await?;
                Ok(Value::Null)
            }
            "turn/cancel" => {
                self.cancel(field(&params, "sessionId")?, params["turnId"].as_str())
                    .await?;
                Ok(Value::Null)
            }
            "interaction/respond" => {
                self.respond(
                    field(&params, "sessionId")?,
                    field(&params, "turnId")?,
                    field(&params, "requestId")?,
                    serde_json::from_value(params["response"].clone())?,
                )
                .await?;
                Ok(Value::Null)
            }
            "session/close" => {
                self.close_session(field(&params, "sessionId")?).await?;
                Ok(Value::Null)
            }
            "shutdown" => {
                self.dispose().await?;
                Ok(Value::Null)
            }
            _ => Err(AgentError::Unsupported(format!("Method {method}"))),
        }
    }
}
