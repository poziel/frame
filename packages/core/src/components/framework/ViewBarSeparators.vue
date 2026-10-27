<script setup lang="ts">
import {computed, onBeforeUnmount} from 'vue';
import type {BarSeparator} from '../../framework/layout/barSeparators';
import {BarDrag} from '../../framework/layout/barDrag';
import BarDragOverlay from './BarDragOverlay.vue';

const props = defineProps<{
  items: readonly BarSeparator[];
  before?: string;
  measure?: boolean;
  canMove?: boolean;
  move: (id: string, before?: string) => boolean;
}>();
const emit = defineEmits<{context: [event: MouseEvent, id: string]}>();
const entries = computed(() =>
  props.items.filter((item) => item.before === props.before)
);
const drag = new BarDrag({
  exists: (id) =>
    props.canMove !== false &&
    !props.measure &&
    props.items.some((item) => item.id === id),
  move: (id, before) => props.move(id, before),
});
function start(event: PointerEvent, id: string) {
  drag.begin(event, id);
}
onBeforeUnmount(drag.cancel);
</script>
<template>
  <span
    v-for="item in entries"
    :key="item.id"
    class="view-bar-separator"
    :data-bar-separator="item.id"
    :data-bar-separator-before="before ?? ''"
    role="separator"
    :aria-label="measure ? undefined : 'Separator'"
    :tabindex="measure ? undefined : 0"
    @pointerdown="start($event, item.id)"
    @contextmenu="emit('context', $event, item.id)"
    @keydown="
      ($event.key === 'ContextMenu' ||
        ($event.shiftKey && $event.key === 'F10')) &&
      emit('context', $event as unknown as MouseEvent, item.id)
    "
  /><BarDragOverlay
    :active="drag.state.active"
    :x="drag.state.x"
    :y="drag.state.y"
    :marker="drag.state.marker"
  />
</template>
