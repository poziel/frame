import type {FrameHost} from '@frame/core';
import {TauriHost} from './host/tauriHost';
import type {TauriHostOptions} from './host/tauriHost';

export {TauriHost} from './host/tauriHost';
export type {TauriHostOptions} from './host/tauriHost';

/** Creates the native adapter only when explicitly called by the consuming app. */
export function createTauriHost(options: TauriHostOptions = {}): FrameHost {
  return new TauriHost(options);
}
