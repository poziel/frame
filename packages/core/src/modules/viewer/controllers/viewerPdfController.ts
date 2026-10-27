import {nextTick, ref, shallowRef} from 'vue';
import type {PDFDocumentProxy, RenderTask} from 'pdfjs-dist';
import {ViewerPdfDocument} from '../services/pdf/viewerPdfDocument';

/**
 * Owns PDF navigation, zoom, document replacement, and canvas rendering.
 *
 * Each render invalidates and cancels its predecessor before reusing the canvas.
 * The component supplies the canvas and watches reactive navigation state; this
 * controller owns document and render cleanup without requiring a Frame.
 */
export class ViewerPdfController {

  /** Current successfully loaded PDF, watched by the component. */
  readonly document = shallowRef<PDFDocumentProxy>();

  /** One-based page selection, initially reset to the first page. */
  readonly page = ref(1);

  /** Canvas scale controlled by the existing 25–300% toolbar. */
  readonly zoom = ref(1);

  /** Page count reported after the current document finishes loading. */
  readonly pages = ref(0);

  /** Whether a document or page is currently being prepared. */
  readonly busy = ref(true);

  /** Resolves the canvas after Vue has rendered it. */
  private readonly getCanvas: () => HTMLCanvasElement | undefined;

  /** Forwards active document or render failures to the parent viewer. */
  private readonly onError: (error: unknown) => void;

  /** Document and worker owner for the latest load. */
  private current: ViewerPdfDocument | undefined;

  /** Current render, cancelled before canvas reuse or disposal. */
  private rendering: RenderTask | undefined;

  /** Monotonic render generation used to reject stale async continuations. */
  private revision = 0;

  /** Prevents loading or rendering after unmount. */
  private disposed = false;

  /** Records component dependencies without loading PDF bytes or starting a worker. */
  constructor(
    getCanvas: () => HTMLCanvasElement | undefined,
    onError: (error: unknown) => void
  ) {
    this.getCanvas = getCanvas;
    this.onError = onError;
    this.load = this.load.bind(this);
    this.render = this.render.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Replaces the document and resets page and zoom before reading its bytes. */
  async load(blob: Blob): Promise<void> {
    if (this.disposed) return;
    this.stopRender();
    this.current?.dispose();
    const request = new ViewerPdfDocument();
    this.current = request;
    this.document.value = undefined;
    this.pages.value = 0;
    this.page.value = 1;
    this.zoom.value = 1;
    this.busy.value = true;
    try {
      const pdf = await request.load(blob);
      if (this.current !== request || !pdf) return;
      this.pages.value = pdf.numPages;
      this.document.value = pdf;
    } catch (error) {
      if (this.current === request) this.onError(error);
    }
  }

  /** Renders the selected page, preserving cancellation and backing-pixel limits. */
  async render(): Promise<void> {
    const pdf = this.document.value;
    const number = this.page.value;
    const scale = this.zoom.value;
    const previous = this.rendering;
    this.stopRender();
    const current = this.revision;
    if (!pdf || this.disposed) return;
    this.busy.value = true;
    try {
      await previous?.promise.catch(() => {});
      const pdfPage = await pdf.getPage(number);
      await nextTick();
      const surface = this.getCanvas();
      if (current !== this.revision || !surface) return;
      const viewport = pdfPage.getViewport({scale});
      // Cap backing pixels for unusually large PDF pages.
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(16_000_000 / (viewport.width * viewport.height))
      );
      const context = surface.getContext('2d');
      if (!context) throw new Error('PDF canvas is unavailable.');
      surface.width = Math.ceil(viewport.width * ratio);
      surface.height = Math.ceil(viewport.height * ratio);
      surface.style.width = `${viewport.width}px`;
      surface.style.height = `${viewport.height}px`;
      const render = pdfPage.render({
        canvas: surface,
        canvasContext: context,
        viewport,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      this.rendering = render;
      await render.promise;
    } catch (error) {
      if (current === this.revision) this.onError(error);
    } finally {
      if (current === this.revision) this.busy.value = false;
    }
  }

  /** Cancels canvas work and destroys the current document and worker once. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopRender();
    this.current?.dispose();
    this.current = undefined;
  }

  /** Invalidates async page work before cancelling the active render task. */
  private stopRender(): void {
    this.revision++;
    this.rendering?.cancel();
    this.rendering = undefined;
  }
}
