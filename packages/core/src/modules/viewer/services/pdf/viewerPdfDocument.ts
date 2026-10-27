import {getDocument, PDFWorker, type PDFDocumentProxy} from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker&inline';

/**
 * Owns one PDF.js loading task and its dedicated browser worker.
 *
 * This module is reached only through the lazy PDF renderer. Disposing releases
 * both PDF.js resources and the underlying worker port, even during loading.
 */
export class ViewerPdfDocument {

  /** Dedicated worker port, never shared with another document. */
  private readonly port: Worker;

  /** PDF.js wrapper around the owned browser worker. */
  private readonly worker: PDFWorker;

  /** Loading task that also owns the resolved PDF document. */
  private task: ReturnType<typeof getDocument> | undefined;

  /** Whether asynchronous reads may still start or return a document. */
  private active = true;

  /** Starts a dedicated worker without reading the document bytes. */
  constructor() {
    this.port = new PdfWorker();
    this.worker = PDFWorker.create({port: this.port});
  }

  /** Reads document bytes and ignores results after disposal. */
  async load(blob: Blob): Promise<PDFDocumentProxy | undefined> {
    const data = new Uint8Array(await blob.arrayBuffer());
    if (!this.active) return;
    this.task = getDocument({data, worker: this.worker});
    const document = await this.task.promise;
    return this.active ? document : undefined;
  }

  /** Releases the loading task, PDF.js wrapper, and worker port once. */
  dispose(): void {
    if (!this.active) return;
    this.active = false;
    void this.task?.destroy().catch(() => {});
    this.worker.destroy();
    this.port.terminate();
  }
}
