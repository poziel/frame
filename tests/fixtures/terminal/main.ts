import { createApp, h, ref } from 'vue';
import { createFrame, FrameShell, FrameButton } from '@frame/core';
import { TerminalView, createTerminal, createTerminalView, type TerminalBackend, type TerminalEvent } from '@frame/core/modules/terminal';
import '../../../packages/core/src/style.css';


let count = 0;
const receivers = new Map<string, (event: TerminalEvent) => void>();
const bytes = (text: string) => Array.from(new TextEncoder().encode(text));
const closed: string[] = [];
const inputs: string[] = [];
const sizes: unknown[] = [];
const backend: TerminalBackend = {
  async profiles() { return [{ id: 'pwsh', name: 'PowerShell', path: 'C:\\PowerShell\\pwsh.exe', default: true }, { id: 'cmd', name: 'Command Prompt', path: 'C:\\Windows\\cmd.exe', default: false }]; },
  async spawn(options, receive) {
    const id = String(++count); receivers.set(id, receive);
    receive({ type: 'data', data: bytes(`\x1b[36mFrame terminal ${id}\x1b[0m\r\nReady for commands. https://example.com\r\nPS C:\\workspace> `) });
    return id;
  },
  async write(id, data) { inputs.push(data); receivers.get(id)?.({ type: 'data', data: bytes(data === '\r' ? '\r\nPS C:\\workspace> ' : data) }); },
  async resize(id, cols, rows) { sizes.push({ id, cols, rows }); },
  async close(id) { closed.push(id); receivers.delete(id); },
};
const terminal = createTerminal({ backend });
const frame = createFrame();
const headerTerminal = createTerminal({ backend });
frame.registerView(createTerminalView({ id: 'fixture.terminal', terminal: headerTerminal, frame, autoStart: false }), 'bottom');
const visible = ref(true);
(window as any).terminalFixture = { terminal, closed, inputs, sizes, output(
  id: string,
  text: string
) { receivers.get(id)?.({ type: 'data', data: bytes(text) }); } };
createApp({ setup: () => () => h(FrameShell, { frame }, { default: () => h('main', { style: 'height:100%;display:flex;flex-direction:column;min-height:0' }, [
  h(FrameButton, { onClick: () => { visible.value = !visible.value; } }, () => 'Toggle terminal'),
  h(FrameButton, { onClick: () => { frame.layout.panelHeight = 330; frame.openView('fixture.terminal'); } }, () => 'Open header terminal'),
  h('div', { id: 'terminal-container', style: 'height:420px;flex:none;min-height:0' }, [visible.value ? h(TerminalView, { id: 'fixture-terminal', terminal }) : h('p', 'Terminal hidden')]),
]) }) }).mount('#app');
