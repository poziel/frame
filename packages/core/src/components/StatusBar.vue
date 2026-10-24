<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFrame } from '../frame/createFrame';
import ViewBarSeparators from './ViewBarSeparators.vue';
import StatusBarItem from './StatusBarItem.vue';
import StatusItemMenu from './StatusItemMenu.vue';
const frame = useFrame();
const root = ref<HTMLElement>();
const targetId = ref<string>();
const point = ref<{ x: number; y: number }>();
const items = computed(() => frame.status.items.value.filter(item => item.available && item.showInStatusBar && item.visible));
watch(() => frame.layout.statusBarVisible, () => { point.value = undefined; });
function context(event: MouseEvent, id?: string) { targetId.value = id; event.preventDefault(); event.stopPropagation(); const rect = (event.target as HTMLElement).getBoundingClientRect(); point.value = { x: event.clientX || rect.left, y: event.clientY || rect.bottom }; }
</script>
<template>
  <footer ref="root" v-show="frame.layout.statusBarVisible" class="status-bar" aria-label="Status bar" @contextmenu="context">
    <div data-bar-axis="x" class="bar-drop-list status-section status-left" aria-label="Left status items"><slot name="leading" /><template v-for="item in items.filter(item => item.side === 'left')" :key="item.id"><span class="status-drop-gap" :data-bar-drop-before="item.id" /><ViewBarSeparators :items="frame.status.separators.value" :before="item.id" :move="frame.status.moveSeparator" :can-move="frame.status.allowMove.value" @context="context" /><StatusBarItem :item="item" /></template><span class="status-drop-gap" data-bar-drop-before="" /><ViewBarSeparators :items="frame.status.separators.value" :move="frame.status.moveSeparator" :can-move="frame.status.allowMove.value" @context="context" /></div>
    <div class="status-message" role="status" aria-live="polite" aria-atomic="true" :class="`status-message-${frame.status.message.value.severity}`" :title="frame.status.message.value.text">{{ frame.status.message.value.text }}</div>
    <div data-bar-axis="x" class="bar-drop-list status-section status-right" aria-label="Right status items"><slot name="actions" /><template v-for="item in items.filter(item => item.side === 'right')" :key="item.id"><span class="status-drop-gap" :data-bar-drop-before="item.id" /><ViewBarSeparators :items="frame.status.separators.value" :before="item.id" :move="frame.status.moveSeparator" :can-move="frame.status.allowMove.value" @context="context" /><StatusBarItem :item="item" /></template></div>
    <StatusItemMenu v-if="point && root" :anchor="root" :point="point" :target-id="targetId" @close="point = undefined" />
  </footer>
</template>
