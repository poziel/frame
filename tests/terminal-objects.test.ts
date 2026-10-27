import {expect, test} from 'bun:test';
import {isReadonly} from 'vue';
import {
  createTerminal,
  TerminalSessionController,
} from '../packages/core/src/modules/terminal/controllers/terminal';
import type {
  TerminalBackend,
  TerminalEvent,
} from '../packages/core/src/modules/terminal/types/terminalTypes';

test('class-backed terminal callbacks stay bound and gate writes after exit', async () => {
  let profileReads = 0;
  let receive!: (event: TerminalEvent) => void;
  const writes: string[] = [],
    sizes: number[][] = [],
    closed: string[] = [],
    links: string[] = [];
  const backend: TerminalBackend = {
    async profiles() {
      profileReads++;
      return [{id: 'shell', name: 'Shell', path: 'shell.exe', default: true}];
    },
    async spawn(_options, listener) {
      receive = listener;
      listener({type: 'data', data: [65]});
      return 'first';
    },
    async write(_id, data) {
      writes.push(data);
    },
    async resize(_id, cols, rows) {
      sizes.push([cols, rows]);
    },
    async close(id) {
      closed.push(id);
    },
  };
  const terminal = createTerminal({
    backend,
    openUrl: async (url) => {
      links.push(url);
    },
  });
  expect(terminal).toBeInstanceOf(TerminalSessionController);
  expect(profileReads).toBe(0);
  expect(isReadonly(terminal.sessions)).toBe(true);
  const {
    create,
    subscribe,
    rename,
    setColor,
    write,
    resize,
    reportError,
    dismissError,
    openUrl,
    close,
    dispose,
  } = terminal;
  const session = await create();
  const events: TerminalEvent[] = [];
  const unsubscribe = subscribe(session.id, (event) => events.push(event));
  expect(events).toEqual([{type: 'data', data: [65]}]);
  rename(session.id, ' Build ');
  setColor(session.id, '#123abc');
  expect(terminal.sessions.value[0]).toMatchObject({
    name: 'Build',
    color: '#123abc',
  });
  await write(session.id, 'input');
  await resize(session.id, 120, 40);
  receive({type: 'exit', code: 0});
  await write(session.id, 'ignored');
  await resize(session.id, 80, 24);
  expect(writes).toEqual(['input']);
  expect(sizes).toEqual([[120, 40]]);
  reportError(new Error('Failure'));
  expect(terminal.error.value).toBe('Failure');
  dismissError();
  expect(terminal.error.value).toBe('');
  await openUrl('https://example.com');
  await expect(openUrl('file:///private')).rejects.toThrow(
    'Unsupported terminal link'
  );
  expect(links).toEqual(['https://example.com']);
  await close(session.id);
  expect(events.at(-1)).toEqual({type: 'closed'});
  unsubscribe();
  unsubscribe();
  expect(closed).toEqual([session.id]);
  await dispose();
});

test('profile discovery retries and separate controllers isolate replay and subscriptions', async () => {
  let reads = 0;
  const backend: TerminalBackend = {
    async profiles() {
      if (++reads === 1) throw new Error('Offline');
      return [{id: 'shell', name: 'Shell', path: 'shell.exe', default: true}];
    },
    async spawn(_options, receive) {
      receive({type: 'data', data: [66]});
      return 'same-id';
    },
    async write() {},
    async resize() {},
    async close() {},
  };
  const first = new TerminalSessionController({backend});
  const other = new TerminalSessionController({backend});
  await expect(first.detectProfiles()).rejects.toThrow('Offline');
  await Promise.all([first.detectProfiles(), first.detectProfiles()]);
  expect(reads).toBe(2);
  const session = await first.create();
  expect(other.sessions.value).toEqual([]);
  const replay: TerminalEvent[] = [],
    subsequent: TerminalEvent[] = [];
  const remove = first.subscribe(session.id, (event) => replay.push(event));
  first.subscribe(session.id, (event) => subsequent.push(event));
  expect(replay).toEqual([{type: 'data', data: [66]}]);
  expect(subsequent).toEqual([]);
  remove();
  first.clear(session.id);
  expect(replay).toHaveLength(1);
  expect(subsequent).toEqual([{type: 'clear'}]);
  await Promise.all([first.dispose(), other.dispose()]);
});
