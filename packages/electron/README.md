# @frame/electron

Optional TypeScript Electron host integration. Use `createElectronHost` in the renderer, `exposeElectronHost` from `@frame/electron/preload`, and `installElectronHost` from `@frame/electron/main`.

The consuming application owns Electron, BrowserWindow configuration, preload bundling, and authorization policy. Context isolation remains enabled. The bridge exposes fixed operations; file opening/reveal requires an explicit host path policy. See [host integration](../../docs/guides/hosts.md).

Build Core first, then run `bun run build:hosts`. Nothing is registered by importing these entry points.

## Implementation structure

Each public entry remains separate: `src/index.ts` for renderer use,
`src/preload.ts` for the isolated preload, and `src/main.ts` for main-process
installation. None registers handlers or exposes globals merely by importing.

- `renderer/electronHost.ts`: `ElectronHost` adapts the supplied bridge to Frame
  capabilities. `createElectronHost()` still returns the structural `FrameHost`.
- `preload/electronPreloadHost.ts`: `ElectronPreloadHost` builds and explicitly
  exposes a plain bridge. It never exposes raw IPC or a class prototype.
- `main/electronHostInstallation.ts`: `ElectronHostInstallation` owns installed
  handlers and per-window listeners. Installation failure rolls back handlers;
  its bound `dispose()` releases resources once.
- `types/`: documented bridge and host authorization contracts.

Factories retain their existing signatures and behavior. The application owns
windows, preload lifetime, and authorization. A Frame owns only the subscriptions
it creates. Renderer imports never import Electron main/preload implementation.
