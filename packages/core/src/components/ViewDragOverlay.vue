<script setup lang="ts">
import { computed, ref } from "vue";
import { fitOverlay, intersectOverlayBounds, useOverlayBoundary } from "../frame/overlays";
import { useFrame } from "../frame/createFrame";
const frame = useFrame();
const preview = ref<HTMLElement>();
const { target, getBounds } = useOverlayBoundary();
const view = computed(() => frame.views.value.find(view => view.id === frame.dragState.id));
const previewStyle = computed(() => {
  const bounds = getBounds(), size = preview.value?.getBoundingClientRect();
  const width = size?.width ?? 200, height = size?.height ?? 32;
  const x = frame.dragState.x, y = frame.dragState.y;
  const left = x + width + 14 > bounds.left + bounds.width ? x - width - 14 : x + 14;
  const top = y + height + 14 > bounds.top + bounds.height ? y - height - 14 : y + 14;
  const fitted = fitOverlay({ left, top, width, height }, bounds);
  return { left: `${fitted.left}px`, top: `${fitted.top}px`, maxWidth: `${Math.max(0, bounds.width - 12)}px`, maxHeight: `${Math.max(0, bounds.height - 12)}px` };
});
const markerStyle = computed(() => { const marker = frame.dragState.drop?.marker; if (!marker) return {}; const rect = intersectOverlayBounds(marker, getBounds()); return { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` }; });
</script>
<template><Teleport :to="target"><template v-if="frame.dragState.active"><div ref="preview" class="view-drag-preview" :style="previewStyle" aria-hidden="true"><component v-if="view?.icon" :is="view.icon"/><span v-else class="drag-view-icon">{{ view?.label.slice(0, 1) }}</span><span>{{ view?.label }}</span></div><div v-if="frame.dragState.drop" class="view-drop-marker" :class="frame.dragState.drop.marker.kind" :style="markerStyle" aria-hidden="true"/></template></Teleport></template>
