<script setup lang="ts">
import {computed, ref} from 'vue';
import FrameButton from '../actions/FrameButton.vue';
import type {
  FileRejection,
  FileSelection,
  FileUploadOptions,
} from './shared/files';
import {useFilePicker} from './shared/useFilePicker';
import './shared/files.css';

const props = withDefaults(
  defineProps<
    FileUploadOptions & {
      /** Selected files; when omitted the component maintains a local selection. */
      modelValue?: File[];
      /** Disables browsing, clearing, and removal. */
      disabled?: boolean;
      /** Text of the fallback file picker button. */
      label?: string;
      /** Displays the fallback selected-file list; a files slot can replace it. */
      showFiles?: boolean;
    }
  >(),
  {label: 'Choose file', showFiles: true}
);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [files: File[]];
  /** Files accepted by the configured type, size, and count rules. */
  accepted: [files: File[]];
  /** Files rejected by validation, with the corresponding reason for each file. */
  rejected: [files: FileRejection[]];
}>();
const local = ref<File[]>([]);
const files = computed(() => props.modelValue ?? local.value);
const errors = ref<FileRejection[]>([]);
function update(value: File[]) {
  local.value = value;
  emit('update:modelValue', value);
}
function selected(result: FileSelection) {
  errors.value = result.rejected;
  if (result.accepted.length) {
    update(result.accepted);
    emit('accepted', result.accepted);
  }
  if (result.rejected.length) emit('rejected', result.rejected);
}
const picker = useFilePicker(props, selected);
const {open, change} = picker;
const button = ref<InstanceType<typeof FrameButton>>();
function clear() {
  if (!props.disabled) {
    update([]);
    errors.value = [];
  }
}
function remove(index: number) {
  if (!props.disabled) update(files.value.filter((_, i) => i !== index));
}
defineExpose({
  /** Opens the native file picker when mounted and enabled. */
  open,
  /** Clears the selection and validation errors when enabled. */

  clear,
  /** Focuses the fallback picker button when mounted; custom triggers own their focus. */

  focus: () => button.value?.focus(),
});

defineSlots<{
  /** Replaces the browse button; invoke open to request the native picker. */
  trigger?(
    props: {
    open: () => void;
    disabled: boolean;
    files: File[];
  }
  ): unknown;
  /** Replaces the selected-file list and receives enabled removal operations. */
  files?(
    props: {
    files: File[];
    remove: (index: number) => void;
    clear: () => void;
  }
  ): unknown;
  /** Replaces validation error messages for the latest selection. */
  errors?(props: {errors: FileRejection[]}): unknown;
}>();
</script>
<template>
  <div class="frame-file-upload" :data-disabled="disabled || undefined">
    <input
      :ref="picker.input"
      class="frame-file-input"
      type="file"
      tabindex="-1"
      aria-hidden="true"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="change"
    />
    <slot name="trigger" :open="open" :disabled="!!disabled" :files="files"
      ><FrameButton
        ref="button"
        variant="secondary"
        :disabled="disabled"
        @click="open"
        >{{ label }}</FrameButton
      ></slot
    >
    <slot name="files" :files="files" :remove="remove" :clear="clear">
      <ul
        v-if="showFiles && files.length"
        class="frame-file-list"
        aria-label="Selected files"
        ><li v-for="(file, index) in files" :key="index"
          ><span>{{ file.name }}</span
          ><FrameButton
            :disabled="disabled"
            :aria-label="`Remove ${file.name}`"
            @click="remove(index)"
            >Remove</FrameButton
          ></li
        ></ul
      >
    </slot>
    <div class="frame-file-errors" role="status" aria-live="polite"
      ><slot name="errors" :errors="errors"
        ><div v-for="(error, index) in errors" :key="index">{{
          error.message
        }}</div></slot
      ></div
    >
  </div>
</template>
