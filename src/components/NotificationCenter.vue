<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useFrame } from "../frame/createFrame";
import FrameIconButton from "./FrameIconButton.vue";
import FrameIcon from "./FrameIcon.vue";
const frame = useFrame();
withDefaults(defineProps<{ bottom?: number }>(), { bottom: 8 });
const panel = ref<HTMLElement>();
const emit = defineEmits<{ close: [] }>();
const icons = { info: "info", success: "pass", warning: "warning", error: "error" };
function close() { frame.notifications.state.open = false; emit("close"); }
function key(event: KeyboardEvent) { if (event.defaultPrevented || frame.modals.length) return; if (event.key === "Escape" && frame.notifications.state.open) { event.preventDefault(); event.stopPropagation(); close(); } }
function dismiss(id: string) {
  const index = frame.notifications.state.items.findIndex(item => item.id === id);
  frame.notifications.dismiss(id);
  void nextTick(() => { const rows = panel.value?.querySelectorAll<HTMLElement>(".notification-item"); (rows?.[Math.min(index, rows.length - 1)] ?? panel.value?.querySelector<HTMLElement>("[aria-label='Hide notifications']"))?.focus(); });
}
function clear() { frame.notifications.clear(); void nextTick(() => panel.value?.querySelector<HTMLElement>("[aria-label='Hide notifications']")?.focus()); }
onMounted(() => window.addEventListener("keydown", key)); onBeforeUnmount(() => window.removeEventListener("keydown", key));
</script>
<template><section ref="panel" v-if="frame.notifications.state.open" class="notification-center" :style="{ bottom: `${bottom}px` }" aria-label="Notifications"><header><h2>Notifications</h2><span class="notification-spacer"/><FrameIconButton label="Clear all notifications" icon="clear-all" :disabled="!frame.notifications.state.items.length" @click="clear"/><FrameIconButton label="Hide notifications" icon="chevron-down" @click="close"/></header><div class="notification-list"><article v-for="item in frame.notifications.state.items" :key="item.id" class="notification-item" :class="item.severity" tabindex="0" @dblclick="item.expanded = !item.expanded" @keydown.enter.self.prevent="item.expanded = !item.expanded" @keydown.space.self.prevent="item.expanded = !item.expanded"><div class="notification-row"><FrameIcon :name="icons[item.severity]" class="notification-severity"/><span class="sr-only">{{ item.severity }}: </span><span class="notification-title">{{ item.title }}</span><small v-if="item.priority">{{ item.priority }}</small><div class="notification-actions"><FrameIconButton :label="`${item.expanded ? 'Collapse' : 'Expand'} notification: ${item.title}`" :icon="item.expanded ? 'chevron-up' : 'chevron-down'" :aria-expanded="item.expanded" @click.stop="item.expanded = !item.expanded" @dblclick.stop/><FrameIconButton :label="`Clear notification: ${item.title}`" icon="close" @click.stop="dismiss(item.id)" @dblclick.stop/></div></div><div v-if="item.expanded" class="notification-details"><p v-if="item.details">{{ item.details }}</p><small v-if="item.source">Source: {{ item.source }}</small><p v-if="!item.details && !item.source">No additional details.</p></div></article><p v-if="!frame.notifications.state.items.length" class="notifications-empty">No notifications.</p></div></section></template>
