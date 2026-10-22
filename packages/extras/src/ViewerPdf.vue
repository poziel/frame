<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { getDocument, PDFWorker, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker&inline';
const props = defineProps<{ blob: Blob }>();
const emit = defineEmits<{ error: [error: unknown] }>();
const document = shallowRef<PDFDocumentProxy>(), canvas = ref<HTMLCanvasElement>();
const page = ref(1), zoom = ref(1), pages = ref(0), busy = ref(true);
let rendering: RenderTask | undefined;
let revision = 0;
function stopRender() { revision++; rendering?.cancel(); rendering = undefined; }
watch(() => props.blob, async (blob, _old, cleanup) => {
  let active = true;
  const port = new PdfWorker(), worker = PDFWorker.create({ port });
  let task: ReturnType<typeof getDocument> | undefined;
  cleanup(() => { active = false; stopRender(); void task?.destroy().catch(() => {}); worker.destroy(); port.terminate(); });
  document.value = undefined; pages.value = 0; page.value = 1; zoom.value = 1; busy.value = true;
  try {
    const data = new Uint8Array(await blob.arrayBuffer());
    if (!active) return;
    task = getDocument({ data, worker });
    const pdf = await task.promise;
    if (!active) return;
    pages.value = pdf.numPages; document.value = pdf;
  } catch (error) { if (active) emit('error', error); }
}, { immediate: true });
watch([document, page, zoom], async ([pdf, number, scale]) => {
  const previous = rendering; stopRender(); const current = revision;
  if (!pdf) return;
  busy.value = true;
  try {
    await previous?.promise.catch(() => {});
    const pdfPage = await pdf.getPage(number);
    await nextTick();
    if (current !== revision || !canvas.value) return;
    const viewport = pdfPage.getViewport({ scale });
    // Cap backing pixels for unusually large PDF pages.
    const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(16_000_000 / (viewport.width * viewport.height)));
    const surface = canvas.value, context = surface.getContext('2d');
    if (!context) throw new Error('PDF canvas is unavailable.');
    surface.width = Math.ceil(viewport.width * ratio); surface.height = Math.ceil(viewport.height * ratio);
    surface.style.width = `${viewport.width}px`; surface.style.height = `${viewport.height}px`;
    const render = pdfPage.render({ canvas: surface, canvasContext: context, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
    rendering = render;
    await render.promise;
  } catch (error) { if (current === revision) emit('error', error); }
  finally { if (current === revision) busy.value = false; }
});
onBeforeUnmount(stopRender);
</script>
<template>
  <div class="frame-viewer-pdf" :aria-busy="busy">
    <nav class="frame-viewer-toolbar" aria-label="PDF controls">
      <button class="frame-viewer-button" :disabled="page <= 1" @click="page--">Previous</button>
      <span aria-live="polite">Page {{ page }} of {{ pages }}</span>
      <button class="frame-viewer-button" :disabled="page >= pages" @click="page++">Next</button>
      <button class="frame-viewer-button" aria-label="Zoom out" :disabled="zoom <= 0.25" @click="zoom = Math.max(0.25, zoom - 0.25)">−</button>
      <span>{{ Math.round(zoom * 100) }}%</span>
      <button class="frame-viewer-button" aria-label="Zoom in" :disabled="zoom >= 3" @click="zoom = Math.min(3, zoom + 0.25)">+</button>
    </nav>
    <div class="frame-viewer-pdf-page" tabindex="0" role="region" aria-label="PDF page">
      <p v-if="busy" role="status">Rendering page…</p>
      <canvas ref="canvas" role="img" :aria-label="`PDF page ${page}; visual preview`" />
    </div>
  </div>
</template>
