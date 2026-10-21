<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import ResizeHandle from "./ResizeHandle.vue";
const props = withDefaults(defineProps<{ modelValue?: number; axis?: "x" | "y"; min?: number; max?: number; minSecond?: number; label?: string; defaultSize?: number }>(), { axis: "x", min: 120, max: 500, minSecond: 160, label: "Resize panes", defaultSize: 210 });
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const element = ref<HTMLElement>(); const extent = ref(0); const localSize = ref(props.defaultSize);
function update(value: number) { localSize.value = value; emit("update:modelValue", value); }
function measure() { if (element.value) extent.value = props.axis === "x" ? element.value.clientWidth : element.value.clientHeight; }
watch(() => props.axis, measure);
const maximum = computed(() => Math.max(0, Math.min(props.max, extent.value - Math.min(props.minSecond, extent.value / 2))));
const minimum = computed(() => Math.min(props.min, maximum.value));
const size = computed(() => Math.max(minimum.value, Math.min(maximum.value, props.modelValue ?? localSize.value)));
let observer: ResizeObserver | undefined;
onMounted(() => { observer = new ResizeObserver(measure); if (element.value) observer.observe(element.value); });
onBeforeUnmount(() => observer?.disconnect());
</script>
<template><div ref="element" class="resizable-pane" :class="axis" :style="axis === 'x' ? { gridTemplateColumns: `${size}px 0 minmax(0, 1fr)` } : { gridTemplateRows: `${size}px 0 minmax(0, 1fr)` }"><div class="resizable-pane-first"><slot name="first"/></div><ResizeHandle :axis="axis" :label="label" :value="size" :min="minimum" :max="maximum" @change="update" @reset="update(defaultSize)"/><div class="resizable-pane-second"><slot name="second"/></div></div></template>
