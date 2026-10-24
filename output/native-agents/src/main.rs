use frame_agent_connectors::{
    rpc::MAX_FRAME_BYTES,
    runtime::{AgentRuntime, RuntimeConfig},
};
use serde_json::{json, Value};
use std::{
    io::{BufRead, Read, Write},
    sync::Arc,
    time::Duration,
};
use tokio::{
    sync::{mpsc, oneshot, watch, OwnedSemaphorePermit, Semaphore},
    task::JoinSet,
};

// Limit pending serialized output to 8 MiB / 128 frames. Overflow closes the
// connection and disposes providers; it never silently drops a live stream.
const OUTPUT_BUDGET: usize = 8 * 1024 * 1024;
type Output = mpsc::Sender<(Vec<u8>, OwnedSemaphorePermit)>;
fn queue(
    output: &Output,
    budget: &Arc<Semaphore>,
    shutdown: &watch::Sender<bool>,
    value: Value,
) -> bool {
    let Ok(mut bytes) = serde_json::to_vec(&value) else {
        let _ = shutdown.send(true);
        return false;
    };
    bytes.push(b'\n');
    let permit = if bytes.len() <= OUTPUT_BUDGET {
        budget
            .clone()
            .try_acquire_many_owned(bytes.len() as u32)
            .ok()
    } else {
        None
    };
    if let Some(permit) = permit {
        if output.try_send((bytes, permit)).is_ok() {
            return true;
        }
    }
    eprintln!("Agent output backlog exceeded its bound; closing connection");
    let _ = shutdown.send(true);
    false
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args().skip(1);
    let config = match args.next().as_deref() {
        Some("--help") | Some("-h") => {
            println!("frame-agent-server [--config PATH]\nBidirectional JSONL on stdin/stdout. Providers start only on explicit session operations.\nLimits: 16 MiB input frames, 128 requests, 8 MiB / 128 queued output frames.\nOutput overflow closes the connection and disposes providers.");
            return Ok(());
        }
        Some("--version") => {
            println!("frame-agent-server {}", env!("CARGO_PKG_VERSION"));
            return Ok(());
        }
        Some("--config") => {
            let path = args.next().ok_or("Missing config path")?;
            serde_json::from_slice::<RuntimeConfig>(&tokio::fs::read(path).await?)?
        }
        Some(_) => return Err("Unknown argument; use --help".into()),
        None => RuntimeConfig::default(),
    };
    if args.next().is_some() {
        return Err("Unexpected additional argument".into());
    }
    let runtime = Arc::new(AgentRuntime::new(config).await?);
    let (shutdown, mut stopping) = watch::channel(false);
    let (output, mut out) = mpsc::channel::<(Vec<u8>, OwnedSemaphorePermit)>(128);
    let budget = Arc::new(Semaphore::new(OUTPUT_BUDGET));
    let (written, writer) = oneshot::channel();
    let writer_shutdown = shutdown.clone();
    // Detached OS threads do not enter Tokio's blocking pool: a host keeping
    // stdin open or no longer reading stdout must not prevent process exit.
    std::thread::spawn(move || {
        let mut stdout = std::io::stdout().lock();
        let result = (|| -> std::io::Result<()> {
            while let Some((bytes, _permit)) = out.blocking_recv() {
                stdout.write_all(&bytes)?;
                stdout.flush()?;
            }
            Ok(())
        })();
        if result.is_err() {
            let _ = writer_shutdown.send(true);
        }
        let _ = written.send(result);
    });
    let (input, mut stdin) = mpsc::channel::<std::io::Result<Vec<u8>>>(8);
    std::thread::spawn(move || {
        let mut reader = std::io::BufReader::new(std::io::stdin().lock());
        loop {
            let mut line = Vec::new();
            let result = (&mut reader)
                .take(MAX_FRAME_BYTES + 1)
                .read_until(b'\n', &mut line);
            match result {
                Ok(0) => break,
                Ok(_) => {
                    let oversized = line.len() as u64 > MAX_FRAME_BYTES;
                    if input.blocking_send(Ok(line)).is_err() || oversized {
                        break;
                    }
                }
                Err(error) => {
                    let _ = input.blocking_send(Err(error));
                    break;
                }
            }
        }
    });
    let (events, mut incoming) = mpsc::unbounded_channel();
    let event_output = output.clone();
    let event_budget = budget.clone();
    let event_shutdown = shutdown.clone();
    let forward = tokio::spawn(async move {
        while let Some(event) = incoming.recv().await {
            if !queue(
                &event_output,
                &event_budget,
                &event_shutdown,
                json!({"method":"event","params":event}),
            ) {
                incoming.close();
                break;
            }
        }
    });
    let limits = Arc::new(Semaphore::new(128));
    let mut tasks = JoinSet::new();
    loop {
        let line = tokio::select! { _=stopping.changed()=>break,line=stdin.recv()=>match line{Some(line)=>line?,None=>break} };
        if line.len() as u64 > MAX_FRAME_BYTES {
            queue(
                &output,
                &budget,
                &shutdown,
                json!({"id":null,"error":{"message":"Request exceeds 16 MB"}}),
            );
            break;
        }
        if line.iter().all(u8::is_ascii_whitespace) {
            continue;
        }
        let value = match serde_json::from_slice::<Value>(&line) {
            Ok(v) => v,
            Err(_) => {
                if !queue(
                    &output,
                    &budget,
                    &shutdown,
                    json!({"id":null,"error":{"message":"Invalid JSON request"}}),
                ) {
                    break;
                }
                continue;
            }
        };
        let Some(method) = value["method"].as_str().map(str::to_owned) else {
            if !queue(
                &output,
                &budget,
                &shutdown,
                json!({"id":value["id"],"error":{"message":"Missing method"}}),
            ) {
                break;
            }
            continue;
        };
        if !value
            .get("id")
            .is_some_and(|id| id.is_number() || id.is_string())
        {
            continue;
        }
        let permit = match limits.clone().try_acquire_owned() {
            Ok(p) => p,
            Err(_) => {
                if !queue(
                    &output,
                    &budget,
                    &shutdown,
                    json!({"id":value["id"],"error":{"message":"Too many active requests"}}),
                ) {
                    break;
                }
                continue;
            }
        };
        let runtime = runtime.clone();
        let output = output.clone();
        let budget = budget.clone();
        let events = events.clone();
        let shutdown = shutdown.clone();
        tasks.spawn(async move {
            let _permit = permit;
            let result = runtime
                .handle(&method, value["params"].clone(), events)
                .await;
            let response = match result {
                Ok(result) => json!({"id":value["id"],"result":result}),
                Err(error) => json!({"id":value["id"],"error":{"message":error.to_string()}}),
            };
            queue(&output, &budget, &shutdown, response);
            if method == "shutdown" {
                let _ = shutdown.send(true);
            }
        });
        while tasks.try_join_next().is_some() {}
    }
    drop(stdin);
    runtime.dispose().await?;
    if tokio::time::timeout(Duration::from_secs(9), async {
        while tasks.join_next().await.is_some() {}
    })
    .await
    .is_err()
    {
        tasks.abort_all();
        while tasks.join_next().await.is_some() {}
    }
    drop(events);
    let _ = forward.await;
    drop(output);
    match tokio::time::timeout(Duration::from_secs(2), writer).await {
        Ok(Ok(result)) => result?,
        _ => return Err("Output did not drain; connection closed".into()),
    };
    Ok(())
}
