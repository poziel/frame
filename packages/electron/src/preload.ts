import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronHostBridge } from './index';
import type { HostWindowState } from '@frame/core';

/** Call once from the host preload. Returns a bridge; no IPC object crosses context isolation. */
export function exposeElectronHost(key = 'frameHost') {
  const bridge: ElectronHostBridge = {
    getState: () => ipcRenderer.invoke('frame:state'),
    subscribe(listener) {
      const changed = (_event: unknown, state: HostWindowState) => listener(state);
      ipcRenderer.on('frame:changed', changed);
      return () => { ipcRenderer.removeListener('frame:changed', changed); };
    },
    minimize: () => ipcRenderer.invoke('frame:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('frame:maximize'),
    close: () => ipcRenderer.invoke('frame:close'),
    setFullscreen: value => ipcRenderer.invoke('frame:fullscreen', value),
    pickFiles: options => ipcRenderer.invoke('frame:pick', options),
    openUrl: url => ipcRenderer.invoke('frame:url', url),
    openFile: path => ipcRenderer.invoke('frame:open-file', path),
    revealFile: path => ipcRenderer.invoke('frame:reveal-file', path),
  };
  contextBridge.exposeInMainWorld(key, bridge);
}
