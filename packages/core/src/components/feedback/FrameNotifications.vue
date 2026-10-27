<script setup lang="ts">
import { computed } from "vue";
import {useFrame} from '../../framework/useFrame';
import FrameIcon from "../data-display/FrameIcon.vue";
import FrameIconButton from "../actions/FrameIconButton.vue";
import FrameButton from "../actions/FrameButton.vue";
import { useOverlayBoundary, viewportBounds } from "../overlays/overlays";
const frame = useFrame();
const props = defineProps<{ bottom: number }>();
const { getBounds } = useOverlayBoundary();
const style = computed(() => {
  const area = getBounds(), viewport = viewportBounds();
  return { left: `${area.left + 6}px`, bottom: `${Math.max(props.bottom, viewport.height - area.top - area.height + 4)}px`, maxWidth: `${Math.max(0, area.width - 12)}px`, maxHeight: `${Math.max(0, Math.min(viewport.height * .6, area.height - 8))}px` };
});
const icons = { info: "info", success: "pass", warning: "warning", error: "error" };
function focusOut(id: string, event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) frame.notifications.resume(id, "focus");
}
</script>
<template><section class="frame-notifications" :style="style" aria-label="Application notifications" aria-live="polite" aria-relevant="additions"><article v-for="item in frame.notifications.state.items" :key="item.id" class="frame-notification" :class="item.severity" @mouseenter="frame.notifications.pause(item.id, 'pointer')" @mouseleave="frame.notifications.resume(item.id, 'pointer')" @focusin="frame.notifications.pause(item.id, 'focus')" @focusout="focusOut(item.id, $event)"><FrameIcon :name="icons[item.severity]" class="frame-notification-severity"/><div class="frame-notification-content"><strong>{{ item.title }}</strong><p v-if="item.details">{{ item.details }}</p><small v-if="item.source">Source: {{ item.source }}</small><FrameButton v-if="item.action" variant="primary" :disabled="item.running" @click="frame.notifications.runAction(item.id)">{{ item.action.label }}</FrameButton></div><FrameIconButton :label="`Dismiss notification: ${item.title}`" icon="close" @click="frame.notifications.dismiss(item.id)"/></article></section></template>
