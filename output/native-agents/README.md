# Frame native agent connectors

Run Codex, Claude Agent SDK, Gemini CLI, GitHub Copilot SDK, or an existing OpenCode server behind one native JSONL interface. Frame applications supply a transport to the [agent chat adapter](../../frame/packages/features/src/agentChat.ts); this crate owns provider connections and translates their events.

This directory contains source and a development server. Build and distribute the binary, Claude helper, and Python environment through your application's host integration. It is separate from the browser Features package.

## Build and configure

From the repository root, with Rust/Cargo installed:

```powershell
cargo build --manifest-path agents/Cargo.toml
agents/target/debug/frame-agent-server.exe --help
```

On other platforms, omit `.exe`. Provider executables and authentication belong to the host. Creating a connector or starting `frame-agent-server` does not start a provider. Explicit session creation, provider-wide history requests, and subsequent operations can start or contact the selected provider.

| Provider | Required host setup | Transport | Resume / provider-wide history |
| --- | --- | --- | --- |
| `codex` | Installed `codex` CLI with app-server support and host-managed credentials | `codex app-server`, bidirectional JSONL | Both |
| `claude` | Python 3.10+, requirements below, and Claude SDK authentication configured by the host | Python bridge using the official Claude Agent SDK | Both; SDK history API must be available |
| `gemini` | Installed Gemini CLI with ACP support and host-managed credentials | `gemini --acp`, ACP v1 | Resume only when the server advertises `loadSession`; no provider-wide listing |
| `copilot` | Installed `copilot` CLI compatible with the pinned official Rust SDK; host-managed credentials | Official Rust SDK 1.0.26 using explicit CLI path and stdio | Both |
| `opencode` | An already running `opencode serve` instance | HTTP and `/event` SSE | Both |

Claude requires an explicit Python package installation. From the repository root:

```powershell
python -m venv agents/.venv
agents/.venv/Scripts/python.exe -m pip install -r agents/python/requirements.txt
```

The requirement is pinned in [python/requirements.txt](python/requirements.txt). On Unix, use `.venv/bin/python`. Set `connectors.claude.python` to that interpreter. Distribute [frame_claude_agent.py](python/frame_claude_agent.py) alongside your application and set `helper` to its absolute path; the default helper path points into this source checkout at build time.

Create a host-owned configuration file and pass `--config PATH`:

```json
{
  "applicationId": "my-app",
  "historyPath": "D:/AppData/my-app/agent-sessions.json",
  "allowedRoots": ["D:/Projects"],
  "allowAllHistory": false,
  "connectors": {
    "claude": {
      "python": "D:/Tools/agent-python/Scripts/python.exe",
      "helper": "D:/Apps/my-app/frame_claude_agent.py"
    },
    "opencode": {
      "endpoint": "http://127.0.0.1:4096"
    }
  }
}
```

Replace the example paths with existing host paths. `allowedRoots` bounds canonical session working directories. `applicationId` pins the application identity accepted by the runtime. The optional ownership registry records sessions created or resumed through this runtime. Without `historyPath`, that registry lasts only for the current process. Application history is the default; provider-wide history and adopting unowned provider sessions require `allowAllHistory: true`.

Connector settings are `executable`, `args`, `env`, `endpoint`, `bearerToken`, `python`, and `helper`. Use only settings supported by the selected connector:

- Codex and Gemini use `executable` or the named CLI on `PATH`. Nonempty `args` replace their default arguments.
- Claude uses `python`, then `executable`, then `python` on `PATH`. Nonempty `args` replace the helper invocation.
- Copilot uses `executable` or `copilot` on `PATH`; `args` are additional CLI arguments. The connector selects an explicit program and does not ask the SDK to download or resolve a bundled CLI.
- Child-process connectors forward `env`. Their processes also inherit the host environment.
- OpenCode uses `endpoint`, defaulting to `http://127.0.0.1:4096`. It does not launch or stop the external server. `bearerToken` supports a host's bearer-authenticated endpoint. OpenCode's own Basic authentication can be supplied explicitly through `env.OPENCODE_SERVER_PASSWORD` and optional `env.OPENCODE_SERVER_USERNAME` (default `opencode`). Bearer authentication takes precedence. These entries configure HTTP authentication; they do not spawn a process or modify environment variables.

