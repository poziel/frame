<script setup lang="ts">
import {useForwardPropsEmits, type Color} from 'reka-ui';
import FrameHsvArea from './FrameHsvArea.vue';

const props = defineProps<{
  /** Controlled color forwarded to the hue/saturation circle. */
  modelValue?: string | Color;
  /** Initial color used while modelValue is omitted. */
  defaultValue?: string | Color;
  /** Prevents user interaction with the control. */
  disabled?: boolean;
  /** Area dimension; numeric values are pixels and strings retain CSS units. */
  size?: number | string;
}>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string];
  /** Updated structured HSB color including alpha. */
  'update:color': [value: Color];
  /** Color text changed during interaction. */
  change: [value: string];
  /** Color interaction was committed. */
  changeEnd: [value: string];
}>();
const forwarded = useForwardPropsEmits(props, emit);
</script>
<template><FrameHsvArea v-bind="forwarded" variant="circle" /></template>
