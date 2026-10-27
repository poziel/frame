import { expect, test } from 'bun:test';
import { createTerminal, type TerminalBackend, type TerminalEvent } from '../packages/core/src/modules/terminal/controllers/terminal';

function fixture() {
  const events = new Map<string, (event: TerminalEvent) => void>();
  const closed: string[] = [];
  let count = 0;
  const backend: TerminalBackend = {
    async profiles() { return [{ id: 'pwsh', name: 'PowerShell', path: 'pwsh.exe', default: true }]; },
    async spawn(options, receive) { const id = String(++count); events.set(id, receive); receive({ type: 'data', data: [65] }); return id; },
    async write() {}, async resize() {}, async close(id) { closed.push(id); },
  };
  return { terminal: createTerminal({ backend }), events, closed };
}

test('sessions retain early output and can be split without replacing the first shell', async () => {
  const { terminal } = fixture();
  const first = await terminal.create();
  const output: number[][] = [];
  terminal.subscribe(first.id, event => { if (event.type === 'data') output.push(event.data); });
  expect(output).toEqual([[65]]);
  const second = await terminal.create('pwsh', { split: true });
  expect(terminal.groups.value).toEqual([[first.id, second.id]]);
  expect(terminal.sessions.value).toHaveLength(2);
  await terminal.dispose();
});

test('rename, color, exit, and close preserve neighboring sessions', async () => {
  const { terminal, events, closed } = fixture();
  const first = await terminal.create();
  const second = await terminal.create('pwsh', { split: true });
  terminal.rename(second.id, 'Build');
  terminal.setColor(second.id, '#12abcd');
  expect(terminal.sessions.value[1]).toMatchObject({ name: 'Build', color: '#12abcd' });
  events.get(second.id)!({ type: 'exit', code: 0 });
  expect(terminal.sessions.value[1]?.status).toBe('exited');
  await terminal.close(first.id);
  expect(closed).toEqual([first.id]);
  expect(terminal.groups.value).toEqual([[second.id]]);
  expect(terminal.activeId.value).toBe(second.id);
  await terminal.dispose();
});

test('unknown profile is rejected before spawning', async () => {
  const { terminal } = fixture();
  await expect(terminal.create('missing')).rejects.toThrow('Unknown terminal profile');
  expect(terminal.sessions.value).toHaveLength(0);
  await terminal.dispose();
});

test('failed close retains the session so the user can retry', async () => {
  let fail = true;
  const terminal = createTerminal({ backend: {
    async profiles() { return [{ id: 'cmd', name: 'Command Prompt', path: 'cmd.exe', default: true }]; },
    async spawn() { return 'retry'; }, async write() {}, async resize() {},
    async close() { if (fail) throw new Error('Close failed'); },
  } });
  await terminal.create();
  await expect(terminal.close('retry')).rejects.toThrow('Close failed');
  expect(terminal.sessions.value).toHaveLength(1);
  fail = false;
  await terminal.close('retry');
  expect(terminal.sessions.value).toHaveLength(0);
  await terminal.dispose();
});

test('a host default profile accepts display names and remains independent of detected preference', async () => {
  const requested: string[] = [];
  const terminal = createTerminal({ profile: 'Command Prompt', backend: {
    async profiles() { return [
      { id: 'pwsh', name: 'PowerShell', path: 'pwsh.exe', default: true },
      { id: 'cmd', name: 'Command Prompt', path: 'cmd.exe', default: false },
    ]; },
    async spawn(options) { requested.push(options.profile); return 'default'; },
    async write() {}, async resize() {}, async close() {},
  } });
  await terminal.create();
  expect(requested).toEqual(['cmd']);
  await terminal.dispose();
});

test('disposing during spawn closes the late process', async () => {
  let resolve!: (id: string) => void;
  const closed: string[] = [];
  const backend: TerminalBackend = {
    async profiles() { return [{ id: 'cmd', name: 'Command Prompt', path: 'cmd.exe', default: true }]; },
    spawn() { return new Promise<string>(r => { resolve = r; }); },
    async write() {}, async resize() {}, async close(id) { closed.push(id); },
  };
  const terminal = createTerminal({ backend });
  const creation = terminal.create();
  await new Promise(r => setTimeout(r, 0));
  const disposal = terminal.dispose();
  resolve('late');
  await expect(creation).rejects.toThrow('disposed');
  await disposal;
  expect(closed).toEqual(['late']);
});

 test('terminal creation requires an explicit execution backend', () => {
  // @ts-expect-error Exercise a JavaScript caller without a backend.
  expect(() => createTerminal()).toThrow('TerminalBackend must be supplied');
});
