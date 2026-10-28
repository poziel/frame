# @frame/tauri

Optional TypeScript host adapter for Frame. Core remains independent of Tauri.

```ts
import { createFrame } from '@frame/core';
import { createTauriHost } from '@frame/tauri';
const frame = createFrame({ host: createTauriHost() });
```

The consuming application owns its Tauri runtime, dialog/opener plugin registration, window configuration, and capability permissions. See [host integration](../../docs/guides/hosts.md) for setup and migration.

## Optional terminal bridge

Import `createTauriTerminalBackend` from `@frame/tauri/terminal` and supply the
result explicitly to `createTerminal({backend})` from `@frame/core/modules/terminal`.
Creating the transport starts no shell. The host must also register the Rust
plugin from Frame Server's `frame-terminal` crate with its `tauri` feature.
For local development, use this sibling checkout dependency:

```toml
frame-terminal = { path = "../../frame-server/packages/terminal-rust", features = ["tauri"] }
```

Adjust the path relative to the application's Cargo.toml. Register
`.plugin(frame_terminal::tauri::init())` on the Tauri builder and grant
`frame-terminal:default` only to trusted local webviews. Never take terminal
owner identities from frontend arguments. The bridge derives them from Tauri
and closes sessions when their owning window is destroyed.

The plugin is thin Rust glue; execution lives in the independent
[`frame-terminal`](https://github.com/poziel/frame-server) library. These optional
adapters require the updated local Frame Server sources until released. Other
Rust hosts can embed that engine directly without enabling `tauri`. This
package does not provide an Electron terminal bridge.

## Optional agent bridge

`@frame/tauri/agents` exports `connectTauriAgent` and `TauriAgentConnection`.
The application supplies its native setup command so credentials, provider
configuration, tools, and application policy stay in its Rust host:

```ts
import {invoke} from '@tauri-apps/api/core';
import {connectTauriAgent} from '@frame/tauri/agents';

const {connection, info} = await connectTauriAgent(events =>
  invoke<{runtimeId: string}>('my_app_connect', {events})
);
// Supply connection to createAgentChatSession from @frame/core/modules/chat.
// Dispose the connection when its application-owned scope closes.
await connection.dispose();
```

Enable `tauri` on the Rust `frame-agent-connectors` crate. Implement its
`tauri::AgentHost` policy trait and register
`.plugin(frame_agent_connectors::tauri::init(MyAgentHost))`. Grant
`frame-agent-connectors:default` only to trusted local webviews. The native
setup command creates a runtime and returns its identity; it can use
`tauri::event_sink` to forward runtime events and dispose on receiver failure.
Do not send provider credentials to the renderer.

The reusable plugin handles request/disconnect IPC and window-close callbacks.
The policy implementation must check the native `AgentContext.webview` against
the connection owner, constrain operations, and implement `close_window`.
The application must also await runtime cleanup on application exit. Importing
these adapters starts no connection, provider, or shell.

## Implementation structure

`src/index.ts` preserves `createTauriHost()` and exports `TauriHost` plus the
named `TauriHostOptions` contract. `src/host/tauriHost.ts` owns the current-window
handle, capability facades, file filtering, and state subscription behavior.
Each class member follows the shared TSDoc, spacing, and parameter conventions.

Constructing the adapter resolves a window handle without invoking native
commands. Importing it resolves no window. Optional file/external capabilities
remain disabled when explicitly false. Bound callbacks retain their owner;
subscription cleanup suppresses in-flight events after removal. The application
continues to own native permissions, processes, plugins, and window lifetime.
