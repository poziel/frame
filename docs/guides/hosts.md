# Host integration

Frame is a Vue/TypeScript framework. Core, Features and browser Docs require no Rust toolchain. Core contains no Tauri or Electron imports. Native runtimes belong to consuming applications.

## Browser

`createFrame()` uses browser defaults. `frame.host.files?.pick({ multiple: true, accept: '.png,.jpg' })` resolves selected `{ name, file }` entries, or `[]` on cancellation. Browser files have no filesystem path. `accept` is a selection hint, not content validation. Call selection directly from a user action.

`frame.host.external?.openUrl('https://example.com')` uses a new browser tab. Only HTTP, HTTPS and mailto links are accepted. Browser popup policies still apply. Opening local paths in other applications and revealing them in a file manager are unavailable in the browser.

Browser fullscreen covers the document, including portalled menus. Minimize, maximize and native window close are unavailable.

The title bar renders only window controls supported by the host. Browser shells show no Minimize, Maximize, or Close buttons; a partial native adapter shows only the actions it implements. This uses `frame.host.window.supports(action)`, without browser sniffing or native-runtime imports.

## Tauri

Build Core, then `bun run build:hosts`, and install local archives for Core and `@frame/tauri` into the consuming application.

```ts
import { createFrame } from '@frame/core';
import { createTauriHost } from '@frame/tauri';

const frame = createFrame({ host: createTauriHost() });
const files = await frame.host.files?.pick({ accept: '.png,.jpg' });
// Native entries contain name/path. The host supplies any file reading policy.
```

The consuming Tauri application installs and registers `tauri-plugin-dialog` and `tauri-plugin-opener`. Grant its trusted local window the relevant capability permissions:

```json
[
  "core:default",
  "core:window:allow-is-maximized",
  "core:window:allow-is-fullscreen",
  "core:window:allow-minimize",
  "core:window:allow-toggle-maximize",
  "core:window:allow-close",
  "core:window:allow-set-fullscreen",
  "core:window:allow-start-dragging",
  "dialog:allow-open",
  "opener:default"
]
```

Pass `createTauriHost({ files: false })` to omit dialog support when the host already owns file selection, or `{ external: false }` to omit opener support. Only enable services whose native plugins are registered.

Opening arbitrary local paths may require additional scoped opener permissions. Configure these in the host; Frame does not broaden permissions. Native file filters accept comma-separated extensions such as `.png,.jpg`; MIME filters are browser-only. Configure native window decorations in the host to avoid duplicating its title bar.

For local `file:` development dependencies, Bun may try to resolve private peer packages from the public registry. Install packed archives together, or add a consumer-level `overrides` entry pointing `@frame/core` to the same local Core path. Keep Vue deduplicated in Vite (`resolve: { dedupe: ['vue'] }`) when using linked packages.

## Electron

Install `@frame/electron` alongside Core in the consuming Electron application. The package has separate renderer, main and preload entry points. Importing them installs nothing automatically.

Main process:

```ts
import { installElectronHost } from '@frame/electron/main';

const stopHost = installElectronHost({
  authorize: (window, url) => trustedWindows.has(window) && url === applicationUrl,
  allowPath: (window, path) => approvedPaths.get(window)?.has(path) ?? false,
});
// Call stopHost() during application teardown.
```

Preload:

```ts
import { exposeElectronHost } from '@frame/electron/preload';
exposeElectronHost();
```

Renderer:

```ts
import { createFrame } from '@frame/core';
import { createElectronHost, type ElectronHostBridge } from '@frame/electron';
declare global { interface Window { frameHost: ElectronHostBridge } }
const frame = createFrame({ host: createElectronHost(window.frameHost) });
```

Keep context isolation enabled and Node integration disabled. Bundle the preload for the host's chosen sandbox/module configuration. Handlers accept only authorized top-level frames and expose fixed operations rather than arbitrary IPC. Local file opening/reveal is denied unless the host supplies `allowPath`. Selecting a file does not automatically grant that permission. Electron dragging uses CSS drag regions supplied by the adapter.

## Custom hosts and lifecycle

Implement `FrameHost` from Core. Window, files and external services are independently optional. Supplying a host replaces the browser defaults; compose explicitly with `createBrowserHost()` when fallback services are desired.

Window methods are capabilities: omit unsupported methods. `getState` returns maximized/fullscreen state, and optional `subscribe` returns a cleanup function or a promise for one. Frame stops its subscriptions on `frame.dispose()`, including subscriptions that resolve after disposal. It does not close the native window or dispose caller-owned services. Observation failures are available through `frame.host.error`.

`frame.host.window.supports(action)` reports availability for minimize, maximize, close, fullscreen and drag. `execute('maximize')`, `execute('minimize')`, `execute('close')`, and `toggleFullscreen()` are the same operations used by shell commands and buttons. Close means close the current window, not quit the entire application.

Use one stable Frame instance per shell. Multiple frames may use different host adapters. Frames deliberately connected to the same native window observe that shared window state.

## Migration

- Core no longer detects Tauri. Pass `host: createTauriHost()` to retain native controls.
- Normal `@frame/core` and stylesheet imports stay unchanged.
- Terminal creation requires `createTerminal({ backend })`; the terminal UI requires its controller. There is no automatic native backend. Pass `openUrl: frame.host.external?.openUrl` for host-aware terminal links.
- Rust PTY code and native examples are extracted to the separate Frame Native companion. `packages/docs` is browser-only.

## Controller implementation

`frame.host` is a `HostController`. Its `window` is a `HostWindowController`,
which owns capability checks, state observation, and document fullscreen
listeners. Both expose the same readonly state projection. Disposal releases
Frame-owned subscriptions without disposing the supplied host services.

Browser defaults use a `BrowserHost` composed from lazy file-selection and URL
services. `createBrowserHost()` remains available and preserves the structural
`FrameHost` contract for applications composing their own adapters. Constructing
browser services performs no DOM access or user-visible operation.

See the [configuration implementation guide](../../packages/core/src/framework/configuration/README.md)
for class responsibilities, module ownership, and the Vue window-control adapter.
