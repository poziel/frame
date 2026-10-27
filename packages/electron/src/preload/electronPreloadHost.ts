import {contextBridge, ipcRenderer} from 'electron';
import type {HostWindowState} from '@frame/core';
import type {ElectronHostBridge} from '../types/electronHostBridge';

/**
 * Owns the fixed preload bridge exposed through Electron context isolation.
 *
 * The exposed value remains a plain object: class prototypes and raw IPC are
 * never passed across the boundary. Constructing this owner exposes nothing.
 */
export class ElectronPreloadHost {

  /** Plain capability facade copied by contextBridge into the renderer. */
  readonly bridge: ElectronHostBridge;

  /** Builds the fixed bridge without installing renderer globals. */
  constructor() {
    this.subscribe = this.subscribe.bind(this);
    this.bridge = {
      getState: () => ipcRenderer.invoke('frame:state'),
      subscribe: this.subscribe,
      minimize: () => ipcRenderer.invoke('frame:minimize'),
      toggleMaximize: () => ipcRenderer.invoke('frame:maximize'),
      close: () => ipcRenderer.invoke('frame:close'),
      setFullscreen: (value) => ipcRenderer.invoke('frame:fullscreen', value),
      pickFiles: (options) => ipcRenderer.invoke('frame:pick', options),
      openUrl: (url) => ipcRenderer.invoke('frame:url', url),
      openFile: (path) => ipcRenderer.invoke('frame:open-file', path),
      revealFile: (path) => ipcRenderer.invoke('frame:reveal-file', path),
    };
  }

  /** Exposes the fixed plain facade; call once from the host preload. */
  expose(key = 'frameHost'): void {
    contextBridge.exposeInMainWorld(key, this.bridge);
  }

  /** Observes one state listener and returns cleanup that removes only it. */
  subscribe(listener: (state: HostWindowState) => void): () => void {
    const changed = (_event: unknown, state: HostWindowState) =>
      listener(state);
    ipcRenderer.on('frame:changed', changed);
    return () => {
      ipcRenderer.removeListener('frame:changed', changed);
    };
  }
}
