import type {FrameHost} from './host';
import {BrowserHostFiles} from './browserHostFiles';
import {BrowserHostExternal} from './browserHostExternal';

/**
 * Browser implementation of the optional host services.
 * Construction performs no DOM access, file selection, or URL opening.
 * Native window methods remain absent; fullscreen belongs to the document.
 */
export class BrowserHost implements FrameHost {

  /** Lazy browser file picker, independent of any native runtime. */
  readonly files = new BrowserHostFiles();

  /** Browser URL opening service with the portable protocol policy. */
  readonly external = new BrowserHostExternal();
}
