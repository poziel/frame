# Using Frame as a library

Frame can be a separate project imported by an existing application. The application does not move into this repository. This is the supported division:

| Frame library | Consuming application (for example, Artoria) |
| --- | --- |
| Shell layout and title bar | App identity and product screens |
| Menus, quick input, tabs, tooltips | App-owned commands and Vue components |
| Panel registration and selection | App data, stores, business rules |
| Theme tokens and default styles | Choice of colors and future theme JSON |
| Optional Tauri window-control calls | Tauri binary, capabilities, config, and backend |

`packages/docs/src/App.vue` and `packages/docs/src/examples/` are a development preview. The library entry point never imports them, and the library build excludes the preview, example styles, Rust project, and desktop executables.

## Local package workflow

1. In the Frame repository, run `bun run build:library`.
2. In the existing application's package.json, add a local dependency such as `"@frame/core": "file:../frame/packages/core"` and install with that application's package manager. A workspace dependency is another option if both projects belong to a monorepo.
3. Import the library and its stylesheet:

```vue
<script setup lang="ts">
import { createFrame, FrameShell } from "@frame/core";
import "@frame/core/style.css";
import MyOverview from "./MyOverview.vue";
import YourApplicationCanvas from "./YourApplicationCanvas.vue";

const frame = createFrame();
frame.registerSidePanel({ id: "artoria.overview", label: "Overview", component: MyOverview });
</script>

<template>
  <FrameShell :frame="frame" title-text="Artoria" :show-search="false">
    <YourApplicationCanvas />
  </FrameShell>
</template>
```

Use a compatible Vue 3.5+ installation in the host. Vue and Tauri's JavaScript API remain external to the compiled library. If a linked workspace resolves more than one Vue copy, configure the host's Vite `resolve.dedupe: ['vue']`.

The library output is ESM (`packages/core/dist/frame.js`), CSS (`packages/core/dist/frame.css`), and TypeScript declarations. It remains private; nothing is published. Rebuild Frame after changing its source. A local package's copy/link refresh behavior depends on the consuming package manager.

`bun run check:consumer` checks a fixture that imports the built package through its public exports. Run it after `build:library`.

## Tauri remains with the host

The existing application retains its own `src-tauri` directory. To use Frame's custom title bar, the host disables native decorations and grants its main window the minimize, close, toggle-maximize, and start-dragging capabilities. The preview's `packages/docs/src-tauri/tauri.conf.json` and `packages/docs/src-tauri/capabilities/default.json` are examples, not files the library silently changes or distributes.

Browser hosts work too; native window controls and commands are disabled there.

## Title bar and menus

`FrameShell` accepts:

- `titleText`: any text for the centered search button or plain title.
- `showSearch`: defaults to true; false replaces the search button with a draggable plain title. Keyboard quick actions remain available.
- `menuItems`: optional complete replacement for the application dropdown. Omit it to use the generated Views, Layout, and Window menu.

`FrameMenu` is also exported independently. Supply its `anchor` HTML element, a `label`, and `items`, and handle `close` and `select`. A `FrameMenuItem` is either a separator or an entry with `id`, `label`, and optional `command`, `shortcut`, `checked`, `disabled`, and `children`. `checked: false` reserves the same gutter as `checked: true`. Children use the same item structure, allowing nested flyouts. IDs should be stable and contain no whitespace.

The shell routes an entry's `command` through the registered command system. Standalone menus emit the selected item to their owner, so they can be used without Frame's command registry. Checkbox state belongs to the caller; invoking the item does not silently mutate it.

Menus support keyboard arrows, Home/End, Escape, disabled rows, and flyouts that flip left or clamp vertically when space is limited. Their foggy backdrop is CSS translucency and blur with an opaque fallback; it is not a native Windows Mica material.

The Customize Layout button opens the shared quick-input component without a search field. It now exposes visibility, sidebar position, panel alignment, quick-input position, density, fullscreen, Zen, and centered-layout settings. See [Layout controls](layout.md).

## Themes and optional Tailwind

Frame's public theme variables now cover colors, fonts, spacing, radii, shadows, and motion. See [Theme variables](theme-variables.md) for the defaults, precedence, and current component coverage. Themes override CSS variables at the document root so shell content and portalled overlays inherit the same values.

The earlier colors-only JSON proposal is superseded by that broader contract. An uploaded-theme loader and selection UI remain future work. Existing components are not yet fully migrated from hard-coded visual values.

Tailwind is an optional, separate package. See [@frame/tailwind](../packages/tailwind/README.md) for local installation, the Vite plugin, stylesheet imports, and integration with applications that already use Tailwind. Core works without it.

Reka UI is installed as a Core dependency for future interaction primitives; existing controls retain their behavior in this change. Reka is installed through the package manager and lockfile, rather than copying its upstream source into this repository.
