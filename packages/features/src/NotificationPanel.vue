<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { FrameIconButton, FrameIcon, type Frame } from "@frame/core";
import type { NotificationHistory } from "./notificationHistory";
const props = withDefaults(defineProps<{ frame: Frame; history: NotificationHistory; bottom?: number }>(), { bottom: 8 });
const frame = props.frame;
const history = props.history;
const panel = ref<HTMLElement>();
const emit = defineEmits<{ close: [] }>();
const icons = { info: "info", success: "pass", warning: "warning", error: "error" };
function close() { history.state.open = false; emit("close"); }
function key(event: KeyboardEvent) { if (event.defaultPrevented || frame.modals.length) return; if (event.key === "Escape" && history.state.open) { event.preventDefault(); event.stopPropagation(); close(); } }
function dismiss(id: number) {
  const index = history.state.items.findIndex(item => item.historyId === id);
  history.dismiss(id);
  void nextTick(() => { const rows = panel.value?.querySelectorAll<HTMLElement>(".notification-item"); (rows?.[Math.min(index, rows.length - 1)] ?? panel.value?.querySelector<HTMLElement>("[aria-label='Hide notifications']"))?.focus(); });
}
function clear() { history.clear(); void nextTick(() => panel.value?.querySelector<HTMLElement>("[aria-label='Hide notifications']")?.focus()); }
onMounted(() => window.addEventListener("keydown", key)); onBeforeUnmount(() => window.removeEventListener("keydown", key));
</script>
<template><section ref="panel" v-if="history.state.open" class="notification-center" :style="{ bottom: `${bottom}px` }" aria-label="Notifications"><header><h2>Notifications</h2><span class="notification-spacer"/><FrameIconButton label="Clear all notifications" icon="clear-all" :disabled="!history.state.items.length" @click="clear"/><FrameIconButton label="Hide notifications" icon="chevron-down" @click="close"/></header><div class="notification-list"><article v-for="item in history.state.items" :key="item.historyId" class="notification-item" :class="item.severity" tabindex="0" @dblclick="item.expanded = !item.expanded" @keydown.enter.self.prevent="item.expanded = !item.expanded" @keydown.space.self.prevent="item.expanded = !item.expanded"><div class="notification-row"><FrameIcon :name="icons[item.severity]" class="notification-severity"/><span class="sr-only">{{ item.severity }}: </span><span class="notification-title">{{ item.title }}</span><small v-if="item.priority">{{ item.priority }}</small><div class="notification-actions"><FrameIconButton :label="`${item.expanded ? 'Collapse' : 'Expand'} notification: ${item.title}`" :icon="item.expanded ? 'chevron-up' : 'chevron-down'" :aria-expanded="item.expanded" @click.stop="item.expanded = !item.expanded" @dblclick.stop/><FrameIconButton :label="`Clear notification: ${item.title}`" icon="close" @click.stop="dismiss(item.historyId)" @dblclick.stop/></div></div><div v-if="item.expanded" class="notification-details"><p v-if="item.details">{{ item.details }}</p><small v-if="item.source">Source: {{ item.source }}</small><p v-if="!item.details && !item.source">No additional details.</p></div></article><p v-if="!history.state.items.length" class="notifications-empty">No notifications.</p></div></section></template>
