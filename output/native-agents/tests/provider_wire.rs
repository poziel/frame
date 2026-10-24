use frame_agent_connectors::{claude::ClaudeConnector, codex::CodexConnector, types::*};
use std::{path::PathBuf, sync::Arc, time::Duration};
use tokio::{sync::mpsc, time::timeout};

// A real child process exercises framing, request ordering, server requests,
// notifications, and EOF. The peer asserts exact provider wire contracts.
async fn exercise(provider: Provider, scenario: &str) {
    let python: PathBuf = std::env::var_os("FRAME_TEST_PYTHON")
        .unwrap_or_else(|| "python".into())
        .into();
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/provider_peer.py");
    let config = ConnectorConfig {
        executable: Some(python.clone()),
        python: Some(python),
        args: vec![
            "-u".into(),
            fixture.to_string_lossy().into_owned(),
            provider.to_string(),
            scenario.into(),
        ],
        ..Default::default()
    };
    let connector: Arc<dyn AgentConnector> = match provider {
        Provider::Codex => Arc::new(CodexConnector::new(config)),
        Provider::Claude => Arc::new(ClaudeConnector::new(config)),
        _ => unreachable!(),
    };
    let options = |resume_id| SessionOptions {
        cwd: "test-workspace".into(),
        model: Some("test-model".into()),
        system_prompt: Some("test-system".into()),
        resume_id,
    };
    let first = connector.create_session(options(None)).await.unwrap();
    assert_eq!(first.id, "s1");
    assert_eq!(first.cwd.as_deref(), Some("test-workspace"));
    assert_eq!(
        connector
            .create_session(options(Some("resumed".into())))
            .await
            .unwrap()
            .id,
        "resumed"
    );
    let history = connector.list_sessions().await.unwrap();
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].id, "history");
    assert_eq!(history[0].title.as_deref(), Some("Earlier"));
    let (sink, mut events) = mpsc::unbounded_channel();
    let sending = connector.clone();
    let task = tokio::spawn(async move {
        sending
            .send(
                "s1",
                Prompt {
                    text: "test prompt".into(),
                    turn_id: "host-turn".into(),
                },
                sink,
            )
            .await
    });
    let mut received = Vec::new();
    while let Some(event) = timeout(Duration::from_secs(10), events.recv())
        .await
        .expect("provider event stalled")
    {
        assert_eq!(event.session_id, "s1");
        assert_eq!(event.turn_id, "host-turn");
        if let EventKind::Questions {
            request_id,
            questions,
            ..
        } = &event.event
        {
            assert_eq!(questions[0].id, "style");
            assert_eq!(questions[0].choices[0].id, "0");
            assert_eq!(questions[0].choices[0].label, "Pixel");
            assert!(questions[0].allow_custom);
            // A request from one session cannot be answered on another.
            if provider == Provider::Codex {
                assert!(connector
                    .respond("other", request_id, InteractionResponse::Cancel)
                    .await
                    .is_err());
            }
            if scenario == "cancel" {
                connector.cancel("s1").await.unwrap();
            } else {
                connector
                    .respond(
                        "s1",
                        request_id,
                        InteractionResponse::Answers {
                            answers: vec![Answer {
                                question_id: "style".into(),
                                choice_ids: vec!["0".into()],
                                custom_text: None,
                            }],
                        },
                    )
                    .await
                    .unwrap();
            }
        }
        received.push(event);
    }
    let result = timeout(Duration::from_secs(10), task)
        .await
        .expect("send stalled")
        .unwrap();
    if scenario == "disconnect" {
        assert!(result.is_err());
    } else {
        result.unwrap();
    }
    let messages: Vec<_> = received
        .iter()
        .filter_map(|e| match &e.event {
            EventKind::Message {
                text, phase, delta, ..
            } => Some((text.as_str(), phase.as_str(), *delta)),
            _ => None,
        })
        .collect();
    assert_eq!(
        messages,
        vec![
            ("Hello", "intermediate", true),
            ("Hello world", "final", false)
        ]
    );
    let completed: Vec<_> = received
        .iter()
        .filter_map(|e| match &e.event {
            EventKind::Completed { status, .. } => Some(status.as_str()),
            _ => None,
        })
        .collect();
    assert_eq!(
        completed,
        if scenario == "disconnect" {
            vec![]
        } else if scenario == "cancel" {
            vec!["stopped"]
        } else {
            vec!["complete"]
        }
    );
    connector.dispose().await.unwrap();
    assert!(connector.create_session(options(None)).await.is_err());
}

#[tokio::test]
async fn codex_stream_create_resume_and_history() {
    exercise(Provider::Codex, "stream").await;
}
#[tokio::test]
async fn claude_stream_create_resume_and_history() {
    exercise(Provider::Claude, "stream").await;
}
#[tokio::test]
async fn codex_questions_roundtrip() {
    exercise(Provider::Codex, "questions").await;
}
#[tokio::test]
async fn claude_questions_roundtrip() {
    exercise(Provider::Claude, "questions").await;
}
#[tokio::test]
async fn codex_cancel_unblocks_question() {
    exercise(Provider::Codex, "cancel").await;
}
#[tokio::test]
async fn claude_cancel_unblocks_question() {
    exercise(Provider::Claude, "cancel").await;
}
#[tokio::test]
async fn codex_disconnect_fails_active_send() {
    exercise(Provider::Codex, "disconnect").await;
}
#[tokio::test]
async fn claude_disconnect_fails_active_send() {
    exercise(Provider::Claude, "disconnect").await;
}
