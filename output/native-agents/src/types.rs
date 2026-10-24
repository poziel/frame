use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::BTreeMap, path::PathBuf};
use tokio::sync::mpsc;

pub type Result<T> = std::result::Result<T, AgentError>;
#[derive(Debug, thiserror::Error)]
pub enum AgentError {
    #[error("{0}")]
    Message(String),
    #[error("Unsupported capability: {0}")]
    Unsupported(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error(transparent)]
    Http(#[from] reqwest::Error),
}
impl AgentError {
    pub fn msg(message: impl Into<String>) -> Self {
        Self::Message(message.into())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Provider {
    Codex,
    Claude,
    Gemini,
    Copilot,
    Opencode,
}
impl std::fmt::Display for Provider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            serde_json::to_value(self).unwrap().as_str().unwrap()
        )
    }
}

#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectorConfig {
    pub executable: Option<PathBuf>,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: BTreeMap<String, String>,
    pub endpoint: Option<String>,
    pub bearer_token: Option<String>,
    pub python: Option<PathBuf>,
    pub helper: Option<PathBuf>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Capabilities {
    pub resume: bool,
    pub list_sessions: bool,
    pub approvals: bool,
    pub questions: bool,
    pub tools: bool,
    pub artifacts: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionOptions {
    pub cwd: String,
    pub model: Option<String>,
    pub system_prompt: Option<String>,
    pub resume_id: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionInfo {
    pub id: String,
    pub title: Option<String>,
    pub cwd: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Prompt {
    pub text: String,
    pub turn_id: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Choice {
    pub id: String,
    pub label: String,
    pub description: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub id: String,
    pub text: String,
    pub choices: Vec<Choice>,
    pub multiple: bool,
    pub allow_custom: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Answer {
    pub question_id: String,
    pub choice_ids: Vec<String>,
    pub custom_text: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum InteractionResponse {
    Approval { decision: String },
    Answers { answers: Vec<Answer> },
    Cancel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum EventKind {
    Message {
        id: String,
        text: String,
        phase: String,
        delta: bool,
    },
    Thinking {
        id: String,
        text: String,
        delta: bool,
        finished: bool,
    },
    Activity {
        id: String,
        label: String,
        text: String,
        output: String,
        status: String,
    },
    Approval {
        request_id: String,
        text: String,
        detail: Option<String>,
    },
    Questions {
        request_id: String,
        text: String,
        questions: Vec<Question>,
    },
    Artifact {
        id: String,
        name: String,
        url: Option<String>,
        path: Option<String>,
        mime_type: Option<String>,
    },
    Status {
        message: String,
    },
    Metadata {
        name: String,
        data: Value,
    },
    Completed {
        status: String,
        error: Option<String>,
    },
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentEvent {
    pub session_id: String,
    pub turn_id: String,
    #[serde(flatten)]
    pub event: EventKind,
}
pub type EventSink = mpsc::UnboundedSender<AgentEvent>;
pub fn emit(sink: &EventSink, session: &str, turn: &str, event: EventKind) {
    let _ = sink.send(AgentEvent {
        session_id: session.into(),
        turn_id: turn.into(),
        event,
    });
}

pub fn validate_answers(questions: &[Question], answers: &[Answer]) -> Result<()> {
    let mut seen = std::collections::HashSet::new();
    for answer in answers {
        if !seen.insert(&answer.question_id) {
            return Err(AgentError::msg("Duplicate question answer"));
        }
        let question = questions
            .iter()
            .find(|q| q.id == answer.question_id)
            .ok_or_else(|| AgentError::msg("Unknown question"))?;
        let selected: std::collections::HashSet<_> = answer.choice_ids.iter().collect();
        let custom = answer.custom_text.as_deref().unwrap_or("").trim();
        if selected.len() != answer.choice_ids.len()
            || selected
                .iter()
                .any(|id| !question.choices.iter().any(|c| &c.id == *id))
            || (!custom.is_empty() && !question.allow_custom)
            || (!question.multiple && selected.len() + usize::from(!custom.is_empty()) > 1)
            || (selected.is_empty() && custom.is_empty())
        {
            return Err(AgentError::msg("Invalid question answer"));
        }
    }
    if seen.len() != questions.len() {
        return Err(AgentError::msg("Answer every required question"));
    }
    Ok(())
}

#[async_trait]
pub trait AgentConnector: Send + Sync {
    fn provider(&self) -> Provider;
    fn capabilities(&self) -> Capabilities;
    async fn create_session(&self, options: SessionOptions) -> Result<SessionInfo>;
    async fn list_sessions(&self) -> Result<Vec<SessionInfo>> {
        Err(AgentError::Unsupported("provider-wide history".into()))
    }
    async fn send(&self, session: &str, prompt: Prompt, sink: EventSink) -> Result<()>;
    async fn respond(
        &self,
        session: &str,
        request_id: &str,
        response: InteractionResponse,
    ) -> Result<()>;
    async fn cancel(&self, session: &str) -> Result<()>;
    async fn dispose(&self) -> Result<()>;
}
