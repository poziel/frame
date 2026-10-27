import {BrowserWindow, dialog, ipcMain, shell} from 'electron';
import type {IpcMainInvokeEvent} from 'electron';
import type {HostFileOptions} from '@frame/core';
import type {ElectronHostOptions} from '../types/electronHostOptions';

/**
 * Owns one application's fixed IPC handlers and watched-window subscriptions.
 *
 * The host supplies authorization policy. Every request checks the current main
 * frame; local paths stay denied unless explicitly permitted by the host.
 * Failed installation rolls back registered handlers. Dispose on app teardown.
 */
export class ElectronHostInstallation {

  /** Window listener cleanup callbacks owned by this installation. */
  private readonly watched = new Map<BrowserWindow, () => void>();

  /** Successfully registered channels removed on rollback or disposal. */
  private readonly channels: string[] = [];

  /** Application-owned authorization callbacks evaluated for each request. */
  private readonly options: ElectronHostOptions;

  /** Prevents repeated disposal from removing later installations' handlers. */
  private disposed = false;

  /** Installs handlers once and binds the application teardown callback. */
  constructor(options: ElectronHostOptions) {
    this.options = options;
    this.dispose = this.dispose.bind(this);
    this.install();
  }

  /** Removes owned IPC handlers and watched-window listeners once. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const channel of this.channels) ipcMain.removeHandler(channel);
    for (const stop of [...this.watched.values()]) stop();
  }

  /** Registers only the fixed operations exposed through the preload bridge. */
  private install(): void {
    try {
      this.handle('state', (win) => {
        this.watch(win);
        return this.state(win);
      });
      this.handle('minimize', (win) => win.minimize());
      this.handle('maximize', (win) => {
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
      });
      this.handle('close', (win) => {
        setTimeout(() => {
          if (!win.isDestroyed()) win.close();
        }, 0);
      });
      this.handle('fullscreen', (win, value) => {
        if (typeof value !== 'boolean')
          throw new Error('Expected fullscreen boolean');
        win.setFullScreen(value);
      });
      this.handle('pick', async (win, value) => {
        const input = (value ?? {}) as HostFileOptions;
        if (
          typeof input !== 'object' ||
          input === null ||
          (input.multiple !== undefined &&
            typeof input.multiple !== 'boolean') ||
          (input.accept !== undefined && typeof input.accept !== 'string')
        )
          throw new Error('Invalid file options');
        const extensions = input.accept
          ?.split(',')
          .map((value) => value.trim())
          .filter(Boolean);
        if (extensions?.some((value) => !/^\.[\w-]+$/.test(value)))
          throw new Error(
            'Native file filters require extensions such as .png,.jpg'
          );
        const result = await dialog.showOpenDialog(win, {
          properties: input.multiple
            ? ['openFile', 'multiSelections']
            : ['openFile'],
          filters: extensions?.length
            ? [
                {
                  name: 'Files',
                  extensions: extensions.map((value) => value.slice(1)),
                },
              ]
            : undefined,
        });
        return result.canceled
          ? []
          : result.filePaths.map((path) => ({
              name: path.split(/[\\/]/).pop() ?? path,
              path,
            }));
      });
      this.handle('url', async (_win, value) => {
        if (
          typeof value !== 'string' ||
          !['https:', 'http:', 'mailto:'].includes(new URL(value).protocol)
        )
          throw new Error('Unsupported external URL');
        await shell.openExternal(value);
      });
      this.handle('open-file', async (win, value) => {
        const error = await shell.openPath(this.path(win, value));
        if (error) throw new Error(error);
      });
      this.handle('reveal-file', (win, value) =>
        shell.showItemInFolder(this.path(win, value))
      );
    } catch (error) {
      for (const channel of this.channels) ipcMain.removeHandler(channel);
      throw error;
    }
  }

  /** Reads native maximization and fullscreen state. */
  private state(win: BrowserWindow) {
    return {maximized: win.isMaximized(), fullscreen: win.isFullScreen()};
  }

  /** Requires an authorized owning window and its main frame for every IPC request. */
  private sender(event: IpcMainInvokeEvent) {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (
      !win ||
      event.senderFrame !== event.sender.mainFrame ||
      !this.options.authorize(win, event.senderFrame.url)
    )
      throw new Error('Unauthorized Frame host request');
    return win;
  }

  /** Registers one fixed IPC channel and records its teardown ownership. */
  private handle(
    name: string,
    run: (win: BrowserWindow, value: unknown) => unknown
  ) {
    const channel = 'frame:' + name;
    ipcMain.handle(channel, (event, value) => run(this.sender(event), value));
    this.channels.push(channel);
  }

  /** Observes one window and removes its state listeners when it closes. */
  private watch(win: BrowserWindow) {
    if (this.watched.has(win)) return;
    const changed = () => {
      if (
        !win.isDestroyed() &&
        this.options.authorize(win, win.webContents.getURL())
      )
        win.webContents.send('frame:changed', this.state(win));
    };
    const events = [
      'maximize',
      'unmaximize',
      'enter-full-screen',
      'leave-full-screen',
    ] as const;
    win.on('maximize', changed);
    win.on('unmaximize', changed);
    win.on('enter-full-screen', changed);
    win.on('leave-full-screen', changed);
    const stop = () => {
      for (const event of events)
        (win as import('node:events').EventEmitter).removeListener(
          event,
          changed
        );
      win.removeListener('closed', stop);
      this.watched.delete(win);
    };
    win.once('closed', stop);
    this.watched.set(win, stop);
  }

  /** Enforces the host policy before passing local paths to Electron shell APIs. */
  private path(win: BrowserWindow, value: unknown) {
    if (
      typeof value !== 'string' ||
      !value ||
      !this.options.allowPath?.(win, value)
    )
      throw new Error('Path is not authorized by the host');
    return value;
  }
}
