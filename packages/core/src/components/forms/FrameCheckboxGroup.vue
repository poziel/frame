<script setup lang="ts">
import {
  CheckboxGroupRoot,
  CheckboxRoot,
  CheckboxIndicator,
  Label,
} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import type {SelectItem} from './shared/selectItem';
import {isSelectOption} from './shared/select';
import './shared/controls.css';

defineProps<{
  /** Controlled array of checked option values. */
  modelValue: string[];
  /** Ordered selectable options and separators rendered by this control. */
  options: readonly SelectItem[];
  /** Prevents user interaction with the control. */
  disabled?: boolean;
  /** Accessible name of the control. */
  label?: string;
}>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string[]];
}>();
</script>
<template>
  <CheckboxGroupRoot
    class="frame-choice-group"
    :model-value="modelValue"
    :disabled="disabled"
    :aria-label="label"
    @update:model-value="emit('update:modelValue', $event.map(String))"
    ><template
      v-for="(option, index) in options"
      :key="isSelectOption(option) ? option.value : (option.id ?? index)"
      ><Label v-if="isSelectOption(option)" class="frame-form-inline"
        ><CheckboxRoot
          class="frame-check-control"
          :value="option.value"
          :disabled="disabled || option.disabled"
          ><CheckboxIndicator class="frame-check-indicator"
            ><FrameIcon
              name="check"
              :size="14" /></CheckboxIndicator></CheckboxRoot
        ><span>{{ option.label }}</span></Label
      ><div v-else role="separator" class="frame-select-separator" /></template
  ></CheckboxGroupRoot>
</template>
