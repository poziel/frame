<script setup lang="ts">
import {Toggle} from 'reka-ui';
import '../forms/styles/controls.scss';

withDefaults(
  defineProps<{modelValue?: boolean; disabled?: boolean; label?: string}>(),
  {modelValue: false}
);
const emit = defineEmits<{'update:modelValue': [value: boolean]}>();
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
