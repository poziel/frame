import {detectViewerType, sniffViewerType, viewerFileName} from './viewer';
import type {ViewerFile, ViewerType} from '../types/viewerTypes';

/** Prepared document data whose object URL is owned by its loading request. */
export interface ViewerDocumentData {

  /** Supplied or downloaded bytes, with an SVG MIME override when required. */
  blob: Blob;

  /** Browser object URL revoked when the request is disposed. */
  url: string;

  /** Conservative classification used to select the renderer. */
  type: ViewerType;

  /** Decoded content only for text, code, or explicit SVG source. */
  text: string;
}

/**
 * Owns one bounded file load, its abort signal, and its browser object URL.
 *
 * Host files and URLs remain caller-owned. Disposal cancels a fetch and revokes
 * only the URL created by this request. Late Blob reads never publish a URL.
 */
export class ViewerDocument {

  /** Snapshot of host metadata for this request. */
  private readonly file: ViewerFile;

  /** Maximum accepted bytes, including streams without a content length. */
  private readonly limit: number;

  /** Fetch cancellation owned by this request. */
  private readonly abort = new AbortController();

  /** Whether an asynchronous result may still be published. */
  private active = true;

  /** URL allocated after successful reading and classification. */
  private ownedUrl = '';

  /** Records a request without fetching, decoding, or allocating an object URL. */
  constructor(file: ViewerFile, limit: number) {
    this.file = {...file};
    this.limit = limit;
  }

  /** Reads a bounded source and returns no result after cancellation. */
  async load(): Promise<ViewerDocumentData | undefined> {
    let data: Blob;
    if (this.file.source instanceof Blob) data = this.file.source;
    else {
      const response = await fetch(String(this.file.source), {
        signal: this.abort.signal,
      });
      if (!response.ok)
        throw new Error(`Unable to load file (${response.status}).`);
      if (Number(response.headers.get('content-length')) > this.limit)
        throw new Error('File exceeds the viewer size limit.');
      // Bound downloads even when content-length is absent or incorrect.
      if (!response.body) data = await response.blob();
      else {
        const reader = response.body.getReader(),
          chunks: Uint8Array<ArrayBuffer>[] = [];
        let size = 0;
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.byteLength;
            if (size > this.limit) {
              await reader.cancel();
              throw new Error('File exceeds the viewer size limit.');
            }
            chunks.push(chunk.value);
          }
        } finally {
          reader.releaseLock();
        }
        data = new Blob(chunks, {
          type: response.headers.get('content-type') ?? '',
        });
      }
    }
    if (data.size > this.limit)
      throw new Error('File exceeds the viewer size limit.');
    let detected = detectViewerType(
      viewerFileName(this.file),
      this.file.mimeType ?? data.type,
      this.file.language
    );
    const head = new Uint8Array(await data.slice(0, 4096).arrayBuffer());
    if (detected.kind === 'unsupported')
      detected = sniffViewerType(head) ?? detected;
    const sourceText =
      ['text', 'code'].includes(detected.kind) || detected.hasSource
        ? await data.text()
        : '';
    if (!this.active) return;
    // Explicit SVG MIME also allows extension-only SVG blobs to render correctly.
    if (detected.hasSource) data = new Blob([data], {type: 'image/svg+xml'});
    this.ownedUrl = URL.createObjectURL(data);
    return {blob: data, url: this.ownedUrl, type: detected, text: sourceText};
  }

  /** Cancels the request and revokes its URL once without altering the host source. */
  dispose(): void {
    if (!this.active) return;
    this.active = false;
    this.abort.abort();
    if (this.ownedUrl) URL.revokeObjectURL(this.ownedUrl);
  }
}
