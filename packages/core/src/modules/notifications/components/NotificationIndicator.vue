<script setup lang="ts">
import {FrameIconButton} from '../../../index';
import type {NotificationHistory} from '../controllers/notificationHistory';

defineProps<{
  /** Caller-owned notification history; this presentation does not dispose it. */
  history: NotificationHistory;
}>();
</script>
<template>
  <FrameIconButton
    v-if="history.state.indicatorEnabled"
    class="notification-toggle"
    :label="`Notification history (${history.state.items.length})`"
    :icon="history.state.items.length ? 'bell-dot' : 'bell'"
    :aria-expanded="history.state.open"
    @click="history.toggle()"
  />
</template>

<style lang="scss">
.notification-toggle {
  flex-shrink: 0;
}
</style>
