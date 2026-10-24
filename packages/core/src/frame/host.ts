import { readonly, shallowRef } from 'vue';

export type HostCleanup = () => void;
export interface HostWindowState { maximized: boolean; fullscreen: boolean }
/** Optional methods are capabilities. The host retains ownership of its window. */
export interface HostWindow {
  getState(): Promise<HostWindowState>;
  subscribe?(listener: (state: HostWindowState) => void): HostCleanup | Promise<HostCleanup>;
  minimize?(): Promise<void>;
  toggleMaximize?(): Promise<void>;
  close?(): Promise<void>;
  setFullscreen?(value: boolean): Promise<void>;
  startDragging?(): Promise<void>;
  /** CSS-driven dragging, as used by Electron. */
  dragRegion?: 'css';
}
export interface HostFile { name: string; file?: File; path?: string }
export interface HostFileOptions { multiple?: boolean; accept?: string }
export interface HostFiles { pick(options?: HostFileOptions): Promise<readonly HostFile[]> }
export interface HostExternal {
  openUrl(url: string): Promise<void>;
  openFile?(path: string): Promise<void>;
  revealFile?(path: string): Promise<void>;
}
export interface FrameHost { window?: HostWindow; files?: HostFiles; external?: HostExternal }

/** Portable external URL policy. Native hosts may apply additional restrictions. */
export function assertExternalUrl(url: string) {
  if (!['https:', 'http:', 'mailto:'].includes(new URL(url).protocol)) throw new Error('Unsupported external URL protocol');
}

/** No DOM access until an operation is requested. */
export function createBrowserHost(): FrameHost {
  return {
    files: { pick(options = {}) {
      return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') { reject(new Error('File selection requires a browser document')); return; }
        const input = document.createElement('input');
        input.type = 'file'; input.multiple = options.multiple ?? false; input.accept = options.accept ?? '';
        input.style.display = 'none';
        const finish = (files: readonly HostFile[]) => { input.remove(); resolve(files); };
        input.addEventListener('change', () => finish(Array.from(input.files ?? [], file => ({ name: file.name, file }))), { once: true });
        input.addEventListener('cancel', () => finish([]), { once: true });
        document.body.appendChild(input);
        try { input.click(); } catch (error) { input.remove(); reject(error); }
      });
    } },
    external: { async openUrl(url) {
      assertExternalUrl(url);
      if (typeof window === 'undefined') throw new Error('Opening URLs requires a browser window');
      window.open(url, '_blank', 'noopener,noreferrer');
    } },
  };
}

/** Frame owns subscriptions, never the caller's host services. */
export function createHostController(adapter: FrameHost = createBrowserHost()) {
  const state = shallowRef<HostWindowState>({ maximized: false, fullscreen: false });
  const error = shallowRef<unknown>();
  const native = adapter.window;
  let disposed = false;
  let cleanup: HostCleanup | undefined;
  let documentCleanup: HostCleanup | undefined;
  let attachedDocument: Document | undefined;
  let revision = 0;
  const update = (value: HostWindowState) => { if (!disposed) { revision++; state.value = { ...value }; } };
  async function refresh() {
    if (!native || disposed) return;
    const current = revision;
    const value = await native.getState();
    if (revision === current) update(value);
  }
  if (native) {
    // Subscribe before reading to avoid missing an intervening native state change.
    void Promise.resolve().then(async () => {
      if (disposed) return;
      const stop = await native.subscribe?.(update);
      if (disposed) { stop?.(); return; }
      cleanup = stop;
      await refresh();
    }).catch(cause => { if (!disposed) error.value = cause; });
  }
  const requireActive = () => { if (disposed) throw new Error('Frame host is disposed'); };
  function attach(document: Document) {
    requireActive();
    if (native || attachedDocument === document) return;
    documentCleanup?.(); attachedDocument = document;
    const changed = () => update({ maximized: false, fullscreen: !!document.fullscreenElement });
    document.addEventListener('fullscreenchange', changed); changed();
    documentCleanup = () => document.removeEventListener('fullscreenchange', changed);
  }
  function supports(action: 'minimize' | 'maximize' | 'close' | 'fullscreen' | 'drag') {
    if (disposed) return false;
    if (action === 'fullscreen') return native ? !!native.setFullscreen : !!attachedDocument?.fullscreenEnabled;
    return !!native?.[action === 'maximize' ? 'toggleMaximize' : action === 'drag' ? 'startDragging' : action];
  }
  async function execute(action: 'minimize' | 'maximize' | 'close') {
    requireActive();
    if (!supports(action)) throw new Error(`Host does not support ${action}`);
    await native![action === 'maximize' ? 'toggleMaximize' : action]!();
    if (action !== 'close') await refresh();
  }
  async function toggleFullscreen(element?: HTMLElement) {
    requireActive();
    if (native?.setFullscreen) { await native.setFullscreen(!(await native.getState()).fullscreen); await refresh(); return; }
    if (native) throw new Error('Host does not support fullscreen');
    const doc = element?.ownerDocument ?? attachedDocument;
    if (!doc?.fullscreenEnabled) throw new Error('Browser fullscreen is unavailable');
    if (doc.fullscreenElement) await doc.exitFullscreen(); else await doc.documentElement.requestFullscreen();
  }
  return {
    state: readonly(state), error: readonly(error), files: adapter.files, external: adapter.external,
    window: { state: readonly(state), supports, execute, toggleFullscreen,
      dragRegion: native?.dragRegion,
      async startDragging() { requireActive(); await native?.startDragging?.(); },
    },
    attach,
    dispose() { if (disposed) return; disposed = true; cleanup?.(); documentCleanup?.(); attachedDocument = undefined; },
  };
}