## Host protocol

Connect the binary's stdin/stdout to a host transport. Stdout carries one JSON object per line. Requests have an `id`, `method`, and `params`; responses carry the same `id` and either `result` or `error.message`. IDs allow concurrent requests, including approval replies and cancellation while a turn is streaming.

A session creation request:

```json
{"id":1,"method":"session/create","params":{"provider":"codex","applicationId":"my-app","cwd":"D:/Projects/example"}}
```

The result includes a runtime `sessionId`, the durable `providerSessionId`, provider name, and capabilities. Use the runtime handle for turn and interaction methods; use the durable provider ID as `resumeId` when creating a resumed session.

| Method | Parameters |
| --- | --- |
| `initialize`, `connector/capabilities` | `{}` |
| `session/create` | `provider`, `applicationId`, `cwd`; optional `model`, `systemPrompt`, `resumeId` |
| `session/list` | `provider`, `applicationId`; optional `scope: "all"` |
| `turn/send` | `sessionId`, `turnId`, `text` |
| `turn/cancel` | `sessionId`; optional `turnId` |
| `interaction/respond` | `sessionId`, `turnId`, `requestId`, `response` |
| `session/close` | `sessionId` |
| `shutdown` | `{}` |

Notifications have `method: "event"` and `params` containing `sessionId`, `turnId`, and a typed event. Message phases are `intermediate` or `final`. Events include text, thinking, activities, approvals, questions, artifacts, status, provider metadata, and terminal completion. Subscribe before sending a prompt. A turn's request remains pending while events stream; handle events and responses independently.

Approval responses are `{ "type": "approval", "decision": "allow" }` or `"deny"`. Question responses are `{ "type": "answers", "answers": [{ "questionId": "...", "choiceIds": ["..."], "customText": "..." }] }`; omit custom text for an offered choice. `{ "type": "cancel" }` cancels an interaction. Offered choices and custom-answer permissions are validated before forwarding answers.

Codex granular permission approval grants exactly the requested permission profile for the current turn; denial grants an empty profile. No connector automatically approves an interaction. Codex secret questions require a separate host UI and are rejected by this adapter.

## Frame integration and boundaries

Use `createJsonLineAgentConnection` with a host-provided `AgentLineTransport`, then `createAgentChatSession` with that connection and session options. These helpers do not spawn native processes or register shell views. The resulting chat can be embedded or registered explicitly using the existing chat view API.

The host owns process startup, credentials, the requested working directory, and artifact access. Local artifact paths remain metadata until the application's `resolveArtifact` authorizes and exposes them. Copilot file-edit artifacts and OpenCode file parts preserve paths; they do not turn native paths into browser `file:` URLs. Raw provider metadata is retained for details the common chat model does not represent.

One active turn is allowed per runtime session. Cancellation stops the active turn; session close removes the runtime handle while retaining provider history. Runtime disposal stops owned connections/processes and settles outstanding work. The OpenCode server remains externally owned.

Native session history is authoritative. The chat adapter rejects local clear/rewind/history replacement; create a new session for a new conversation. Text prompts are supported; native attachments require additional host integration. Gemini does not expose questions or artifacts through this adapter. Codex and Claude do not expose normalized artifacts. Capabilities describe connector support, not model availability or credential validity.

## Verification

From the repository root:

```powershell
cargo test --manifest-path agents/Cargo.toml
python -m unittest discover -s agents/python -p 'test_*.py'
```

Rust process-wire tests use Python from `FRAME_TEST_PYTHON` or `python` on `PATH`. They run strict offline fake peers. HTTP tests use loopback mock servers; Copilot callback tests use the SDK types without starting its runtime. The Python helper suite supplies a fake SDK and does not require installing Claude's SDK.

OpenCode's installed 1.19.3 server schema was inspected locally without prompts. Automated checks cover protocol framing, event mapping, scoped interactions, cancellation, and lifecycle behavior. They do not establish successful authentication, model access, real inference, or compatibility with every installed CLI version. Provider setup and a deliberately authorized live prompt remain host acceptance work.

