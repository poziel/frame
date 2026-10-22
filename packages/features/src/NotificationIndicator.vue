<script setup lang="ts">
import { FrameIconButton } from "@frame/core";
import type { NotificationHistory } from "./notificationHistory";
defineProps<{ history: NotificationHistory }>();
</script>
<template><FrameIconButton v-if="history.state.indicatorEnabled" class="notification-toggle" :label="`Notification history (${history.state.items.length})`" :icon="history.state.items.length ? 'bell-dot' : 'bell'" :aria-expanded="history.state.open" @click="history.toggle()"/></template>
