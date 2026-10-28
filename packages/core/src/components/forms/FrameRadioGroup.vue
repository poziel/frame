<script setup lang="ts">
import {RadioGroupRoot, RadioGroupItem, RadioGroupIndicator} from 'reka-ui';
import './shared/controls.css';
import type {SelectItem} from './shared/selectItem';
import {isSelectOption} from './shared/select';

defineProps<{
  /** Current value owned by the application; updates are emitted after interaction. */
  modelValue: string;
  /** Ordered selectable options and separators rendered by this control. */
  options: readonly SelectItem[];
  /** Prevents user interaction with the control. */
  disabled?: boolean;
  /** Accessible name of the control. */
  label?: string;
}>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string];
}>();
</script>
<template>
  <RadioGroupRoot
    class="frame-choice-group"
    :model-value="modelValue"
    :disabled="disabled"
    :aria-label="label"
    @update:model-value="emit('update:modelValue', $event as string)"
    ><template
      v-for="(option, index) in options"
      :key="isSelectOption(option) ? option.value : (option.id ?? index)"
      ><RadioGroupItem
        v-if="isSelectOption(option)"
        :value="option.value"
        :disabled="disabled || option.disabled"
        class="frame-choice-item"
        ><RadioGroupIndicator class="frame-radio-indicator" /><span>{{
          option.label
        }}</span
        ><small v-if="option.detail">{{ option.detail }}</small></RadioGroupItem
      ><div v-else role="separator" class="frame-select-separator" /></template
  ></RadioGroupRoot>
</template>
