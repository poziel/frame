<script setup lang="ts">
import FrameTextField from './FrameTextField.vue';
import {
  TagsInputRoot,
  TagsInputItem,
  TagsInputItemText,
  TagsInputItemDelete,
  TagsInputInput,
} from 'reka-ui';
import './shared/controls.css';

defineProps<{
  /** Controlled tag text values; updates include additions and removals. */
  modelValue: string[];
  /** Prevents user interaction with the control. */
  disabled?: boolean;
  /** Hint displayed while the editable value is empty. */
  placeholder?: string;
  /** Accessible name of the tag-entry input. */
  label?: string;
}>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string[]];
}>();
</script>
<template>
  <TagsInputRoot
    class="frame-tags-input"
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event.map(String))"
    ><TagsInputItem
      v-for="value in modelValue"
      :key="value"
      :value="value"
      class="frame-tags-input-item"
      ><TagsInputItemText /><TagsInputItemDelete
        as="button"
        type="button"
        :aria-labelledby="null"
        class="frame-control-button"
        :aria-label="`Remove ${value}`"
        >×</TagsInputItemDelete
      ></TagsInputItem
    ><TagsInputInput as-child
      ><FrameTextField
        class="frame-tags-entry"
        :placeholder="placeholder"
        :aria-label="label" /></TagsInputInput
  ></TagsInputRoot>
</template>
