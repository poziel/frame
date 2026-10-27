import {BrowserHost} from './browserHost';
import {HostWindowController} from './hostWindowController';

/** Releases a Frame-owned subscription without disposing its host service. */
export type HostCleanup = () => void;

/** Window presentation reported by a host adapter. */
export interface HostWindowState {

  /** Whether the native window is maximized. */
  maximized: boolean;

  /** Whether the native window or browser document is fullscreen. */
  fullscreen: boolean;
}

/**
 * Native window capabilities supplied by an application.
 * Optional methods declare supported operations; Frame never infers a runtime.
 */
export interface HostWindow {

  /** Reads current native window state. */
  getState(): Promise<HostWindowState>;

  /** Observes state changes and returns cleanup, possibly asynchronously. */
  subscribe?(
    listener: (state: HostWindowState) => void
  ): HostCleanup | Promise<HostCleanup>;

  /** Minimizes the current window when supported. */
  minimize?(): Promise<void>;

  /** Toggles maximized presentation when supported. */
  toggleMaximize?(): Promise<void>;

  /** Closes this window rather than necessarily quitting the application. */
  close?(): Promise<void>;

  /** Requests a specific fullscreen state when supported. */
  setFullscreen?(value: boolean): Promise<void>;

  /** Begins native dragging from an explicit user interaction. */
  startDragging?(): Promise<void>;

  /** CSS-driven dragging, as used by Electron. */
  dragRegion?: 'css';
}

/** Selected browser file or native path; file-reading policy belongs to the host. */
export interface HostFile {

  /** Display filename supplied by the picker. */
  name: string;

  /** Browser file access when supplied by the adapter. */
  file?: File;

  /** Native filesystem path when supplied by the adapter. */
  path?: string;
}

/** Selection hints passed to a host-owned file picker. */
export interface HostFileOptions {

  /** Whether more than one file may be selected. */
  multiple?: boolean;

  /** File-type hint; this is not content validation. */
  accept?: string;
}

/** File selection capability, independent of native window controls. */
export interface HostFiles {

  /** Returns selected files, or an empty array on cancellation. */
  pick(options?: HostFileOptions): Promise<readonly HostFile[]>;
}

/** External opening operations whose platform policy remains with the host. */
export interface HostExternal {

  /** Opens an external URL according to host policy. */
  openUrl(url: string): Promise<void>;

  /** Opens an authorized local path when supported. */
  openFile?(path: string): Promise<void>;

  /** Reveals an authorized local file in its file manager when supported. */
  revealFile?(path: string): Promise<void>;
}

/** Independently optional services supplied when constructing a Frame. */
export interface FrameHost {

  /** Native window adapter; omitted for browser document fullscreen. */
  window?: HostWindow;

  /** Host-owned file picker. */
  files?: HostFiles;

  /** Host-owned external opening service. */
  external?: HostExternal;
}

/**
 * Coordinates host capabilities for one Frame without owning host services.
 * Window observation belongs to the window controller; file and external
 * services retain the exact adapters supplied by the application.
 */
export class HostController {

  /** Window capabilities, readonly state, and owned observation lifecycle. */
  readonly window: HostWindowController;

  /** Host-owned file service, without implicit fallback for custom adapters. */
  readonly files: HostFiles | undefined;

  /** Host-owned external opening service. */
  readonly external: HostExternal | undefined;

  /** Creates instance-local observation and retains explicitly supplied services. */
  constructor(adapter: FrameHost = new BrowserHost()) {
    this.window = new HostWindowController(adapter.window);
    this.files = adapter.files;
    this.external = adapter.external;
    this.attach = this.attach.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Readonly window state shared with the window capability. */
  get state() {
    return this.window.state;
  }

  /** Most recent asynchronous host observation failure. */
  get error() {
    return this.window.error;
  }

  /** Connects browser fullscreen observation when the shell mounts. */
  attach(document: Document): void {
    this.window.attach(document);
  }

  /** Releases Frame-owned observation without closing host services. */
  dispose(): void {
    this.window.dispose();
  }
}

/** Creates lazy browser services through the existing public factory API. */
export function createBrowserHost(): FrameHost {
  return new BrowserHost();
}

export {assertExternalUrl} from './externalUrl';
