import {ElectronHostInstallation} from './main/electronHostInstallation';
import type {ElectronHostOptions} from './types/electronHostOptions';

export {ElectronHostInstallation} from './main/electronHostInstallation';
export type {ElectronHostOptions} from './types/electronHostOptions';

/** Installs once per application and returns its bound teardown callback. */
export function installElectronHost(options: ElectronHostOptions): () => void {
  return new ElectronHostInstallation(options).dispose;
}
