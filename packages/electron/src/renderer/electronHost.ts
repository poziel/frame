import type {
  FrameHost,
  HostWindow,
  HostFiles,
  HostExternal,
  HostFile,
  HostFileOptions,
  HostWindowState,
  HostCleanup,
} from '@frame/core';
import type {ElectronHostBridge} from '../types/electronHostBridge';

/**
 * Adapts an application-owned preload bridge to Frame's host capabilities.
 *
 * Construction performs no IPC. Operations remain bound when retained by Frame;
 * subscriptions are released by their callers, not by disposing the bridge.
 */
export class ElectronHost implements FrameHost {

  /** CSS-dragging native window operations exposed to Frame. */
  readonly window: HostWindow;

  /** File-picker capability backed by the preload bridge. */
  readonly files: HostFiles;

  /** Authorized external URL and local-path operations. */
  readonly external: HostExternal;

  /** Application-owned, context-isolated bridge; never raw IPC. */
  private readonly bridge: ElectronHostBridge;

  /** Records the bridge and creates capability facades without native work. */
  constructor(bridge: ElectronHostBridge) {
    this.bridge = bridge;
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.minimize = this.minimize.bind(this);
    this.toggleMaximize = this.toggleMaximize.bind(this);
    this.close = this.close.bind(this);
    this.setFullscreen = this.setFullscreen.bind(this);
    this.pickFiles = this.pickFiles.bind(this);
    this.openUrl = this.openUrl.bind(this);
    this.openFile = this.openFile.bind(this);
    this.revealFile = this.revealFile.bind(this);
    this.window = {
      getState: this.getState,
      subscribe: this.subscribe,
      minimize: this.minimize,
      toggleMaximize: this.toggleMaximize,
      close: this.close,
      setFullscreen: this.setFullscreen,
      dragRegion: 'css',
    };
    this.files = {pick: this.pickFiles};
    this.external = {
      openUrl: this.openUrl,
      openFile: this.openFile,
      revealFile: this.revealFile,
    };
  }

  /** Reads current window presentation. */
  getState(): Promise<HostWindowState> {
    return this.bridge.getState();
  }

  /** Observes authorized window state and returns listener cleanup. */
  subscribe(listener: (state: HostWindowState) => void): HostCleanup {
    return this.bridge.subscribe(listener);
  }

  /** Minimizes the owning native window. */
  minimize(): Promise<void> {
    return this.bridge.minimize();
  }

  /** Toggles native maximization. */
  toggleMaximize(): Promise<void> {
    return this.bridge.toggleMaximize();
  }

  /** Requests closure of the owning window. */
  close(): Promise<void> {
    return this.bridge.close();
  }

  /** Sets native fullscreen presentation. */
  setFullscreen(value: boolean): Promise<void> {
    return this.bridge.setFullscreen(value);
  }

  /** Opens the host file picker. */
  pickFiles(options?: HostFileOptions): Promise<readonly HostFile[]> {
    return this.bridge.pickFiles(options);
  }

  /** Opens an allowed external URL. */
  openUrl(url: string): Promise<void> {
    return this.bridge.openUrl(url);
  }

  /** Opens a local file through host path authorization. */
  openFile(path: string): Promise<void> {
    return this.bridge.openFile(path);
  }

  /** Reveals a local path through host authorization. */
  revealFile(path: string): Promise<void> {
    return this.bridge.revealFile(path);
  }
}
