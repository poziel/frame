import {Channel, invoke, isTauri} from '@tauri-apps/api/core';
import type {
  TerminalBackend,
  TerminalEvent,
  TerminalProfile,
} from '@frame/core/modules/terminal';

/**
 * Connects Frame's terminal controller to the optional Rust host bridge.
 * Creating this transport starts no processes. The host registers the plugin
 * and authorizes trusted windows with frame-terminal:default.
 */
export function createTauriTerminalBackend(): TerminalBackend {
  if (!isTauri()) {
    throw new Error('The Frame terminal bridge requires a Tauri host.');
  }
  const channels = new Map<string, Channel<TerminalEvent>>();
  return {
    profiles: () => invoke<TerminalProfile[]>('plugin:frame-terminal|profiles'),
    async spawn(options, receive) {
      const output = new Channel<TerminalEvent>();
      let id: string | undefined;
      let finished = false;
      output.onmessage = (event) => {
        if (event.type === 'exit' || event.type === 'error') {
          finished = true;
          if (id) channels.delete(id);
        }
        receive(event);
      };
      id = await invoke<string>('plugin:frame-terminal|spawn', {
        options,
        output,
      });
      if (!finished) channels.set(id, output);
      return id;
    },
    write: (id, data) => invoke('plugin:frame-terminal|write', {id, data}),
    resize: (id, cols, rows) =>
      invoke('plugin:frame-terminal|resize', {id, cols, rows}),
    async close(id) {
      await invoke('plugin:frame-terminal|close', {id});
      channels.delete(id);
    },
  };
}
