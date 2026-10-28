<script setup lang="ts">
import {Toggle} from 'reka-ui';
import '../forms/styles/controls.scss';

withDefaults(
  defineProps<{
    /** Controlled pressed state of the toggle. */
    modelValue?: boolean;
    /** Prevents user interaction with the control. */
    disabled?: boolean;
    /** Accessible name and fallback content of the toggle. */
    label?: string;
  }>(),
  {modelValue: false}
);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: boolean];
}>();

defineSlots<{
  /** Toggle content; defaults to the label prop. */
  default?(): unknown;
}>();
</script>
<template>
  <Toggle
    class="frame-toggle frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
    :model-value="modelValue"
    :disabled="disabled"
    :aria-label="label"
    @update:model-value="emit('update:modelValue', $event)"
    ><slot>{{ label }}</slot></Toggle
  >
</template>
