import type { FrameHost, HostFile, HostFileOptions, HostWindowState, HostCleanup } from '@frame/core';

/** Only these operations cross the preload bridge. Never expose raw IPC to application content. */
export interface ElectronHostBridge {
  getState(): Promise<HostWindowState>;
  subscribe(listener: (state: HostWindowState) => void): HostCleanup;
  minimize(): Promise<void>;
  toggleMaximize(): Promise<void>;
  close(): Promise<void>;
  setFullscreen(value: boolean): Promise<void>;
  pickFiles(options?: HostFileOptions): Promise<readonly HostFile[]>;
  openUrl(url: string): Promise<void>;
  openFile(path: string): Promise<void>;
  revealFile(path: string): Promise<void>;
}
export function createElectronHost(bridge: ElectronHostBridge): FrameHost {
  return {
    window: {
      getState: () => bridge.getState(), subscribe: listener => bridge.subscribe(listener),
      minimize: () => bridge.minimize(), toggleMaximize: () => bridge.toggleMaximize(), close: () => bridge.close(),
      setFullscreen: value => bridge.setFullscreen(value), dragRegion: 'css',
    },
    files: { pick: options => bridge.pickFiles(options) },
    external: { openUrl: url => bridge.openUrl(url), openFile: path => bridge.openFile(path), revealFile: path => bridge.revealFile(path) },
  };
}
