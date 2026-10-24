use serde_json::{json, Value};
use std::{process::Stdio, time::Duration};
use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
    process::Command,
    time::timeout,
};

#[tokio::test]
async fn shutdown_exits_even_when_host_keeps_stdin_open() {
    let mut child = Command::new(env!("CARGO_BIN_EXE_frame-agent-server"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    let mut input = child.stdin.take().unwrap();
    let mut output = BufReader::new(child.stdout.take().unwrap()).lines();
    input
        .write_all(b"{\"id\":1,\"method\":\"shutdown\",\"params\":{}}\n")
        .await
        .unwrap();
    let line = timeout(Duration::from_secs(5), output.next_line())
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert_eq!(
        serde_json::from_str::<Value>(&line).unwrap(),
        json!({"id":1,"result":null})
    );
    assert!(timeout(Duration::from_secs(5), child.wait())
        .await
        .expect("shutdown waited for stdin EOF")
        .unwrap()
        .success());
    drop(input);
}

#[tokio::test]
async fn host_eof_disposes_an_active_provider_turn() {
    let dir = tempfile::tempdir().unwrap();
    let config = dir.path().join("config.json");
    let peer = r#"import sys,json
for line in sys.stdin:
 r=json.loads(line);m=r['method']
 if m=='initialize':result={}
 elif m=='session/create':result={'id':'native','cwd':r['params']['cwd']}
 elif m=='turn/send':
  print(json.dumps({'method':'event','params':{'sessionId':'native','turnId':'t','type':'status','message':'active'}}),flush=True);continue
 elif m=='shutdown':
  print(json.dumps({'id':r['id'],'result':None}),flush=True);break
 else:result=None
 print(json.dumps({'id':r['id'],'result':result}),flush=True)
"#;
    let python = std::env::var("FRAME_TEST_PYTHON").unwrap_or_else(|_| "python".into());
    std::fs::write(
        &config,
        serde_json::to_vec(
            &json!({"connectors":{"claude":{"python":python,"args":["-u","-c",peer]}}}),
        )
        .unwrap(),
    )
    .unwrap();
    let mut child = Command::new(env!("CARGO_BIN_EXE_frame-agent-server"))
        .args(["--config", config.to_str().unwrap()])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    let mut input = child.stdin.take().unwrap();
    let mut output = BufReader::new(child.stdout.take().unwrap()).lines();
    let create = json!({"id":1,"method":"session/create","params":{"provider":"claude","applicationId":"test","cwd":dir.path()}});
    input
        .write_all(format!("{create}\n").as_bytes())
        .await
        .unwrap();
    let created: Value = serde_json::from_str(
        &timeout(Duration::from_secs(5), output.next_line())
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
    )
    .unwrap();
    let send = json!({"id":2,"method":"turn/send","params":{"sessionId":created["result"]["sessionId"],"turnId":"t","text":"wait"}});
    input
        .write_all(format!("{send}\n").as_bytes())
        .await
        .unwrap();
    let active: Value = serde_json::from_str(
        &timeout(Duration::from_secs(5), output.next_line())
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
    )
    .unwrap();
    assert_eq!(active["params"]["message"], "active");
    drop(input);
    assert!(timeout(Duration::from_secs(12), child.wait())
        .await
        .expect("EOF left active provider running")
        .unwrap()
        .success());
}

#[tokio::test]
async fn unread_stdout_overflow_closes_connection_instead_of_growing_forever() {
    let mut child = Command::new(env!("CARGO_BIN_EXE_frame-agent-server"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    let mut input = child.stdin.take().unwrap();
    // Keep stdout owned and unread so its OS pipe fills. No providers start.
    let _output = child.stdout.take().unwrap();
    let requests = (0..2000)
        .map(|id| format!("{{\"id\":{id},\"method\":\"initialize\",\"params\":{{}}}}\n"))
        .collect::<String>();
    let _ = timeout(Duration::from_secs(5), input.write_all(requests.as_bytes())).await;
    timeout(Duration::from_secs(8), child.wait())
        .await
        .expect("unread output did not fail closed")
        .unwrap();
}
