# @frame/tauri

Optional TypeScript host adapter for Frame. Core remains independent of Tauri.

```ts
import { createFrame } from '@frame/core';
import { createTauriHost } from '@frame/tauri';
const frame = createFrame({ host: createTauriHost() });
```

The consuming application owns its Tauri runtime, dialog/opener plugin registration, window configuration, and capability permissions. This package contains no Rust and no terminal execution backend. See [host integration](../../docs/guides/hosts.md) for setup and migration.

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
