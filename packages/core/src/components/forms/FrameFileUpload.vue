<script setup lang="ts">
import {computed, ref} from 'vue';
import FrameButton from '../actions/FrameButton.vue';
import type {
  FileRejection,
  FileSelection,
  FileUploadOptions,
} from './shared/files';
import {useFilePicker} from './shared/useFilePicker';
import './styles/files.scss';

const props = withDefaults(
  defineProps<
    FileUploadOptions & {
      modelValue?: File[];
      disabled?: boolean;
      label?: string;
      showFiles?: boolean;
    }
  >(),
  {label: 'Choose file', showFiles: true}
);
const emit = defineEmits<{
  'update:modelValue': [files: File[]];
  accepted: [files: File[]];
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
defineExpose({open, clear, focus: () => button.value?.focus()});
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

<style lang="scss">
.frame-file-upload {
  color: var(--frame-text);
  font: inherit;
}

.frame-file-list {
  list-style: none;
  padding: 0;
  margin: var(--frame-gap, 6px) 0;
}

.frame-file-list li {
  display: flex;
  align-items: center;
  gap: var(--frame-gap, 6px);
}

.frame-file-list li > span {
  overflow-wrap: anywhere;
}
</style>
