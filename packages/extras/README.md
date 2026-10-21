# Frame Extras

Optional ready-made features for Frame applications. Core never imports Extras. Extras has peer dependencies on @frame/core and Vue, and does not register anything merely by being imported.

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import { createNotificationHistory, NotificationPanel, NotificationIndicator } from '@frame/extras';
import '@frame/core/style.css';
import '@frame/extras/style.css';
const frame = createFrame();
const history = createNotificationHistory(frame, { limit: 200 });
onBeforeUnmount(() => { history.dispose(); frame.dispose(); });
</script>
<template>
  <FrameShell :frame="frame">
    <template #overlays><NotificationPanel :frame="frame" :history="history" :bottom="38" /></template>
    <template #status-actions><NotificationIndicator :history="history" /></template>
  </FrameShell>
</template>
```

The panel keeps a bounded in-memory history of notifications emitted after subscription. Expiring or dismissing a core notification does not delete history. Clearing history does not dismiss active messages. No bell, history, commands, or panel are installed by core. The application may register its own command using `history.toggle` and should dispose the history on unmount. Panel `bottom` is a pixel offset; adapt it when changing status-bar visibility or density.

Build core first with `bun run build:library`, then run `bun run build:extras`. Both are private workspace packages; nothing is published.

Future candidates are terminal, AI assistant/chat, and file explorer features. These are planned only. Applications must supply process, model-provider, and filesystem adapters; Extras should not start services or configure credentials.
