<script setup lang="ts">
import { computed } from "vue";
import { useFrame } from "../frame/createFrame";
const frame = useFrame();
const view = computed(() => frame.views.value.find(view => view.id === frame.dragState.id));
const previewStyle = computed(() => { const x = frame.dragState.x, y = frame.dragState.y; const flipX = x > innerWidth - 250, flipY = y > innerHeight - 50; return { left: `${x + (flipX ? -14 : 14)}px`, top: `${y + (flipY ? -14 : 14)}px`, transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})` }; });
const markerStyle = computed(() => { const marker = frame.dragState.drop?.marker; return marker ? { left: `${marker.left}px`, top: `${marker.top}px`, width: `${marker.width}px`, height: `${marker.height}px` } : {}; });
</script>
<template><Teleport to="body"><template v-if="frame.dragState.active"><div class="view-drag-preview" :style="previewStyle" aria-hidden="true"><component v-if="view?.icon" :is="view.icon"/><span v-else class="drag-view-icon">{{ view?.label.slice(0, 1) }}</span><span>{{ view?.label }}</span></div><div v-if="frame.dragState.drop" class="view-drop-marker" :class="frame.dragState.drop.marker.kind" :style="markerStyle" aria-hidden="true"/></template></Teleport></template>
