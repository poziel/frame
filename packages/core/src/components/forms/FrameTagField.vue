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
  /* Internal spacing for .frame-tags-input. @token --frame-control-padding-y */
  --_frame-default-control-padding-y-6f187fc61a: 5px;
  padding: var(
    --frame-control-padding-y,
    var(--_frame-default-control-padding-y-6f187fc61a)
  ); /* Border for .frame-tags-input. @token --frame-line */
  --_frame-default-line-ff02b7d326: #454545;
  border: 1px solid var(--frame-line, var(--_frame-default-line-ff02b7d326)); /* Corner radius for .frame-tags-input. @token --frame-control-radius */
  --_frame-default-control-radius-99f2371f33: var(--frame-radius-medium);
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-control-radius,
    var(--_frame-default-control-radius-99f2371f33)
  );
}

.frame-tags-input-item {
  display: inline-flex;
  align-items: center;
  /* Space between children for .frame-tags-input-item. @token --frame-gap */
  --_frame-default-gap-3e2a1ab688: 6px;
  gap: var(
    --frame-gap,
    var(--_frame-default-gap-3e2a1ab688)
  ); /* Border for .frame-tags-input-item. @token --frame-line */
  --_frame-default-line-ff02b7d326: #454545;
  background: var(
    --frame-line,
    var(--_frame-default-line-ff02b7d326)
  ); /* Corner radius for .frame-tags-input-item. @token --frame-control-radius */
  --_frame-default-control-radius-99f2371f33: var(--frame-radius-medium);
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-control-radius,
    var(--_frame-default-control-radius-99f2371f33)
  ); /* Internal spacing for .frame-tags-input-item. @token --frame-control-padding-x */
  --_frame-default-control-padding-x-a7f84e125c: 10px;
  padding-left: var(
    --frame-control-padding-x,
    var(--_frame-default-control-padding-x-a7f84e125c)
  );
}

.frame-tags-input {
  /* Border color of the tag entry container. @token --frame-tags-input-border-color */
  --_frame-default-tags-input-border-color-113: var(--frame-control-border);
  /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border-color: var(
    --frame-tags-input-border-color,
    var(--_frame-default-tags-input-border-color-113)
  ); /* Corner radius of the tag entry container. @token --frame-tags-input-radius */
  --_frame-default-tags-input-radius-114: var(--frame-input-radius);
  /* Shared corner radius for text fields, text areas, selects, and composed input surfaces. @token --frame-input-radius @context */
  border-radius: var(
    --frame-tags-input-radius,
    var(--_frame-default-tags-input-radius-114)
  );
}

.frame-tags-input .frame-tags-entry {
  flex: 1;
  width: 6em;
  min-width: 4em;
}
</style>
