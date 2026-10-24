import { getCurrentWindow } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/plugin-dialog';
import { openUrl, openPath, revealItemInDir } from '@tauri-apps/plugin-opener';
import { assertExternalUrl, type FrameHost, type HostWindowState } from '@frame/core';

/** Call inside the consuming Tauri application; importing this module performs no native work. */
export function createTauriHost(options: { files?: boolean; external?: boolean } = {}): FrameHost {
  const window = getCurrentWindow();
  const getState = async (): Promise<HostWindowState> => ({ maximized: await window.isMaximized(), fullscreen: await window.isFullscreen() });
  return {
    window: {
      getState,
      async subscribe(listener) {
        let active = true;
        const stop = await window.onResized(async () => {
          try { const state = await getState(); if (active) listener(state); } catch { /* Window may be closing. */ }
        });
        return () => { active = false; stop(); };
      },
      minimize: () => window.minimize(), toggleMaximize: () => window.toggleMaximize(),
      close: () => window.close(), setFullscreen: value => window.setFullscreen(value),
      startDragging: () => window.startDragging(),
    },
    files: options.files === false ? undefined : { async pick(options = {}) {
      const extensions = options.accept?.split(',').map(value => value.trim()).filter(Boolean);
      if (extensions?.some(value => !/^\.[\w-]+$/.test(value))) throw new Error('Native file filters require extensions such as .png,.jpg');
      const paths = await open({ multiple: options.multiple ?? false, directory: false,
        filters: extensions?.length ? [{ name: 'Files', extensions: extensions.map(value => value.slice(1)) }] : undefined });
      return (paths === null ? [] : Array.isArray(paths) ? paths : [paths]).map(path => ({ name: path.split(/[\\/]/).pop() ?? path, path }));
    } },
    external: options.external === false ? undefined : {
      async openUrl(url) { assertExternalUrl(url); await openUrl(url); },
      openFile: path => openPath(path), revealFile: path => revealItemInDir(path),
    },
  };
}
