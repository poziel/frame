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

Register views, activity actions, settings, notifications, toolbar actions, and commands explicitly. The shell supplies layout controls, keyboard navigation, resize bars, workspace placeholders, and optional Settings UI and transient bottom-left notifications. Notification history, its bell, and its panel are available separately in @frame/extras. Host-specific footer content belongs in the status-actions slot.

Build locally with `bun run build:library` from the repository root. Only dist/, licenses/, and this README are package files. Vue is a peer dependency. All workspace packages are private; nothing is published.

`FrameLoader` supplies all 44 LDRS animation styles for standalone use. `FrameLoading` covers a region while keeping its content mounted and its task running. Choose optional text and animation, position text above/below/left/right, or customize the loader, text, or full overlay through slots. Bind `active` to the task state and clear it in `finally`; the region hides its content and prevents interaction until loading finishes. Both components work without a shell.

```vue
<FrameLoading :active="loading" variant="tailspin" label="Preparing workspace…">
  <WorkspaceContent />
</FrameLoading>
```
