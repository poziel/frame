<script setup lang="ts">
import '../../styles/index.css';
import {onBeforeUnmount, ref, watch} from 'vue';
import {ViewerPdfController} from '../../controllers/viewerPdfController';

const props = defineProps<{
  /** Bounded PDF bytes supplied by the parent content viewer. */
  blob: Blob;
}>();
const emit = defineEmits<{
  /** Active PDF loading or canvas rendering failure. */
  error: [error: unknown];
}>();
const canvas = ref<HTMLCanvasElement>();
const viewer = new ViewerPdfController(
  () => canvas.value,
  (error) => emit('error', error)
);
const {document, page, zoom, pages, busy} = viewer;
watch(() => props.blob, viewer.load, {immediate: true});
watch([document, page, zoom], viewer.render);
onBeforeUnmount(viewer.dispose);
</script>
<template>
  <div class="frame-viewer-pdf" :aria-busy="busy">
    <nav class="frame-viewer-toolbar" aria-label="PDF controls">
      <button class="frame-viewer-button" :disabled="page <= 1" @click="page--"
        >Previous</button
      >
      <span aria-live="polite">Page {{ page }} of {{ pages }}</span>
      <button
        class="frame-viewer-button"
        :disabled="page >= pages"
        @click="page++"
        >Next</button
      >
      <button
        class="frame-viewer-button"
        aria-label="Zoom out"
        :disabled="zoom <= 0.25"
        @click="zoom = Math.max(0.25, zoom - 0.25)"
        >−</button
      >
      <span>{{ Math.round(zoom * 100) }}%</span>
      <button
        class="frame-viewer-button"
        aria-label="Zoom in"
        :disabled="zoom >= 3"
        @click="zoom = Math.min(3, zoom + 0.25)"
        >+</button
      >
    </nav>
    <div
      class="frame-viewer-pdf-page"
      tabindex="0"
      role="region"
      aria-label="PDF page"
    >
      <p v-if="busy" role="status">Rendering page…</p>
      <canvas
        ref="canvas"
        role="img"
        :aria-label="`PDF page ${page}; visual preview`"
      />
    </div>
  </div>
</template>
