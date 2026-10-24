<script setup lang="ts">
import { ref, shallowRef, useId } from 'vue';
import { FrameButton } from '@frame/core';
import { UniversalViewer, UniversalViewerContent, type ViewerFile } from '@frame/features';
import { viewerSamplePdf } from './viewerSamples';
const inputId = useId();
const open = ref(false);
const file = shallowRef<ViewerFile>();
const error = ref('');
function select(value: ViewerFile) { file.value = value; error.value = ''; }
function choose(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) select({ source: input.files[0] });
  input.value = '';
}
function sample(kind: 'text' | 'code' | 'svg' | 'binary') {
  const samples = {
    text: { name: 'welcome.txt', type: 'text/plain', content: 'Welcome to Frame.\nSelect a local file or open this preview fullscreen.\n\nFiles selected here stay in your browser; this demo does not upload them.' },
    code: { name: 'hello.ts', type: 'text/plain', content: 'export function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n' },
    svg: { name: 'drawing.svg', type: 'image/svg+xml', content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" rx="16" fill="#18334a"/><circle cx="160" cy="80" r="42" fill="#5dc8ee"/><text x="160" y="150" text-anchor="middle" fill="white" font-family="sans-serif">Frame viewer</text></svg>' },
    binary: { name: 'unknown.bin', type: 'application/octet-stream', content: '\x00\x01\x02' },
  };
  const value = samples[kind];
  select({ source: new File([value.content], value.name, { type: value.type }) });
}
</script>
<template>
  <div class="viewer-example">
    <p>Try a sample or choose an image, SVG, PDF, video, code, or text file. Local files stay in your browser.</p>
    <div class="viewer-example-actions">
      <label :for="inputId">Choose a local file <input :id="inputId" type="file" @change="choose" /></label>
      <FrameButton v-for="kind in (['text', 'code', 'svg', 'binary'] as const)" :key="kind" variant="secondary" @click="sample(kind)">{{ kind === 'binary' ? 'Unsupported file' : `${kind.toUpperCase()} sample` }}</FrameButton>
      <FrameButton variant="primary" :disabled="!file" @click="open = true">Open fullscreen</FrameButton>
      <FrameButton variant="secondary" @click="select({ source: viewerSamplePdf() })">PDF sample</FrameButton>
    </div>
    <p v-if="file" role="status">Selected: {{ file.name ?? (file.source as File).name }}</p>
    <div class="viewer-example-preview">
      <UniversalViewerContent v-if="file" :file="file" @error="error = String($event)" />
      <p v-else>Select a file to preview it here.</p>
    </div>
    <UniversalViewer v-model:open="open" :file="file" @error="error = String($event)" />
    <p v-if="error" role="status">{{ error }}</p>
    <p>Office documents are unsupported. Image and video formats depend on your browser. PDFs provide visual pages, navigation, and zoom; text selection and search are not included. The default file size limit is 100 MiB.</p>
  </div>
</template>
<style scoped>
.viewer-example { display: grid; gap: 12px; width: 100%; min-width: 0; }
.viewer-example-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.viewer-example-actions label { display: grid; gap: 6px; }
.viewer-example-actions input { max-width: 100%; }
.viewer-example-preview { height: 400px; min-width: 0; overflow: hidden; border: 1px solid var(--frame-line); }
</style>
