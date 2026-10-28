<script setup lang="ts">
import FrameTextField from './FrameTextField.vue';
import {
  TagsInputRoot,
  TagsInputItem,
  TagsInputItemText,
  TagsInputItemDelete,
  TagsInputInput,
} from 'reka-ui';
import './styles/controls.scss';

defineProps<{
  modelValue: string[];
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}>();
const emit = defineEmits<{'update:modelValue': [value: string[]]}>();
</script>
<template>
  <TagsInputRoot
    class="frame-tags-input frame-form-inline-layout frame-input-surface frame-input-focus-within"
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
        class="frame-control-button frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
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

<style lang="scss">
.frame-tags-input {
  flex-wrap: wrap;
  padding: var(--frame-control-padding-y, 5px);
  border: 1px solid var(--frame-line, #454545);
  border-radius: var(--frame-control-radius, var(--frame-radius-medium));
}

.frame-tags-input-item {
  display: inline-flex;
  align-items: center;
  gap: var(--frame-gap, 6px);
  background: var(--frame-line, #454545);
  border-radius: var(--frame-control-radius, var(--frame-radius-medium));
  padding-left: var(--frame-control-padding-x, 10px);
}

.frame-tags-input {
  border-color: var(
    --frame-tags-input-border-color,
    var(--frame-control-border)
  );
  border-radius: var(--frame-tags-input-radius, var(--frame-input-radius));
}

.frame-tags-input .frame-tags-entry {
  flex: 1;
  width: 6em;
  min-width: 4em;
}
</style>
