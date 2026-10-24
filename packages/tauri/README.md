# @frame/tauri

Optional TypeScript host adapter for Frame. Core remains independent of Tauri.

```ts
import { createFrame } from '@frame/core';
import { createTauriHost } from '@frame/tauri';
const frame = createFrame({ host: createTauriHost() });
```

The consuming application owns its Tauri runtime, dialog/opener plugin registration, window configuration, and capability permissions. This package contains no Rust and no terminal execution backend. See [host integration](../../docs/guides/hosts.md) for setup and migration.
