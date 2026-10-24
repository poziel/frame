import type { ComponentExample } from './componentCatalog';
export const fileUploadExamples: ComponentExample[] = [
  { id: 'file-upload', title: 'File upload', group: 'Forms', description: 'Choose files with a browse button and an optional removable file list.', usage: 'Choose files, remove them, or adjust file type, size and count limits. Files stay in your browser; the host decides how to process them.', code: `<script setup lang="ts">
import { ref } from 'vue';
import { FrameFileUpload } from '@frame/core';
import '@frame/core/style.css';
const files = ref<File[]>([]);
</script>
<template>
  <FrameFileUpload v-model="files" multiple accept="image/*,.txt" :max-size="10485760" :max-files="3" />
</template>`, properties: [] },
  { id: 'file-drop-zone', title: 'File drop zone', group: 'Forms', description: 'Receive file drops in a visible zone or an invisible wrapper around application content.', usage: 'Drop files or browse in the visible zone. Switch to overlay mode to keep application content usable until files are dragged over it. The accepted event supplies browser File objects.', code: `<script setup lang="ts">
import { ref } from 'vue';
import { FrameFileDropZone } from '@frame/core';
import '@frame/core/style.css';
const names = ref<string[]>([]);
function receive(files: File[]) { names.value = files.map(file => file.name); }
</script>
<template>
  <FrameFileDropZone multiple @accepted="receive" />
  <FrameFileDropZone appearance="overlay" multiple @accepted="receive">
    <textarea aria-label="Workspace content" placeholder="Your editor stays usable here" />
    <template #overlay>Drop files to open them</template>
  </FrameFileDropZone>
  <p role="status">{{ names.join(', ') }}</p>
</template>`, properties: [] },
];
