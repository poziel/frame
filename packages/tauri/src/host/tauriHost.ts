import {getCurrentWindow} from '@tauri-apps/api/window';
import {open} from '@tauri-apps/plugin-dialog';
import {openUrl, openPath, revealItemInDir} from '@tauri-apps/plugin-opener';
import {assertExternalUrl} from '@frame/core';
import type {
  FrameHost,
  HostWindow,
  HostFiles,
  HostExternal,
  HostWindowState,
  HostFileOptions,
  HostFile,
} from '@frame/core';

/** Optional native capabilities; window operations remain available. */
export interface TauriHostOptions {

  /** Enables the native file picker unless explicitly false. */
  files?: boolean;

  /** Enables external URL and local-path opening unless explicitly false. */
  external?: boolean;
}

/**
 * Adapts the consuming application's current Tauri window and native plugins.
 *
 * Construction resolves the window handle without invoking native commands.
 * Plugin permissions and registration stay host-owned. Subscriptions return
 * caller-owned cleanup and suppress in-flight state events after removal.
 */
export class TauriHost implements FrameHost {

  /** Native window operations and resize-based state observation. */
  readonly window: HostWindow;

  /** Optional native file-picker facade. */
  readonly files: HostFiles | undefined;

  /** Optional external-opening facade. */
  readonly external: HostExternal | undefined;

  /** Application-owned current window handle. */
  private readonly nativeWindow: ReturnType<typeof getCurrentWindow>;

  /** Resolves native capabilities only when explicitly constructed by the host. */
  constructor(options: TauriHostOptions = {}) {
    this.nativeWindow = getCurrentWindow();
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.pickFiles = this.pickFiles.bind(this);
    this.openUrl = this.openUrl.bind(this);
    this.window = {
      getState: this.getState,
      subscribe: this.subscribe,
      minimize: () => this.nativeWindow.minimize(),
      toggleMaximize: () => this.nativeWindow.toggleMaximize(),
      close: () => this.nativeWindow.close(),
      setFullscreen: (value) => this.nativeWindow.setFullscreen(value),
      startDragging: () => this.nativeWindow.startDragging(),
    };
    this.files = options.files === false ? undefined : {pick: this.pickFiles};
    this.external =
      options.external === false
        ? undefined
        : {
            openUrl: this.openUrl,
            openFile: (path) => openPath(path),
            revealFile: (path) => revealItemInDir(path),
          };
  }

  /** Reads native maximization followed by fullscreen state. */
  async getState(): Promise<HostWindowState> {
    return {
      maximized: await this.nativeWindow.isMaximized(),
      fullscreen: await this.nativeWindow.isFullscreen(),
    };
  }

  /** Observes state changes and returns cleanup after native registration. */
  async subscribe(
    listener: (state: HostWindowState) => void
  ): Promise<() => void> {
    let active = true;
    const stop = await this.nativeWindow.onResized(async () => {
      try {
        const state = await this.getState();
        if (active) listener(state);
      } catch {
        /* Window may be closing. */
      }
    });
    return () => {
      active = false;
      stop();
    };
  }

  /** Selects native paths using extension-only filters; cancellation yields no files. */
  async pickFiles(options: HostFileOptions = {}): Promise<readonly HostFile[]> {
    const extensions = options.accept
      ?.split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (extensions?.some((value) => !/^\.[\w-]+$/.test(value)))
      throw new Error(
        'Native file filters require extensions such as .png,.jpg'
      );
    const paths = await open({
      multiple: options.multiple ?? false,
      directory: false,
      filters: extensions?.length
        ? [
            {
              name: 'Files',
              extensions: extensions.map((value) => value.slice(1)),
            },
          ]
        : undefined,
    });
    return (paths === null ? [] : Array.isArray(paths) ? paths : [paths]).map(
      (path) => ({name: path.split(/[\\/]/).pop() ?? path, path})
    );
  }

  /** Validates an ordinary external URL before invoking the opener plugin. */
  async openUrl(url: string): Promise<void> {
    assertExternalUrl(url);
    await openUrl(url);
  }
}
