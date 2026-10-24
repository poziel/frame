<script setup lang="ts">
import { ref, watch } from 'vue';
import FrameButton from './FrameButton.vue';
import type { FileRejection, FileSelection, FileUploadOptions } from '../forms/files';
import { useFilePicker } from '../forms/useFilePicker';
import '../forms/files.css';
const props = withDefaults(defineProps<FileUploadOptions & { disabled?: boolean; appearance?: 'zone' | 'overlay'; message?: string; browseLabel?: string }>(), { appearance: 'zone', message: 'Drop files here', browseLabel: 'Choose file' });
const emit = defineEmits<{ accepted: [files: File[]]; rejected: [files: FileRejection[]]; 'update:dragging': [dragging: boolean] }>();
const dragging = ref(false), errors = ref<FileRejection[]>([]);
let depth = 0;
function setDragging(value: boolean) { if (dragging.value !== value) { dragging.value = value; emit('update:dragging', value); } }
function reset() { depth = 0; setDragging(false); }
function selected(result: FileSelection) {
  errors.value = result.rejected;
  if (result.accepted.length) emit('accepted', result.accepted);
  if (result.rejected.length) emit('rejected', result.rejected);
}
const picker = useFilePicker(props, selected);
const { open, receive, change } = picker;
function isFile(event: DragEvent) { return Array.from(event.dataTransfer?.types ?? []).includes('Files'); }
function enter(event: DragEvent) { if (!props.disabled && isFile(event)) { event.preventDefault(); event.stopPropagation(); depth++; setDragging(true); } }
function over(event: DragEvent) { if (!props.disabled && isFile(event)) { event.preventDefault(); event.stopPropagation(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'; setDragging(true); } }
function leave(event: DragEvent) { if (dragging.value && isFile(event)) { event.stopPropagation(); if (--depth <= 0) reset(); } }
function drop(event: DragEvent) {
  if (!isFile(event)) return;
  reset();
  if (props.disabled) return;
  event.preventDefault(); event.stopPropagation();
  receive(Array.from(event.dataTransfer?.files ?? []));
}
watch(() => props.disabled, reset);
defineExpose({ open, reset });
</script>
<template>
  <div class="frame-file-drop-zone" :class="[`frame-file-drop-${appearance}`, { 'is-dragging': dragging }]" :data-dragging="dragging || undefined" :data-disabled="disabled || undefined" @dragenter="enter" @dragover="over" @dragleave="leave" @drop.capture="reset" @drop="drop" @keydown.esc="reset">
    <input :ref="picker.input" class="frame-file-input" type="file" tabindex="-1" aria-hidden="true" :accept="accept" :multiple="multiple" :disabled="disabled" @change="change" />
    <slot :dragging="dragging" :open="open" :disabled="!!disabled" />
    <div v-if="appearance === 'zone'" class="frame-file-presentation"><slot name="presentation" :dragging="dragging" :open="open" :disabled="!!disabled"><span>{{ message }}</span><FrameButton variant="secondary" :disabled="disabled" @click="open">{{ browseLabel }}</FrameButton></slot></div>
    <div v-if="dragging" class="frame-file-overlay" aria-hidden="true"><slot name="overlay" :dragging="dragging"><span>{{ message }}</span></slot></div>
    <div class="frame-file-errors" role="status" aria-live="polite"><slot name="errors" :errors="errors"><div v-for="(error, index) in errors" :key="index">{{ error.message }}</div></slot></div>
  </div>
</template>
