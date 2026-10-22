import { Channel, invoke, isTauri } from '@tauri-apps/api/core';
import type { TerminalBackend, TerminalEvent, TerminalProfile } from './terminal';

export function createTauriTerminalBackend(): TerminalBackend {
  if (!isTauri()) throw new Error('Terminal requires a desktop application with the Frame terminal plugin installed.');
  const channels = new Map<string, Channel<TerminalEvent>>();
  return {
    profiles: () => invoke<TerminalProfile[]>('plugin:frame-terminal|profiles'),
    async spawn(options, receive) {
      const output = new Channel<TerminalEvent>(); output.onmessage = receive;
      const id = await invoke<string>('plugin:frame-terminal|spawn', { options, output });
      channels.set(id, output); return id;
    },
    write: (id, data) => invoke('plugin:frame-terminal|write', { id, data }),
    resize: (id, cols, rows) => invoke('plugin:frame-terminal|resize', { id, cols, rows }),
    async close(id) { await invoke('plugin:frame-terminal|close', { id }); channels.delete(id); },
  };
}
