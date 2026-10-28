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
  /* Gap for .frame-viewer-content; gap. @token --frame-gap */
  --_frame-default-gap-3e2a1ab688: 6px;
  gap: var(--frame-gap, var(--_frame-default-gap-3e2a1ab688));
  /* Color for .frame-viewer-content; text. @token --frame-text @context */
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
  /* Padding for .frame-viewer-text; content padding. @token --frame-content-padding */
  --_frame-default-content-padding-130: 12px;
  padding: var(
    --frame-content-padding,
    var(--_frame-default-content-padding-130)
  );
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  /* Font family for .frame-viewer-text; font mono. @token --frame-font-mono */
  --_frame-default-font-mono-3920a95058: monospace;
  font-family: var(
    --frame-font-mono,
    var(--_frame-default-font-mono-3920a95058)
  );
  /* Background for .frame-viewer-text; canvas. @token --frame-canvas */
  --_frame-default-canvas-246c7f2437: #101112;
  background: var(--frame-canvas, var(--_frame-default-canvas-246c7f2437));
  flex: 1;
}

.frame-viewer-code {
  flex: 1;
  min-height: 0;
}
</style>
