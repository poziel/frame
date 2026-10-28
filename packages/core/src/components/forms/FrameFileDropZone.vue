<script setup lang="ts">
import {ref, watch} from 'vue';
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
      /** Disables file browsing and dropping, and clears the dragging state. */
      disabled?: boolean;
      /** Renders the ordinary drop-zone presentation or a dragging overlay. */
      appearance?: 'zone' | 'overlay';
      /** Fallback instruction text in the presentation and dragging overlay. */
      message?: string;
      /** Label of the fallback file picker button. */
      browseLabel?: string;
    }
  >(),
  {appearance: 'zone', message: 'Drop files here', browseLabel: 'Choose file'}
);
const emit = defineEmits<{
  /** Files accepted by the configured type, size, and count rules. */
  accepted: [files: File[]];
  /** Files rejected by validation, with the corresponding reason for each file. */
  rejected: [files: FileRejection[]];
  /** Whether a file drag is currently over the drop zone. */
  'update:dragging': [dragging: boolean];
}>();
const dragging = ref(false),
  errors = ref<FileRejection[]>([]);
let depth = 0;
function setDragging(value: boolean) {
  if (dragging.value !== value) {
    dragging.value = value;
    emit('update:dragging', value);
  }
}
function reset() {
  depth = 0;
  setDragging(false);
}
function selected(result: FileSelection) {
  errors.value = result.rejected;
  if (result.accepted.length) emit('accepted', result.accepted);
  if (result.rejected.length) emit('rejected', result.rejected);
}
const picker = useFilePicker(props, selected);
const {open, receive, change} = picker;
function isFile(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}
function enter(event: DragEvent) {
  if (!props.disabled && isFile(event)) {
    event.preventDefault();
    event.stopPropagation();
    depth++;
    setDragging(true);
  }
}
function over(event: DragEvent) {
  if (!props.disabled && isFile(event)) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    setDragging(true);
  }
}
function leave(event: DragEvent) {
  if (dragging.value && isFile(event)) {
    event.stopPropagation();
    if (--depth <= 0) reset();
  }
}
function drop(event: DragEvent) {
  if (!isFile(event)) return;
  reset();
  if (props.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  receive(Array.from(event.dataTransfer?.files ?? []));
}
watch(() => props.disabled, reset);
defineExpose({
  /** Opens the native file picker when mounted and enabled. */
  open,
  /** Clears drag nesting and the dragging state. */

  reset,
});

defineSlots<{
  /** Application content receiving the drag state and native picker operation. */
  default?(
    props: {
    dragging: boolean;
    open: () => void;
    disabled: boolean;
  }
  ): unknown;
  /** Replaces the zone instruction and browse button in zone appearance. */
  presentation?(
    props: {
    dragging: boolean;
    open: () => void;
    disabled: boolean;
  }
  ): unknown;
  /** Replaces the instruction displayed while files are dragged over the zone. */
  overlay?(props: {dragging: boolean}): unknown;
  /** Replaces validation error messages for the latest selection. */
  errors?(props: {errors: FileRejection[]}): unknown;
}>();
</script>
<template>
  <div
    class="frame-file-drop-zone"
    :class="[`frame-file-drop-${appearance}`, {'is-dragging': dragging}]"
    :data-dragging="dragging || undefined"
    :data-disabled="disabled || undefined"
    @dragenter="enter"
    @dragover="over"
    @dragleave="leave"
    @drop.capture="reset"
    @drop="drop"
    @keydown.esc="reset"
  >
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
    <slot :dragging="dragging" :open="open" :disabled="!!disabled" />
    <div v-if="appearance === 'zone'" class="frame-file-presentation"
      ><slot
        name="presentation"
        :dragging="dragging"
        :open="open"
        :disabled="!!disabled"
        ><span>{{ message }}</span
        ><FrameButton variant="secondary" :disabled="disabled" @click="open">{{
          browseLabel
        }}</FrameButton></slot
      ></div
    >
    <div v-if="dragging" class="frame-file-overlay" aria-hidden="true"
      ><slot name="overlay" :dragging="dragging"
        ><span>{{ message }}</span></slot
      ></div
    >
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
.frame-file-drop-zone {
  position: relative;
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
  font: inherit;
}

.frame-file-presentation {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Space between children for .frame-file-presentation. @token --frame-gap */
  --_frame-default-gap-3e2a1ab688: 6px;
  gap: var(
    --frame-gap,
    var(--_frame-default-gap-3e2a1ab688)
  ); /* Inset inside the file drop-zone presentation. @token --frame-content-padding */
  --_frame-default-content-padding-130: 12px;
  padding: var(
    --frame-content-padding,
    var(--_frame-default-content-padding-130)
  ); /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border: 1px dashed var(--frame-control-border); /* Corner radius of the file drop-zone presentation and drag overlay. @token --frame-control-radius */
  --_frame-default-control-radius-131: 4px;
  border-radius: var(
    --frame-control-radius,
    var(--_frame-default-control-radius-131)
  );
}

.frame-file-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border: 2px dashed var(--frame-accent); /* Corner radius of the file drop-zone presentation and drag overlay. @token --frame-control-radius */
  --_frame-default-control-radius-131: 4px;
  border-radius: var(
    --frame-control-radius,
    var(--_frame-default-control-radius-131)
  ); /* Shared translucent fill for floating surfaces over the application canvas. @token --frame-overlay-background @context */
  background: var(
    --frame-overlay-background
  ); /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
}
</style>
