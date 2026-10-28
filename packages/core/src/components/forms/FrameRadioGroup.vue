<script setup lang="ts">
import {RadioGroupRoot, RadioGroupItem, RadioGroupIndicator} from 'reka-ui';
import './styles/controls.scss';
import type {SelectItem} from './shared/selectItem';
import {isSelectOption} from './shared/select';

defineProps<{
  modelValue: string;
  options: readonly SelectItem[];
  disabled?: boolean;
  label?: string;
}>();
const emit = defineEmits<{'update:modelValue': [value: string]}>();
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
        class="frame-choice-item frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
        ><RadioGroupIndicator class="frame-radio-indicator" /><span>{{
          option.label
        }}</span
        ><small v-if="option.detail">{{ option.detail }}</small></RadioGroupItem
      ><div v-else role="separator" class="frame-select-separator" /></template
  ></RadioGroupRoot>
</template>
