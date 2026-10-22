<p align="center">
  <img src="assets/frame.svg" alt="Frame logo" width="120" />
</p>

<h1 align="center">Frame</h1>

<p align="center">
  An open-source application shell inspired by VS Code’s visual design, built with Rust, Tauri, Vue, and TypeScript as a reusable foundation for desktop apps.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat" alt="License: MIT" /></a>
  <a href="packages/core"><img src="https://img.shields.io/badge/package-%40frame%2Fcore-0098FF?style=flat" alt="Frame core package" /></a>
  <a href="https://github.dev/poziel/frame"><img src="https://img.shields.io/badge/Open_in-editor-007ACC?style=flat" alt="Open in browser editor" /></a>
</p>

Frame gives your application a workbench: a custom title bar, activity rail, resizable panels, workspace panes, command palette, and shared controls. Bring your own views and application logic, and register them with the shell.

Consume Frame as a dependency in your own project. Your application stays in its own repository, while Frame provides a shared foundation that you can update independently.

## What Frame provides

- **A configurable workbench.** Arrange side panels, bottom tabs, split workspace panes, and banners. Resize regions and move views between them.
- **Commands and navigation.** Register application actions with keyboard shortcuts and expose them through menus and Quick actions.
- **Reusable Vue controls.** Compose buttons, inputs, selects, sliders, tooltips, context menus, and movable, resizable modals.
- **Settings and notifications.** Supply your own settings sections and bottom-left notifications with expiry and action buttons. Add optional notification history through [`@frame/features`](packages/features).
- **A desktop host and browser preview.** Tauri provides the native window; preview the Vue shell in a browser, where native window controls are disabled.

Frame takes visual cues from VS Code’s workbench layout, panels, and controls. It is an independent project, not a fork of VS Code or a Microsoft product. It provides no code editor, terminal, file-handling system, or extension runtime.

Optional [Tailwind integration](packages/tailwind/README.md) supplies Tailwind and its Vite plugin for application developers. [Theme variables](docs/theme-variables.md) are shared between ordinary CSS and Tailwind utilities.

## Try the workbench

Install [Bun](https://bun.sh/) and, for the desktop application, Rust and the [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
git clone https://github.com/poziel/frame.git
cd frame
bun install
bun run tauri dev
```

For the browser preview, use `bun run dev` instead. The example application includes a component catalog and sample views; these contributions are separate from the core package.

Open Quick actions with **Ctrl+P**, **Ctrl+Shift+P**, or **Ctrl+T**. Use **Components**, **Features**, and **API** to browse documentation and interactive examples. **Ctrl+B** toggles the side panel; **Ctrl+J** toggles the bottom panel. Command works in place of Ctrl on macOS.

## Use Frame in your application

The reusable package is [`@frame/core`](packages/core). It exports the shell, controls, registration APIs, and TypeScript declarations. New instances start without the example app’s views, settings sections, or notifications.

The package is currently private and built locally. From this repository’s root, build and create an installable archive:

```sh
bun run build:library
cd packages/core
npm pack
```

In your separate Vue 3 application, install the generated archive using its actual path:

```sh
bun add /path/to/frame/packages/core/frame-core-0.1.0.tgz
```

Create the shell in your application’s `App.vue`:

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import '@frame/core/style.css';

const frame = createFrame({ settings: false, notifications: false });

onBeforeUnmount(() => frame.dispose());
</script>

<template>
  <FrameShell :frame="frame" title-text="My application">
    <main>Your application workspace</main>
  </FrameShell>
</template>
```

Register your Vue components as views, add commands, and enable settings or notifications when needed. Your host application owns its data, persistence, backend, and native Tauri configuration. See [Reusing Frame](docs/reusing-frame.md) for registration examples and [Package boundaries](docs/package-boundaries.md) for the Core, Features, and documentation application split.

## Development

Run these commands from the repository root:

```sh
bun run test
bun run build
bun run build:library
bun run check:consumer
cargo check --manifest-path packages/docs/src-tauri/Cargo.toml --locked
```

`build` checks TypeScript and builds the example frontend. `build:library` produces the core bundle and declarations, copies license notices, and checks for example-content leakage. `check:consumer` checks a consumer fixture against the generated declarations, so build the library first.

Use `bun run tauri build` to package the example desktop application.

## Documentation

- [External package integration and validation](docs/external-integration.md)
- [Shell integration and commands](docs/reusing-frame.md)
- [Library boundaries and theme design](docs/library-and-themes.md)
- [Layout controls](docs/layout.md) and [workspace panes](docs/workspace.md)
- [View interactions](docs/view-interactions.md) and [modals](docs/modals.md)
- [Component catalog](docs/component-catalog.md) and [reusable controls](docs/reusable-controls.md)
- [Settings and notifications](docs/settings-and-notifications.md)
- [Icons and custom icon packs](docs/icons.md)

Frame is available under the [MIT license](LICENSE). Microsoft Codicons and other third-party assets retain their own licenses; see [Third-party notices and licenses](docs/licenses/THIRD_PARTY_NOTICES.md).
