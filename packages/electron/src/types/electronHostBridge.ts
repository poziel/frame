import type {
  HostFile,
  HostFileOptions,
  HostWindowState,
  HostCleanup,
} from '@frame/core';

/** Only these operations cross the preload bridge. Never expose raw IPC to application content. */
export interface ElectronHostBridge {

  /** Reads current window presentation. */
  getState(): Promise<HostWindowState>;

  /** Observes authorized window state and returns listener cleanup. */
  subscribe(listener: (state: HostWindowState) => void): HostCleanup;

  /** Minimizes the owning native window. */
  minimize(): Promise<void>;

  /** Toggles native maximization. */
  toggleMaximize(): Promise<void>;

  /** Requests closure of the owning window. */
  close(): Promise<void>;

  /** Sets native fullscreen presentation. */
  setFullscreen(value: boolean): Promise<void>;

  /** Opens the host file picker. */
  pickFiles(options?: HostFileOptions): Promise<readonly HostFile[]>;

  /** Opens an allowed external URL. */
  openUrl(url: string): Promise<void>;

  /** Opens a local file through host path authorization. */
  openFile(path: string): Promise<void>;

  /** Reveals a local path through host authorization. */
  revealFile(path: string): Promise<void>;
}
