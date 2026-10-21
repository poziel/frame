<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { clamp } from "../frame/layout";
const props = withDefaults(defineProps<{ label: string; axis: "x" | "y"; value: number; min: number; max: number; reverse?: boolean; scale?: number; step?: number; grip?: boolean }>(), { scale: 1, step: 10 });
const emit = defineEmits<{ change: [value: number]; reset: [] }>();
const element = ref<HTMLElement>();
const dragging = ref(false);
let pointer = -1;
let startPosition = 0;
let startValue = 0;
function start(event: PointerEvent) {
  if (event.button !== 0) return;
  event.preventDefault();
  element.value?.focus();
  pointer = event.pointerId; startValue = props.value;
  startPosition = props.axis === "x" ? event.clientX : event.clientY;
  dragging.value = true; element.value?.setPointerCapture(pointer);
}
function move(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== pointer) return;
  const delta = (props.axis === "x" ? event.clientX : event.clientY) - startPosition;
  emit("change", clamp(startValue + delta * (props.reverse ? -1 : 1) * props.scale, props.min, props.max));
}
function finish(cancel = false) {
  if (!dragging.value) return;
  if (cancel) emit("change", startValue);
  dragging.value = false;
  if (element.value?.hasPointerCapture(pointer)) element.value.releasePointerCapture(pointer);
  pointer = -1;
}
function keydown(event: KeyboardEvent) {
  if (event.key === "Escape" && dragging.value) { event.preventDefault(); event.stopPropagation(); finish(true); return; }
  const keys = props.axis === "x" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
  if (keys.includes(event.key)) {
    event.preventDefault(); event.stopPropagation();
    const direction = event.key === keys[0] ? -1 : 1;
    emit("change", clamp(props.value + direction * props.step * (props.reverse ? -1 : 1), props.min, props.max));
  }
  if (event.key === "Home") { event.preventDefault(); emit("reset"); }
}
onBeforeUnmount(() => finish());
</script>
<template>
  <div ref="element" role="separator" tabindex="0" :aria-label="label" :aria-orientation="axis === 'x' ? 'vertical' : 'horizontal'"
    :aria-valuenow="Math.round(value * 100) / 100" :aria-valuemin="min" :aria-valuemax="max"
    class="resize-handle" :class="[axis === 'x' ? 'vertical' : 'horizontal', { dragging, 'has-grip': grip }]"
    @pointerdown="start" @pointermove="move" @pointerup="finish()" @pointercancel="finish(true)" @lostpointercapture="finish()"
    @keydown="keydown" @dblclick="emit('reset')" />
</template>
