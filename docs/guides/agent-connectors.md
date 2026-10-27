# Connecting an AI chat to local agents

`@frame/core/modules/chat` provides the provider-neutral `AgentConnection` interface, `createJsonLineAgentConnection`, and `createAgentChatSession`. The Rust implementation lives in the companion `frame-native/agents` directory. It supports Codex App Server, Claude through a Python Agent SDK helper, Gemini ACP, GitHub Copilot SDK, and OpenCode HTTP/SSE.

The host starts and owns the native service. Importing Features starts no process, authentication, or model request. A session is created only when the application explicitly calls the factory; a model turn starts when the user sends a prompt.

```ts
import { createAgentChatSession, createJsonLineAgentConnection } from '@frame/core/modules/chat';

// Host-provided IPC: write sends text to the service's stdin;
// subscribe delivers decoded UTF-8 stdout chunks and returns an unsubscribe function.
const connection = createJsonLineAgentConnection(hostAgentTransport);
const agent = await createAgentChatSession(connection, {
  provider: 'claude',
  applicationId: 'pixloom',
  cwd: projectDirectory,
});
// Render <AIChat :chat="agent.chat" /> inside application content,
// or explicitly register the application's view in the chosen Frame container.

await agent.dispose();
connection.dispose();
// The host must also stop its service and release its IPC resources.
```

The `hostAgentTransport` and `projectDirectory` above are application-owned integration points, not Frame globals. A Tauri host can call `AgentRuntime::handle` through a native command and forward its events to an `AgentConnection`. An Electron host can bridge the JSONL executable through its main/preload layers. Never expose arbitrary process spawning to untrusted web content.

Messages, exposed thinking summaries, tool activity, approvals, and choice/free-text questions map into the existing chat turn interface. Actual capability support is returned with each session; providers do not expose identical events. Provider metadata is available through `onMetadata`. A native artifact path is exposed only through the explicit host `resolveArtifact` callback; the host authorizes that path and owns any resulting URL.

Configure the native runtime with `applicationId`, `allowedRoots`, and an optional `historyPath`. Application-only history is the default. Access to all provider history requires both host `allowAllHistory: true` and an explicit `session/list` request with `scope: 'all'`. The ownership registry contains session metadata; it is not a persisted transcript store. A resumed backend session does not automatically restore the visible transcript: applications own transcript persistence and restoration.

Read the companion module's README for executable paths, Python environment setup, provider authentication, transport configuration, and capability limits. Authentication and subscription eligibility are provider-specific. This adapter does not convert subscriptions into API credentials.

File uploads are currently rejected before a native turn starts. Native context rewind/reset is not uniform across providers; use a new agent chat session to start a fresh conversation. The factory owns its native session handle, while the supplied connection and its underlying transport remain caller-owned.
