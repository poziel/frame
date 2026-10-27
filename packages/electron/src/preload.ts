import {ElectronPreloadHost} from './preload/electronPreloadHost';

export {ElectronPreloadHost} from './preload/electronPreloadHost';

/** Exposes the fixed context-isolated bridge once from the host preload. */
export function exposeElectronHost(key = 'frameHost'): void {
  new ElectronPreloadHost().expose(key);
}
