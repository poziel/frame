import type {FrameHost} from '@frame/core';
import {
  ElectronHost,
  createElectronHost,
  type ElectronHostBridge,
} from '@frame/electron';
import {
  ElectronHostInstallation,
  type ElectronHostOptions,
} from '@frame/electron/main';
import {ElectronPreloadHost} from '@frame/electron/preload';
import {TauriHost, createTauriHost, type TauriHostOptions} from '@frame/tauri';

/** Checks public native declarations without requiring a running native app. */
export function useNativeContracts(
  bridge: ElectronHostBridge,
  options: ElectronHostOptions
): void {
  const renderer: FrameHost = new ElectronHost(bridge);
  const factory: FrameHost = createElectronHost(bridge);
  const nativeOptions: TauriHostOptions = {files: false, external: false};
  const native: FrameHost = new TauriHost(nativeOptions);
  const equivalent: FrameHost = createTauriHost(nativeOptions);
  const installation = new ElectronHostInstallation(options);
  const dispose: () => void = installation.dispose;
  const preload = new ElectronPreloadHost();
  const plainBridge: ElectronHostBridge = preload.bridge;
  void [renderer, factory, native, equivalent, dispose, plainBridge];
}
