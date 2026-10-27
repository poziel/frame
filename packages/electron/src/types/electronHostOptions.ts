import type {BrowserWindow} from 'electron';

/** Application policy checked for every main-process request. */
export interface ElectronHostOptions {

  /** Explicitly authorize each application window and its current main-frame URL. */
  authorize(window: BrowserWindow, url: string): boolean;

  /** Host policy for opening/revealing local paths. Denied by default. */
  allowPath?(window: BrowserWindow, path: string): boolean;
}
