<script setup lang="ts">
import '../styles/index.scss';
import {computed, defineAsyncComponent, onBeforeUnmount, ref, watch} from 'vue';
import {FrameCodeBlock} from '../../../index';
import {viewerFileName} from '../services/viewer';
import type {ViewerFile} from '../types/viewerTypes';
import {ViewerController} from '../controllers/viewerController';

const PdfViewer = defineAsyncComponent(
  () => import('./renderers/ViewerPdf.vue')
);
const props = defineProps<{
  /** Portable source and optional display/type metadata. */
  file: ViewerFile;
  /** Applies to fetched and supplied files. Default: 100 MiB. */
  maxBytes?: number;
}>();
const emit = defineEmits<{
  /** Active load or renderer failure, preserving its original cause. */
  error: [error: unknown];
}>();
const video = ref<HTMLVideoElement>();
const viewer = new ViewerController({
  onError: (error) => emit('error', error),
  video: () => video.value,
});
const {type, blob, url, text, busy, failure, sourceMode, fail} = viewer;
const name = computed(() => viewerFileName(props.file));
watch(
  () => [
    props.file.source,
    props.file.name,
    props.file.mimeType,
    props.file.language,
    props.maxBytes,
  ],
  () => {
    void viewer.load(props.file, props.maxBytes);
  },
  {immediate: true}
);
onBeforeUnmount(viewer.dispose);
</script>
<template>
  <section class="frame-viewer-content" :aria-label="name" :aria-busy="busy">
    <p v-if="busy" role="status">Loading document…</p>
    <p v-else-if="failure" role="alert">{{ failure }}</p>
    <template v-else-if="type">
      <div
        v-if="type.hasSource"
        class="frame-viewer-toolbar frame-viewer-control-row"
        ><button
          class="frame-viewer-button"
          :aria-pressed="sourceMode"
          @click="sourceMode = !sourceMode"
          >{{ sourceMode ? 'Document mode' : 'Text mode' }}</button
        ></div
      >
      <FrameCodeBlock
        v-if="type.kind === 'code' || sourceMode"
        :code="text"
        :language="type.language"
        :label="name"
        line-numbers
        class="frame-viewer-code"
      />
      <pre
        v-else-if="type.kind === 'text'"
        class="frame-viewer-text"
        tabindex="0"
        >{{ text }}</pre>
      <img
        v-else-if="type.kind === 'image'"
        class="frame-viewer-image frame-viewer-media"
        :src="url"
        :alt="name"
        @error="
          fail(
            new Error(
              'This image format is unsupported or the file is damaged.'
            )
          )
        "
      />
      <video
        v-else-if="type.kind === 'video'"
        ref="video"
        :key="url"
        class="frame-viewer-video frame-viewer-media"
        :src="url"
        controls
        preload="metadata"
        :aria-label="name"
        @error="
          fail(
            new Error(
              'This video format is unsupported or the file is damaged.'
            )
          )
        "
      />
      <PdfViewer
        v-else-if="type.kind === 'pdf' && blob"
        :blob="blob"
        @error="fail"
      />
      <p v-else role="status">Preview is unavailable for this file type.</p>
    </template>
  </section>
</template>

<style lang="scss">
.frame-viewer-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  gap: var(--frame-gap, 6px);
  color: var(--frame-text);
}

.frame-viewer-media {
  display: block;
  margin: auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
  flex: 1;
}

.frame-viewer-text {
  margin: 0;
  padding: var(--frame-content-padding, 12px);
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--frame-font-mono, monospace);
  background: var(--frame-canvas, #101112);
  flex: 1;
}

.frame-viewer-code {
  flex: 1;
  min-height: 0;
}
</style>
