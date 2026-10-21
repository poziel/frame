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

## Theme JSON: proposed contract

The current implementation exposes named `--frame-*` CSS color tokens. This pass establishes the default neutral dark palette and menu tokens; it does **not** add a JSON theme loader or theme-switching UI.

A suitable next step is a versioned JSON contract with semantic colors and partial overrides:

```json
{
  "version": 1,
  "id": "artoria-dark",
  "name": "Artoria Dark",
  "colors": {
    "application.background": "#181818",
    "workspace.background": "#101112",
    "surface.background": "#181818",
    "border": "#2b2b2b",
    "text": "#cccccc",
    "focus": "#0078d4",
    "menu.background": "#1f1f1ff0",
    "menu.hover": "#303336",
    "menu.disabled": "#656565",
    "quickInput.selection": "#267b9b"
  }
}
```

Frame would validate the schema version and supported color values, merge supplied colors over the default theme, and translate semantic keys into CSS variables. Missing keys inherit defaults. The same resolved theme must reach portalled menus, quick input, and tooltips as well as the shell itself. Theme data should not contain executable code or arbitrary CSS.

Keep typography, spacing, and layout separate from color overrides so a palette change does not unexpectedly alter window geometry. App-specific colors can live in a separate app namespace. A light theme will also need explicit foreground, disabled, border, selection, scrollbar, and translucency values; changing the background alone is insufficient.

Until that loader is implemented, a consuming application can override the published `--frame-*` variables in its own stylesheet after importing `@frame/core/style.css`. Apply shared overrides at the document root so teleported overlays inherit them too.


