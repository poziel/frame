<script setup lang="ts">
import {ToggleGroupRoot, ToggleGroupItem} from 'reka-ui';
import '../forms/styles/controls.scss';
import type {SelectItem} from '../forms/shared/selectItem';
import {isSelectOption} from '../forms/shared/select';

defineProps<{
  /** Controlled selected option value or values. */
  modelValue: string | string[];
  /** Ordered selectable options and separators rendered by this control. */
  options: readonly SelectItem[];
  /** Prevents user interaction with the control. */
  disabled?: boolean;
  /** Accessible name of the control. */
  label?: string;
  /** Allows selecting several option values instead of one. */
  multiple?: boolean;
}>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string | string[]];
}>();
</script>
<template>
  <ToggleGroupRoot
    class="frame-choice-group"
    :model-value="modelValue"
    :multiple="multiple"
    :disabled="disabled"
    :aria-label="label"
    @update:model-value="emit('update:modelValue', $event as string | string[])"
    ><template
      v-for="(option, index) in options"
      :key="isSelectOption(option) ? option.value : (option.id ?? index)"
      ><ToggleGroupItem
        v-if="isSelectOption(option)"
        :value="option.value"
        :disabled="disabled || option.disabled"
        class="frame-choice-item frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
        ><span>{{ option.label }}</span
        ><small v-if="option.detail">{{
          option.detail
        }}</small></ToggleGroupItem
      ><div v-else role="separator" class="frame-select-separator" /></template
  ></ToggleGroupRoot>
</template>
