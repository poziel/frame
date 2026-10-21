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

Register views, activity actions, settings, notifications, toolbar actions, and commands explicitly. The shell supplies layout controls, keyboard navigation, resize bars, workspace placeholders, and optional Settings/Notifications affordances. Host-specific footer content belongs in the status-actions slot.

Build locally with `bun run build:library` from the repository root. Only dist/, licenses/, and this README are package files. Vue is a peer dependency. Both workspace packages are private; nothing is published.
