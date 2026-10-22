# Frame core

An empty Vue workbench and reusable controls. No documentation sidebar, sample views, component examples, seeded notifications, or application preferences are registered automatically.

```vue
<script setup lang="ts">
import { createFrame, FrameShell } from '@frame/core';
import '@frame/core/style.css';
const frame = createFrame({ settings: false, notifications: false });
</script>
<template><FrameShell :frame="frame" title-text="My application" :show-search="false" /></template>
```

Register views, activity actions, settings, notifications, toolbar actions, and commands explicitly. The shell supplies layout controls, keyboard navigation, resize bars, workspace placeholders, and optional Settings UI and transient bottom-left notifications. Notification history, its bell, and its panel are available separately in @frame/features. Host-specific footer content belongs in the status-actions slot.

Enable Back and Forward beside the search bar with `createFrame({ navigation: true })`. Navigation tracks `setWorkspacePane` (including `workspace.setPane`) and opening registered views. Call `frame.navigation.back()` / `forward()` and read the reactive `canGoBack` / `canGoForward` flags. Opening a new destination after Back discards the forward path. Set `frame.layout.navigationVisible` to hide or show both arrows, also available from the workspace context menu and Customize Layout. Hiding preserves history; setting `frame.features.navigation = false` disables and clears it. `navigation.clear()` starts a fresh history after initial application setup. History is per frame, in memory, and does not undo edits or split geometry. Use `navigation.record(() => { /* related synchronous navigation calls */ })` to group a destination that updates several regions.

`FrameCodeBlock` displays read-only code with Shiki. Set `code`, `language`, `theme` (`CodeBlockTheme`), `lineNumbers`, `highlightOnHover`, `highlightedLines`, and `startLine`. Highlighted line numbers include the start offset. All 65 bundled themes are exposed through the enum and `codeBlockThemeOptions`. Languages and themes load on demand, with a shared highlighter. Unknown languages or highlighting failures leave readable plain text. Optional `wrap` and `copyable` control wrapping and the copy toolbar. The component emits `error` if highlighting fails. No shell is required.

Build locally with `bun run build:library` from the repository root. Only dist/, licenses/, and this README are package files. Vue is a peer dependency. All workspace packages are private; nothing is published.

Secondary sidebars and bottom panels always expose Maximize/Restore and Close. A separator precedes these controls only when the active view supplies additional actions. Maximize preserves the preferred widths/heights and mounted content. The secondary sidebar fills the workbench except for the activity bar. Bottom panels extend upward through the workspace, also covering the primary sidebar for left alignment, the secondary sidebar for right alignment, both for justify, and neither for center. This follows the named regions when the primary sidebar changes sides. The title/status bars remain outside the maximized region. Set `frame.layout.maximizedRegion` to `"secondary"`, `"bottom"`, or `null` to control it programmatically; closing the maximized region clears the state.

`FrameLoader` supplies all 44 LDRS animation styles for standalone use. `FrameLoading` covers a region while keeping its content mounted and its task running. Choose optional text and animation, position text above/below/left/right, or customize the loader, text, or full overlay through slots. Bind `active` to the task state and clear it in `finally`; the region hides its content and prevents interaction until loading finishes. Both components work without a shell.

```vue
<FrameLoading :active="loading" variant="tailspin" label="Preparing workspace…">
  <WorkspaceContent />
</FrameLoading>
```

## Form components

Frame includes themed Reka-backed form, color, calendar, and date/time compositions. See [Forms](../../docs/forms.md) for coverage, model types, native input behavior, and upstream Alpha status. Controls work independently of a Frame instance; picker popups also integrate with shell overlay boundaries.
