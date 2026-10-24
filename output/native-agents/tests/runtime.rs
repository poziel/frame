use async_trait::async_trait;
use frame_agent_connectors::{
    runtime::{AgentRuntime, RuntimeConfig},
    types::*,
};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
};
use tokio::sync::{mpsc, Notify};

#[derive(Default)]
struct Fake {
    created: AtomicUsize,
    cancelled: AtomicUsize,
    release: Notify,
    cleaned: AtomicUsize,
    disposed: AtomicUsize,
}
#[async_trait]
impl AgentConnector for Fake {
    fn provider(&self) -> Provider {
        Provider::Codex
    }
    fn capabilities(&self) -> Capabilities {
        Capabilities {
            resume: true,
            ..Default::default()
        }
    }
    async fn create_session(&self, options: SessionOptions) -> Result<SessionInfo> {
        Ok(SessionInfo {
            id: options.resume_id.unwrap_or_else(|| {
                format!("session-{}", self.created.fetch_add(1, Ordering::SeqCst))
            }),
            title: Some("Test".into()),
            cwd: Some(options.cwd),
        })
    }
    async fn send(&self, session: &str, prompt: Prompt, sink: EventSink) -> Result<()> {
        emit(
            &sink,
            "other-session",
            &prompt.turn_id,
            EventKind::Status {
                message: "wrong".into(),
            },
        );
        emit(
            &sink,
            session,
            "old-turn",
            EventKind::Status {
                message: "wrong".into(),
            },
        );
        emit(
            &sink,
            session,
            &prompt.turn_id,
            EventKind::Message {
                id: "m".into(),
                text: prompt.text.clone(),
                phase: "final".into(),
                delta: false,
            },
        );
        if prompt.text == "wait" {
            self.release.notified().await;
            tokio::task::yield_now().await;
            self.cleaned.fetch_add(1, Ordering::SeqCst);
        }
        if prompt.text == "stuck" {
            std::future::pending::<()>().await;
        }
        emit(
            &sink,
            session,
            &prompt.turn_id,
            EventKind::Completed {
                status: "complete".into(),
                error: None,
            },
        );
        emit(
            &sink,
            session,
            &prompt.turn_id,
            EventKind::Completed {
                status: "complete".into(),
                error: None,
            },
        );
        Ok(())
    }
    async fn respond(&self, _: &str, _: &str, _: InteractionResponse) -> Result<()> {
        Ok(())
    }
    async fn cancel(&self, _: &str) -> Result<()> {
        self.cancelled.fetch_add(1, Ordering::SeqCst);
        self.release.notify_one();
        Ok(())
    }
    async fn dispose(&self) -> Result<()> {
        self.disposed.fetch_add(1, Ordering::SeqCst);
        Ok(())
    }
}
fn connectors(fake: Arc<Fake>) -> HashMap<Provider, Arc<dyn AgentConnector>> {
    let mut map: HashMap<Provider, Arc<dyn AgentConnector>> = HashMap::new();
    map.insert(Provider::Codex, fake);
    map
}
fn options(cwd: &std::path::Path) -> SessionOptions {
    SessionOptions {
        cwd: cwd.to_string_lossy().into(),
        model: None,
        system_prompt: None,
        resume_id: None,
    }
}

#[tokio::test]
async fn ownership_persists_and_foreign_history_needs_explicit_host_permission() {
    let dir = tempfile::tempdir().unwrap();
    let config = RuntimeConfig {
        history_path: Some(dir.path().join("history.json")),
        ..Default::default()
    };
    let fake = Arc::new(Fake::default());
    let runtime = AgentRuntime::with_connectors(config.clone(), connectors(fake.clone()))
        .await
        .unwrap();
    assert_eq!(fake.created.load(Ordering::SeqCst), 0);
    let session = runtime
        .create_session(Provider::Codex, "pixloom", options(dir.path()))
        .await
        .unwrap();
    assert_eq!(
        runtime
            .list_sessions(Provider::Codex, "pixloom", false)
            .await
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        runtime
            .list_sessions(Provider::Codex, "other", false)
            .await
            .unwrap()
            .len(),
        0
    );
    assert!(runtime
        .list_sessions(Provider::Codex, "pixloom", true)
        .await
        .is_err());
    let mut foreign = options(dir.path());
    foreign.resume_id = Some(session.provider_session_id.clone());
    assert!(runtime
        .create_session(Provider::Codex, "other", foreign)
        .await
        .is_err());
    runtime.dispose().await.unwrap();
    let reloaded = AgentRuntime::with_connectors(config, connectors(fake))
        .await
        .unwrap();
    let mut owned = options(dir.path());
    owned.resume_id = Some(session.provider_session_id);
    assert!(reloaded
        .create_session(Provider::Codex, "pixloom", owned)
        .await
        .is_ok());
}

