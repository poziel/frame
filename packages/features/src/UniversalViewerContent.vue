<script setup lang="ts">
import { computed, defineAsyncComponent, ref, shallowRef, watch } from 'vue';
import { FrameCodeBlock } from '@frame/core';
import { detectViewerType, sniffViewerType, viewerFileName, type ViewerFile, type ViewerType } from './viewer';
const PdfViewer = defineAsyncComponent(() => import('./ViewerPdf.vue'));
const props = defineProps<{ file: ViewerFile; /** Applies to fetched and supplied files. Default: 100 MiB. */ maxBytes?: number }>();
const emit = defineEmits<{ error: [error: unknown] }>();
const type = shallowRef<ViewerType>();
const blob = shallowRef<Blob>();
const url = ref(''), text = ref(''), busy = ref(false), failure = ref(''), sourceMode = ref(false);
const name = computed(() => viewerFileName(props.file));
const video = ref<HTMLVideoElement>();
function fail(error: unknown) { failure.value = error instanceof Error ? error.message : 'Unable to display this file.'; emit('error', error); }
watch(() => [props.file.source, props.file.name, props.file.mimeType, props.file.language, props.maxBytes] as const, async (_, _old, cleanup) => {
  const abort = new AbortController(); let active = true; let ownedUrl = '';
  cleanup(() => {
    active = false; abort.abort();
    if (video.value) { video.value.pause(); video.value.removeAttribute('src'); video.value.load(); }
    if (ownedUrl) URL.revokeObjectURL(ownedUrl);
  });
  busy.value = true; failure.value = ''; url.value = ''; blob.value = undefined; text.value = ''; type.value = undefined; sourceMode.value = false;
  const file = { ...props.file }, limit = props.maxBytes ?? 100 * 1024 * 1024;
  try {
    let data: Blob;
    if (file.source instanceof Blob) data = file.source;
    else {
      const response = await fetch(String(file.source), { signal: abort.signal });
      if (!response.ok) throw new Error(`Unable to load file (${response.status}).`);
      if (Number(response.headers.get('content-length')) > limit) throw new Error('File exceeds the viewer size limit.');
      // Bound downloads even when content-length is absent or incorrect.
      if (!response.body) data = await response.blob();
      else {
        const reader = response.body.getReader(), chunks: Uint8Array<ArrayBuffer>[] = []; let size = 0;
        try { while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.byteLength; if (size > limit) { await reader.cancel(); throw new Error('File exceeds the viewer size limit.'); } chunks.push(chunk.value); } }
        finally { reader.releaseLock(); }
        data = new Blob(chunks, { type: response.headers.get('content-type') ?? '' });
      }
    }
    if (data.size > limit) throw new Error('File exceeds the viewer size limit.');
    let detected = detectViewerType(viewerFileName(file), file.mimeType ?? data.type, file.language);
    const head = new Uint8Array(await data.slice(0, 4096).arrayBuffer());
    if (detected.kind === 'unsupported') detected = sniffViewerType(head) ?? detected;
    const sourceText = ['text', 'code'].includes(detected.kind) || detected.hasSource ? await data.text() : '';
    if (!active) return;
    // Explicit SVG MIME also allows extension-only SVG blobs to render correctly.
    if (detected.hasSource) data = new Blob([data], { type: 'image/svg+xml' });
    ownedUrl = URL.createObjectURL(data); url.value = ownedUrl; blob.value = data; type.value = detected; text.value = sourceText;
  } catch (error) { if (active) fail(error); }
  finally { if (active) busy.value = false; }
}, { immediate: true });
</script>
<template>
  <section class="frame-viewer-content" :aria-label="name" :aria-busy="busy">
    <p v-if="busy" role="status">Loading document…</p>
    <p v-else-if="failure" role="alert">{{ failure }}</p>
    <template v-else-if="type">
      <div v-if="type.hasSource" class="frame-viewer-toolbar"><button class="frame-viewer-button" :aria-pressed="sourceMode" @click="sourceMode = !sourceMode">{{ sourceMode ? 'Document mode' : 'Text mode' }}</button></div>
      <FrameCodeBlock v-if="type.kind === 'code' || sourceMode" :code="text" :language="type.language" :label="name" line-numbers class="frame-viewer-code" />
      <pre v-else-if="type.kind === 'text'" class="frame-viewer-text" tabindex="0">{{ text }}</pre>
      <img v-else-if="type.kind === 'image'" class="frame-viewer-image" :src="url" :alt="name" @error="fail(new Error('This image format is unsupported or the file is damaged.'))" />
      <video v-else-if="type.kind === 'video'" ref="video" :key="url" class="frame-viewer-video" :src="url" controls preload="metadata" :aria-label="name" @error="fail(new Error('This video format is unsupported or the file is damaged.'))" />
      <PdfViewer v-else-if="type.kind === 'pdf' && blob" :blob="blob" @error="fail" />
      <p v-else role="status">Preview is unavailable for this file type.</p>
    </template>
  </section>
</template>
