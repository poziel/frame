<p align="center">
  <img src="assets/frame.svg" alt="Frame logo" width="120" />
</p>

<h1 align="center">Frame</h1>

<p align="center">
  A Vue and TypeScript application framework for building VS Code–inspired interfaces, with optional host integrations and feature backends.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat" alt="License: MIT" /></a>
  <a href="https://www.npmjs.com/package/@poziel/frame-core"><img src="https://img.shields.io/npm/v/%40poziel%2Fframe-core?style=flat&amp;label=npm" alt="Frame core on npm" /></a>
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

Open the [live documentation and interactive examples](https://frame.poziel.dev/)
to explore the shell and controls without installing anything.

To run the documentation application locally:

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

The reusable Core package exports the shell, controls, registration APIs, and
TypeScript declarations. New instances start without the example app's views,
settings sections, or notifications.

### Install from npm

Frame's five packages are public on npm at **0.1.0**. Install them in your own
Vue 3 application (Vue `^3.5.13`); no npm account, download token, or repository
access grant is required.

| Package on npm                                                                   | Import name       | Provides                                                              |
| -------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| [`@poziel/frame-core`](https://www.npmjs.com/package/@poziel/frame-core)         | `@frame/core`     | Shell, controls, commands, settings, and optional module entry points |
| [`@poziel/frame-themes`](https://www.npmjs.com/package/@poziel/frame-themes)     | `@frame/themes`   | Optional theme presets                                                |
| [`@poziel/frame-tailwind`](https://www.npmjs.com/package/@poziel/frame-tailwind) | `@frame/tailwind` | Optional Tailwind and Vite integration                                |
| [`@poziel/frame-tauri`](https://www.npmjs.com/package/@poziel/frame-tauri)       | `@frame/tauri`    | Optional Tauri host adapter                                           |
| [`@poziel/frame-electron`](https://www.npmjs.com/package/@poziel/frame-electron) | `@frame/electron` | Optional Electron renderer, preload, and main-process integration     |

Start with Core:

```sh
bun add '@frame/core@npm:@poziel/frame-core@0.1.0'
```

The alias installs the published `@poziel/frame-core` package under
`@frame/core`, preserving the imports used throughout Frame's documentation.
Use this alias pattern for optional packages too. For npm users, the equivalent is:

```sh
npm install '@frame/core@npm:@poziel/frame-core@0.1.0'
```

If you previously installed from GitHub Packages, remove its `@poziel:registry`
mapping from your application's `.npmrc`, or change it to
`@poziel:registry=https://registry.npmjs.org`. Refresh the affected lockfile
entries if they still point to GitHub downloads.

### Create your first Frame

Put this in your Vue application's `App.vue`:

```vue
<script setup lang="ts">
import {onBeforeUnmount} from 'vue';
import {Frame, FrameShell} from '@frame/core';

const frame = new Frame({settings: false, notifications: false});

onBeforeUnmount(() => frame.dispose());
</script>

<template>
  <FrameShell :frame="frame" title-text="My application">
    <main>
      <h1>My application</h1>
      <p>Your application workspace starts here.</p>
    </main>
  </FrameShell>
</template>

<style>
html,
body,
#app {
  margin: 0;
  height: 100%;
}
</style>
```

`Frame` coordinates shell state and lifecycle; `FrameShell` renders it. Core's
JavaScript entry includes its styles automatically. The global height rule gives
the shell room to fill the page, and `dispose()` releases its owned resources
when the component unmounts. `createFrame(options)` is also available as a
convenience function returning the same kind of instance.

Register your Vue components as views, add commands, and enable settings or
notifications when needed. Your host owns its data, persistence, backend, and
native configuration. Continue with [getting started](docs/guides/getting-started.md),
[shell contributions](docs/shell/README.md), and [package boundaries](docs/reference/packages.md).

### Add optional packages and modules

Install only what your application uses:

```sh
bun add '@frame/themes@npm:@poziel/frame-themes@0.1.0'
bun add --dev '@frame/tailwind@npm:@poziel/frame-tailwind@0.1.0'
```

For a native application, choose the adapter matching its runtime:

```sh
# Tauri host
bun add '@frame/tauri@npm:@poziel/frame-tauri@0.1.0'

# Electron host
bun add '@frame/electron@npm:@poziel/frame-electron@0.1.0'
```

For example, select a preset by replacing the creation call in `App.vue`:

```ts
import {vscodeLight2026} from '@frame/themes';

const frame = new Frame({
  settings: false,
  notifications: false,
  theme: vscodeLight2026,
});
```

Editor, terminal, viewer, chat, and notification history modules already ship
inside Core. Import them through `@frame/core/modules/editor`, `/terminal`,
`/viewer`, `/chat`, or `/notifications`; they need no separate npm package.
Their creation, adapters, and view registration remain explicit.

See the [theme presets](packages/themes/README.md), [Tailwind setup](packages/tailwind/README.md),
and [host integrations](docs/guides/hosts.md) for the corresponding configuration.
Tailwind integration requires Vite 8; applications provide Vue and their chosen
Tauri or Electron runtime.

### GitHub Packages mirror

The same package names and versions are also published to GitHub Packages,
linked to this repository. npm is the recommended source for application installs.
GitHub's npm registry requires authentication even for public packages; a public
GitHub repository does not remove that requirement.

To use the mirror, route the scope in your application's `.npmrc`:

```ini
@poziel:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Use the same alias installation commands with a GitHub personal access token
(classic) that has `read:packages`. A consumer's GitHub Actions workflow can instead use its
`GITHUB_TOKEN` when that repository has been granted package read access.
See [publishing and registry installation](docs/guides/github-packages.md) for
permissions, trusted publishing, and development builds.

Local links and archives remain available for cross-repository development;
see [local package development](docs/guides/getting-started.md#install-the-packages).

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

Docs is a browser application in `packages/docs`. Native terminal execution lives
in the separate [Frame Server](https://github.com/poziel/frame-server) project.
See [host integration](docs/guides/hosts.md) for Tauri, Electron, browser behavior,
and migration.

## Documentation

Native execution libraries live in the separate
[Frame Server](https://github.com/poziel/frame-server) project. Its Rust agent
connectors and terminal engine can be embedded independently of Frame's UI.
Framework-specific bridges remain in Frame's host packages.

Start with the [documentation index](docs/README.md).

AI coding assistants can start with [llms.txt](llms.txt), a focused index of the library guides and component references.

- [Build a small application](docs/guides/getting-started.md)
- [Creation options and runtime configuration](docs/configuration/frame-options.md)
- [Shell contributions](docs/shell/README.md)
- [Integrate an existing application](docs/guides/existing-app.md)
- [Theme variables](docs/styling/theme-variables.md)
- [Package responsibilities](docs/reference/packages.md)

Frame is available under the [MIT license](LICENSE). Microsoft Codicons and other third-party assets retain their own licenses; see [Third-party notices and licenses](docs/licenses/THIRD_PARTY_NOTICES.md).
