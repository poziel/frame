import {ref, shallowRef} from 'vue';
import type {ViewerFile, ViewerType} from '../types/viewerTypes';
import {ViewerDocument} from '../services/viewerDocument';

/** Optional integration callbacks; neither requires a Frame instance. */
export interface ViewerControllerOptions {

  /** Reports active load failures and renderer errors to the host. */
  onError?: (error: unknown) => void;

  /** Resolves the currently mounted video for media cleanup. */
  video?: () => HTMLVideoElement | undefined;
}

/**
 * Owns one viewer's reactive content and current loading request.
 *
 * Loading a new file cancels the previous request, stops its video, and releases
 * its object URL. Results and errors from superseded requests are ignored.
 * Construction loads no content, and disposal permanently releases this owner.
 *
 * @example
 * const viewer = new ViewerController();
 * await viewer.load({source: new Blob(['Hello']), name: 'notes.txt'});
 * viewer.dispose();
 */
export class ViewerController {

  /** Classification selected for the current successful load. */
  readonly type = shallowRef<ViewerType>();

  /** Current supplied or downloaded document bytes. */
  readonly blob = shallowRef<Blob>();

  /** Current request-owned object URL. */
  readonly url = ref('');

  /** Inert source text for text, code, or SVG source mode. */
  readonly text = ref('');

  /** Whether the current request is still reading or classifying content. */
  readonly busy = ref(false);

  /** Human-readable active load or renderer failure. */
  readonly failure = ref('');

  /** Whether SVG content displays its XML source instead of the image. */
  readonly sourceMode = ref(false);

  /** Host error forwarding and mounted-media access. */
  private readonly options: ViewerControllerOptions;

  /** Request currently owning the displayed bytes and object URL. */
  private current: ViewerDocument | undefined;

  /** Prevents loading after the component or host releases this controller. */
  private disposed = false;

  /** Creates independent state without loading a file or allocating resources. */
  constructor(options: ViewerControllerOptions = {}) {
    this.options = options;
    this.load = this.load.bind(this);
    this.fail = this.fail.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Loads a new document with the existing default limit of 100 MiB. */
  async load(file: ViewerFile, maxBytes = 100 * 1024 * 1024): Promise<void> {
    if (this.disposed) return;
    this.release();
    const request = new ViewerDocument(file, maxBytes);
    this.current = request;
    this.busy.value = true;
    this.failure.value = '';
    this.url.value = '';
    this.blob.value = undefined;
    this.text.value = '';
    this.type.value = undefined;
    this.sourceMode.value = false;
    try {
      const result = await request.load();
      if (this.current !== request || !result) return;
      this.url.value = result.url;
      this.blob.value = result.blob;
      this.type.value = result.type;
      this.text.value = result.text;
    } catch (error) {
      if (this.current === request) this.fail(error);
    } finally {
      if (this.current === request) this.busy.value = false;
    }
  }

  /** Records renderer or active-load failures and forwards the original cause. */
  fail(error: unknown): void {
    this.failure.value =
      error instanceof Error ? error.message : 'Unable to display this file.';
    this.options.onError?.(error);
  }

  /** Stops media and releases the active request once. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.release();
  }

  /** Stops the mounted video before revoking its source URL and aborting fetch. */
  private release(): void {
    if (!this.current) return;
    const video = this.options.video?.();
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    this.current.dispose();
    this.current = undefined;
  }
}
