<p align="center">
  <img src="assets/frame.svg" alt="Frame logo" width="120" />
</p>

<h1 align="center">Frame</h1>

<p align="center">
  A Vue and TypeScript application framework for building VS Code–inspired interfaces, with optional host integrations and feature backends.
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
- **Settings and notifications.** Supply your own settings sections and bottom-left notifications with expiry and action buttons. Add optional notification history through [`@frame/core/modules/*`](packages/core/src/modules).
- **Explicit host integration.** Run in a browser, or supply an optional Tauri or Electron adapter for native window controls and file operations.

Frame takes visual cues from VS Code’s workbench layout, panels, and controls. It is an independent project, not a fork of VS Code or a Microsoft product. Core focuses on the shell and shared controls. Optional editor, terminal, chat, and viewer components are provided by `@frame/core/modules/*`.

Optional [Tailwind integration](packages/tailwind/README.md) supplies Tailwind and its Vite plugin for application developers. [Theme variables](docs/styling/theme-variables.md) are shared between ordinary CSS and Tailwind utilities.

## Try the workbench

Install [Bun](https://bun.sh/). Frame and its browser documentation require no Rust toolchain.

```sh
git clone https://github.com/poziel/frame.git
cd frame
bun install
bun run dev
```

The example application includes a component catalog and sample views; these contributions are separate from the core package.

Open Quick actions with **Ctrl+P** or **Ctrl+Shift+P**. Use **Components**, **Modules**, and **API** to browse documentation and interactive examples. **Ctrl+B** toggles the side panel; **Ctrl+J** toggles the bottom panel. Command works in place of Ctrl on macOS.

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

Register your Vue components as views, add commands, and enable settings or notifications when needed. Your host application owns its data, persistence, backend, and native host configuration. See [Reusing Frame](docs/shell/commands.md) for registration examples and [Package boundaries](docs/reference/packages.md) for the Core modules and documentation application responsibilities.

## Development

Run these commands from the repository root:

```sh
bun run test
bun run build
bun run build:library
bun run check:consumer
bun run build:hosts
```

`build` checks TypeScript and builds the example frontend. `build:library` produces the core bundle and declarations, copies license notices, and checks for example-content leakage. `check:consumer` checks a consumer fixture against the generated declarations, so build the library first.

Docs is a browser application in `packages/docs`. Native terminal execution lives in the separate Frame Native companion. See [host integration](docs/guides/hosts.md) for Tauri, Electron, browser behavior, and migration.

## Documentation

Start with the [documentation index](docs/README.md).

AI coding assistants can start with [llms.txt](llms.txt), a focused index of the library guides and component references.

- [Build a small application](docs/guides/getting-started.md)
- [Creation options and runtime configuration](docs/configuration/frame-options.md)
- [Shell contributions](docs/shell/README.md)
- [Integrate an existing application](docs/guides/existing-app.md)
- [Theme variables](docs/styling/theme-variables.md)
- [Package responsibilities](docs/reference/packages.md)

Frame is available under the [MIT license](LICENSE). Microsoft Codicons and other third-party assets retain their own licenses; see [Third-party notices and licenses](docs/licenses/THIRD_PARTY_NOTICES.md).
