import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import type { HostFileOptions } from '@frame/core';

export interface ElectronHostOptions {
  /** Explicitly authorize each application window and its current main-frame URL. */
  authorize(window: BrowserWindow, url: string): boolean;
  /** Host policy for opening/revealing local paths. Denied by default. */
  allowPath?(window: BrowserWindow, path: string): boolean;
}
/** Install once per Electron application; dispose handlers/listeners on application teardown. */
export function installElectronHost(options: ElectronHostOptions) {
  const watched = new Map<BrowserWindow, () => void>();
  const channels: string[] = [];
  const state = (win: BrowserWindow) => ({ maximized: win.isMaximized(), fullscreen: win.isFullScreen() });
  function sender(event: IpcMainInvokeEvent) {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || event.senderFrame !== event.sender.mainFrame || !options.authorize(win, event.senderFrame.url)) throw new Error('Unauthorized Frame host request');
    return win;
  }
  function handle(name: string, run: (win: BrowserWindow, value: unknown) => unknown) {
    const channel = 'frame:' + name;
    ipcMain.handle(channel, (event, value) => run(sender(event), value)); channels.push(channel);
  }
  function watch(win: BrowserWindow) {
    if (watched.has(win)) return;
    const changed = () => { if (!win.isDestroyed() && options.authorize(win, win.webContents.getURL())) win.webContents.send('frame:changed', state(win)); };
    const events = ['maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen'] as const;
    win.on('maximize', changed); win.on('unmaximize', changed); win.on('enter-full-screen', changed); win.on('leave-full-screen', changed);
    const stop = () => { for (const event of events) (win as import('node:events').EventEmitter).removeListener(event, changed); win.removeListener('closed', stop); watched.delete(win); };
    win.once('closed', stop); watched.set(win, stop);
  }
  function path(win: BrowserWindow, value: unknown) {
    if (typeof value !== 'string' || !value || !options.allowPath?.(win, value)) throw new Error('Path is not authorized by the host');
    return value;
  }
  try {
    handle('state', win => { watch(win); return state(win); });
    handle('minimize', win => win.minimize());
    handle('maximize', win => { if (win.isMaximized()) win.unmaximize(); else win.maximize(); });
    handle('close', win => { setTimeout(() => { if (!win.isDestroyed()) win.close(); }, 0); });
    handle('fullscreen', (win, value) => { if (typeof value !== 'boolean') throw new Error('Expected fullscreen boolean'); win.setFullScreen(value); });
    handle('pick', async (win, value) => {
      const input = (value ?? {}) as HostFileOptions;
      if (typeof input !== 'object' || input === null || (input.multiple !== undefined && typeof input.multiple !== 'boolean') || (input.accept !== undefined && typeof input.accept !== 'string')) throw new Error('Invalid file options');
      const extensions = input.accept?.split(',').map(value => value.trim()).filter(Boolean);
      if (extensions?.some(value => !/^\.[\w-]+$/.test(value))) throw new Error('Native file filters require extensions such as .png,.jpg');
      const result = await dialog.showOpenDialog(win, { properties: input.multiple ? ['openFile', 'multiSelections'] : ['openFile'], filters: extensions?.length ? [{ name: 'Files', extensions: extensions.map(value => value.slice(1)) }] : undefined });
      return result.canceled ? [] : result.filePaths.map(path => ({ name: path.split(/[\\/]/).pop() ?? path, path }));
    });
    handle('url', async (_win, value) => {
      if (typeof value !== 'string' || !['https:', 'http:', 'mailto:'].includes(new URL(value).protocol)) throw new Error('Unsupported external URL');
      await shell.openExternal(value);
    });
    handle('open-file', async (win, value) => { const error = await shell.openPath(path(win, value)); if (error) throw new Error(error); });
    handle('reveal-file', (win, value) => shell.showItemInFolder(path(win, value)));
  } catch (error) { for (const channel of channels) ipcMain.removeHandler(channel); throw error; }
  return () => { for (const channel of channels) ipcMain.removeHandler(channel); for (const stop of [...watched.values()]) stop(); };
}
