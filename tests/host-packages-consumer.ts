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
import {createTauriTerminalBackend} from '@frame/tauri/terminal';
import {TauriAgentConnection} from '@frame/tauri/agents';
import type {AgentConnection} from '@frame/core/modules/chat';
import type {TerminalBackend} from '@frame/core/modules/terminal';

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
  const terminalFactory: () => TerminalBackend = createTauriTerminalBackend;
  const agent: AgentConnection = new TauriAgentConnection(
    'host-created-runtime'
  );
  const installation = new ElectronHostInstallation(options);
  const dispose: () => void = installation.dispose;
  const preload = new ElectronPreloadHost();
  const plainBridge: ElectronHostBridge = preload.bridge;
  void [
    renderer,
    factory,
    native,
    equivalent,
    terminalFactory,
    agent,
    dispose,
    plainBridge,
  ];
}
