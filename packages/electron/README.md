# @frame/electron

Optional TypeScript Electron host integration. Use `createElectronHost` in the renderer, `exposeElectronHost` from `@frame/electron/preload`, and `installElectronHost` from `@frame/electron/main`.

The consuming application owns Electron, BrowserWindow configuration, preload bundling, and authorization policy. Context isolation remains enabled. The bridge exposes fixed operations; file opening/reveal requires an explicit host path policy. See [host integration](../../docs/guides/hosts.md).

Build Core first, then run `bun run build:hosts`. Nothing is registered by importing these entry points.
