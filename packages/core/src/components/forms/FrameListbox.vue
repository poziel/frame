<script setup lang="ts">
import {ListboxRoot, ListboxContent, ListboxItem} from 'reka-ui';
import './styles/controls.scss';
import type {SelectItem} from './shared/selectItem';
import {isSelectOption} from './shared/select';

defineProps<{
  modelValue: string | string[];
  options: readonly SelectItem[];
  disabled?: boolean;
  label?: string;
  multiple?: boolean;
}>();
const emit = defineEmits<{'update:modelValue': [value: string | string[]]}>();
</script>
<template>
  <ListboxRoot
    class="frame-choice-group"
    :model-value="modelValue"
    :multiple="multiple"
    :disabled="disabled"
    :aria-label="label"
    @update:model-value="emit('update:modelValue', $event as string | string[])"
    ><ListboxContent
      ><template
        v-for="(option, index) in options"
        :key="isSelectOption(option) ? option.value : (option.id ?? index)"
        ><ListboxItem
          v-if="isSelectOption(option)"
          :value="option.value"
          :disabled="disabled || option.disabled"
          class="frame-choice-item frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
          ><span>{{ option.label }}</span
          ><small v-if="option.detail">{{ option.detail }}</small></ListboxItem
        ><div
          v-else
          role="separator"
          class="frame-select-separator" /></template></ListboxContent
  ></ListboxRoot>
</template>
