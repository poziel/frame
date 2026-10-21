# External package integration

## Validation

The core package was packed as an npm archive and installed into an independent Vue/Vite application in an operating-system temporary directory. The consumer has its own manifest, dependencies, TypeScript configuration, production build, and Rust/Tauri host. It uses only `@frame/core` and `@frame/core/style.css`; there are no Frame source aliases or workspace dependencies.

Repeat the validation with [the consumer fixture](../tests/fixtures/external-consumer/README.md) and [validation script](../scripts/validate-external-consumer.ps1).

Validated on Windows on 2026-10-21:

| Check | Result |
| --- | --- |
| Archive installed as an extracted dependency outside the repository | Passed |
| Strict consumer TypeScript check, including dependency declarations | Passed |
| Consumer production build | Passed; bundle-size warning |
| Chromium interaction suite | 10 check groups passed; no browser errors |
| Independent Tauri/WebView2 native smoke test | 5 check groups passed |

The consumer used Vue 3.5.13, Vite 8.3.5, TypeScript 6.0.3, Tauri JavaScript API 2.12.4, and Rust Tauri 2.12.5. Native compilation reused the local Cargo build cache, not Frame's Rust application source. The fixture imports core only; optional Extras integration was not tested.

## Host requirements confirmed

- Use Vue 3 compatible with the package's peer dependency.
- Import `@frame/core/style.css` explicitly.
- Give the document and mount element a height; the fixture uses `html, body, #app { margin: 0; height: 100%; }`.
- With current Tauri API declarations, strict checking of dependency declarations requires `ESNext.Disposable` in TypeScript's `lib` array. The fixture uses `["ES2020", "DOM", "ESNext.Disposable"]` and `skipLibCheck: false`.
- Register application views, commands, settings sections, and notifications yourself. The core does not register the documentation application's contributions.
- The native host must provide its own Tauri configuration and capabilities. See [the fixture capabilities](../tests/fixtures/external-consumer/src-tauri/capabilities/default.json). `allow-unminimize` is used by the test harness, not by Frame.
- The host's own Rust commands and IPC continue to work alongside Frame. Frame's window controls do not require copying Frame's Rust application into the consumer.
- Dispose the Frame instance when its shell is destroyed.

## Scope and remaining work

Browser coverage includes custom sidebar and bottom views, Frame context injection, input binding, buttons, host keyboard commands, Quick actions, modals, settings, notifications, bundled icons and branding, CSS, sidebar toggling, and a narrow viewport.

The Windows native smoke test checks mounting in WebView2, a host Rust command, native window state queries, maximize, fullscreen, minimize/restore, and a host Frame command. It runs hidden; manual native visual inspection, dragging the title bar, close-button interaction, installers, macOS, and Linux are outside this validation.

The consumer production build reports a JavaScript chunk larger than 500 kB. Unused Vite, Tauri, and Vue starter SVGs have been removed. Package builds do not copy the public directory; license notices are included once under the package licenses directory.

This validates a new minimal host, not migration of an existing production application or compatibility with arbitrary global styles. No package is published by the validation process.
