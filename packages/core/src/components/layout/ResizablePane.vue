<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import ResizeHandle from './ResizeHandle.vue';

const props = withDefaults(
  defineProps<{
    /** Controlled value supplied by the parent; updates are emitted rather than mutating it. */
    modelValue?: number;
    /** Resize axis: x changes width and y changes height. */
    axis?: 'x' | 'y';
    /** Minimum allowed resize value. */
    min?: number;
    /** Maximum allowed resize value. */
    max?: number;
    /** Minimum space reserved for the second pane in pixels; defaults to 160. */
    minSecond?: number;
    /** Accessible name for this component and its built-in control or region. */
    label?: string;
    /** Initial uncontrolled first-pane size in pixels; defaults to 210. */
    defaultSize?: number;
  }>(),
  {
    axis: 'x',
    min: 120,
    max: 500,
    minSecond: 160,
    label: 'Resize panes',
    defaultSize: 210,
  }
);
const emit = defineEmits<{
  /** Emitted when user interaction requests a new controlled value. */
  'update:modelValue': [value: number];
}>();
const element = ref<HTMLElement>();
const extent = ref(0);
const localSize = ref(props.defaultSize);
function update(value: number) {
  localSize.value = value;
  emit('update:modelValue', value);
}
function measure() {
  if (element.value)
    extent.value =
      props.axis === 'x'
        ? element.value.clientWidth
        : element.value.clientHeight;
}
watch(() => props.axis, measure);
const maximum = computed(() =>
  Math.max(
    0,
    Math.min(
      props.max,
      extent.value - Math.min(props.minSecond, extent.value / 2)
    )
  )
);
const minimum = computed(() => Math.min(props.min, maximum.value));
const size = computed(() =>
  Math.max(
    minimum.value,
    Math.min(maximum.value, props.modelValue ?? localSize.value)
  )
);
let observer: ResizeObserver | undefined;
onMounted(() => {
  observer = new ResizeObserver(measure);
  if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());
defineSlots<{
  /** Content of the first, explicitly sized pane. */ first?(): unknown;
  /** Content of the second pane, which fills remaining space. */ second?(): unknown;
}>();
</script>
<template>
  <div
    ref="element"
    class="resizable-pane"
    :class="axis"
    :style="
      axis === 'x'
        ? {gridTemplateColumns: `${size}px 0 minmax(0, 1fr)`}
        : {gridTemplateRows: `${size}px 0 minmax(0, 1fr)`}
    "
    ><div class="resizable-pane-first"><slot name="first" /></div
    ><ResizeHandle
      :axis="axis"
      :label="label"
      :value="size"
      :min="minimum"
      :max="maximum"
      @change="update"
      @reset="update(defaultSize)" /><div class="resizable-pane-second"
      ><slot name="second" /></div
  ></div>
</template>
