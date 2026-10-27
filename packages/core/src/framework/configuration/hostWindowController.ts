import {readonly, shallowRef} from 'vue';
import type {HostCleanup, HostWindow, HostWindowState} from './host';

/** Window operations queried by shell buttons, commands, and dragging. */
export type HostWindowAction =
  'minimize' | 'maximize' | 'close' | 'fullscreen' | 'drag';

/** Native actions that can be invoked through execute(). */
export type HostWindowCommand = 'minimize' | 'maximize' | 'close';

/**
 * Owns one Frame's native-window subscription or browser fullscreen listener.
 * State reads are guarded against newer subscription updates. Disposal releases
 * observation, including subscriptions that finish registering after disposal;
 * the host retains ownership of its native window and services.
 */
export class HostWindowController {

  /** Mutable state written only by this controller's observation path. */
  private readonly currentState = shallowRef<HostWindowState>({
    maximized: false,
    fullscreen: false,
  });

  /** Latest asynchronous observation error, retained for host diagnostics. */
  private readonly observationError = shallowRef<unknown>();

  /** Readonly state consumed by commands and shell controls. */
  readonly state = readonly(this.currentState);

  /** Readonly error exposed through frame.host.error. */
  readonly error = readonly(this.observationError);

  /** Optional native adapter; absence permits document-based fullscreen. */
  private readonly native: HostWindow | undefined;

  /** Prevents native calls and state updates after ownership ends. */
  private disposed = false;

  /** Cleanup returned by the native state subscription. */
  private cleanup: HostCleanup | undefined;

  /** Cleanup for the currently attached document's fullscreen listener. */
  private documentCleanup: HostCleanup | undefined;

  /** Browser document selected by the mounted shell. */
  private attachedDocument: Document | undefined;

  /** Monotonic state version used to discard stale asynchronous reads. */
  private revision = 0;

  /** Creates state and starts deferred native observation when supplied. */
  constructor(native?: HostWindow) {
    this.native = native;
    this.supports = this.supports.bind(this);
    this.execute = this.execute.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.startDragging = this.startDragging.bind(this);
    this.attach = this.attach.bind(this);
    this.dispose = this.dispose.bind(this);
    if (native) {
      void Promise.resolve()
        .then(() => this.observe())
        .catch((cause) => {
          if (!this.disposed) this.observationError.value = cause;
        });
    }
  }

  /** Optional CSS-driven native dragging capability supplied by the adapter. */
  get dragRegion(): 'css' | undefined {
    return this.native?.dragRegion;
  }

  /**
   * Observes browser fullscreen; attaching the same document twice is harmless.
   * Switching documents releases the old listener before attaching the new one.
   */
  attach(document: Document): void {
    this.requireActive();
    if (this.native || this.attachedDocument === document) return;
    this.documentCleanup?.();
    this.attachedDocument = document;
    const changed = () =>
      this.update({maximized: false, fullscreen: !!document.fullscreenElement});
    document.addEventListener('fullscreenchange', changed);
    changed();
    this.documentCleanup = () =>
      document.removeEventListener('fullscreenchange', changed);
  }

  /** Reports explicit capabilities, returning false once disposed. */
  supports(action: HostWindowAction): boolean {
    if (this.disposed) return false;
    if (action === 'fullscreen') {
      return this.native
        ? !!this.native.setFullscreen
        : !!this.attachedDocument?.fullscreenEnabled;
    }
    return !!this.native?.[
      action === 'maximize'
        ? 'toggleMaximize'
        : action === 'drag'
          ? 'startDragging'
          : action
    ];
  }

  /** Executes a supported native action and refreshes state unless closing. */
  async execute(action: HostWindowCommand): Promise<void> {
    this.requireActive();
    if (!this.supports(action))
      throw new Error(`Host does not support ${action}`);
    await this.native![action === 'maximize' ? 'toggleMaximize' : action]!();
    if (action !== 'close') await this.refresh();
  }

  /** Toggles native fullscreen or fullscreen on the attached browser document. */
  async toggleFullscreen(element?: HTMLElement): Promise<void> {
    this.requireActive();
    if (this.native?.setFullscreen) {
      const state = await this.native.getState();
      this.requireActive();
      await this.native.setFullscreen(!state.fullscreen);
      await this.refresh();
      return;
    }
    if (this.native) throw new Error('Host does not support fullscreen');
    const document = element?.ownerDocument ?? this.attachedDocument;
    if (!document?.fullscreenEnabled)
      throw new Error('Browser fullscreen is unavailable');
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }

  /** Begins dragging when supported; unsupported adapters retain no-op behavior. */
  async startDragging(): Promise<void> {
    this.requireActive();
    await this.native?.startDragging?.();
  }

  /** Releases owned listeners once without closing the host window. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.cleanup?.();
    } finally {
      this.documentCleanup?.();
      this.attachedDocument = undefined;
      this.cleanup = undefined;
      this.documentCleanup = undefined;
    }
  }

  /** Subscribes before reading state so an intervening native change is observed. */
  private async observe(): Promise<void> {
    if (this.disposed || !this.native) return;
    const stop = await this.native.subscribe?.((state) => this.update(state));
    if (this.disposed) {
      stop?.();
      return;
    }
    this.cleanup = stop;
    await this.refresh();
  }

  /** Applies an initial read only if no newer subscription update has arrived. */
  private async refresh(): Promise<void> {
    if (!this.native || this.disposed) return;
    const revision = this.revision;
    const value = await this.native.getState();
    if (this.revision === revision) this.update(value);
  }

  /** Copies host state into the readonly public projection while still active. */
  private update(value: HostWindowState): void {
    if (this.disposed) return;
    this.revision++;
    this.currentState.value = {...value};
  }

  /** Rejects operations whose Frame-owned lifecycle has ended. */
  private requireActive(): void {
    if (this.disposed) throw new Error('Frame host is disposed');
  }
}