#[tokio::test]
async fn frames_are_scoped_and_each_turn_completes_once() {
    let dir = tempfile::tempdir().unwrap();
    let runtime = AgentRuntime::with_connectors(
        RuntimeConfig::default(),
        connectors(Arc::new(Fake::default())),
    )
    .await
    .unwrap();
    let session = runtime
        .create_session(Provider::Codex, "app", options(dir.path()))
        .await
        .unwrap();
    let (tx, mut rx) = mpsc::unbounded_channel();
    runtime
        .send(
            &session.session_id,
            Prompt {
                text: "Hello".into(),
                turn_id: "turn".into(),
            },
            tx,
        )
        .await
        .unwrap();
    let first = rx.recv().await.unwrap();
    let last = rx.recv().await.unwrap();
    assert_eq!(first.session_id, session.session_id);
    assert!(matches!(first.event, EventKind::Message { .. }));
    assert!(matches!(last.event, EventKind::Completed { .. }));
    assert!(rx.try_recv().is_err());
    assert!(runtime
        .respond(
            &session.session_id,
            "turn",
            "req",
            InteractionResponse::Cancel
        )
        .await
        .is_err());
}

#[tokio::test]
async fn cancel_unblocks_turn_rejects_wrong_turn_and_allows_next_prompt() {
    let dir = tempfile::tempdir().unwrap();
    let fake = Arc::new(Fake::default());
    let runtime = Arc::new(
        AgentRuntime::with_connectors(RuntimeConfig::default(), connectors(fake.clone()))
            .await
            .unwrap(),
    );
    let session = runtime
        .create_session(Provider::Codex, "app", options(dir.path()))
        .await
        .unwrap();
    let (tx, mut rx) = mpsc::unbounded_channel();
    let task = {
        let runtime = runtime.clone();
        let id = session.session_id.clone();
        tokio::spawn(async move {
            runtime
                .send(
                    &id,
                    Prompt {
                        text: "wait".into(),
                        turn_id: "turn".into(),
                    },
                    tx,
                )
                .await
        })
    };
    rx.recv().await.unwrap();
    assert!(runtime
        .cancel(&session.session_id, Some("wrong"))
        .await
        .is_err());
    let (tx, _) = mpsc::unbounded_channel();
    assert!(runtime
        .send(
            &session.session_id,
            Prompt {
                text: "duplicate".into(),
                turn_id: "other".into()
            },
            tx
        )
        .await
        .is_err());
    runtime
        .cancel(&session.session_id, Some("turn"))
        .await
        .unwrap();
    task.await.unwrap().unwrap();
    assert!(
        matches!(rx.recv().await.unwrap().event,EventKind::Completed{status,..} if status=="stopped")
    );
    assert_eq!(fake.cancelled.load(Ordering::SeqCst), 1);
    assert_eq!(fake.cleaned.load(Ordering::SeqCst), 1);
    let (tx, _) = mpsc::unbounded_channel();
    runtime
        .send(
            &session.session_id,
            Prompt {
                text: "next".into(),
                turn_id: "next".into(),
            },
            tx,
        )
        .await
        .unwrap();
    runtime.close_session(&session.session_id).await.unwrap();
    assert!(runtime.cancel(&session.session_id, None).await.is_err());
}

#[tokio::test]
async fn configured_application_and_roots_are_enforced_before_provider_start() {
    let root = tempfile::tempdir().unwrap();
    let outside = tempfile::tempdir().unwrap();
    let fake = Arc::new(Fake::default());
    let runtime = AgentRuntime::with_connectors(
        RuntimeConfig {
            application_id: Some("pixloom".into()),
            allowed_roots: vec![root.path().into()],
            ..Default::default()
        },
        connectors(fake.clone()),
    )
    .await
    .unwrap();
    assert!(runtime
        .create_session(Provider::Codex, "other", options(root.path()))
        .await
        .is_err());
    assert!(runtime
        .create_session(Provider::Codex, "pixloom", options(outside.path()))
        .await
        .is_err());
    assert_eq!(fake.created.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn stalled_cancellation_disposes_provider_before_releasing_turn() {
    let dir = tempfile::tempdir().unwrap();
    let fake = Arc::new(Fake::default());
    let runtime = Arc::new(
        AgentRuntime::with_connectors(RuntimeConfig::default(), connectors(fake.clone()))
            .await
            .unwrap(),
    );
    let session = runtime
        .create_session(Provider::Codex, "app", options(dir.path()))
        .await
        .unwrap();
    let (tx, mut rx) = mpsc::unbounded_channel();
    let task = {
        let runtime = runtime.clone();
        let id = session.session_id.clone();
        tokio::spawn(async move {
            runtime
                .send(
                    &id,
                    Prompt {
                        text: "stuck".into(),
                        turn_id: "t".into(),
                    },
                    tx,
                )
                .await
        })
    };
    rx.recv().await.unwrap();
    runtime
        .cancel(&session.session_id, Some("t"))
        .await
        .unwrap();
    assert!(
        tokio::time::timeout(std::time::Duration::from_secs(7), task)
            .await
            .unwrap()
            .unwrap()
            .is_err()
    );
    assert_eq!(fake.disposed.load(Ordering::SeqCst), 1);
    assert!(
        matches!(rx.recv().await.unwrap().event,EventKind::Completed{status,..} if status=="error")
    );
    assert!(rx.try_recv().is_err());
}
