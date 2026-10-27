import type {FrameHost} from '@frame/core';
import type {ElectronHostBridge} from './types/electronHostBridge';
import {ElectronHost} from './renderer/electronHost';

export {ElectronHost} from './renderer/electronHost';
export type {ElectronHostBridge} from './types/electronHostBridge';

/** Creates a class-backed renderer adapter without performing IPC. */
export function createElectronHost(bridge: ElectronHostBridge): FrameHost {
  return new ElectronHost(bridge);
}
