import {expect, mock, test} from 'bun:test';
import {EventEmitter} from 'node:events';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {FrameTailwindSources} from '../packages/tailwind/src/frameTailwindSources.js';

const handlers = new Map<
  string,
  (event: unknown, value?: unknown) => unknown
>();
const ipcEvents = new EventEmitter();
const exposures: {key: string; bridge: Record<string, unknown>}[] = [];
const invocations: unknown[][] = [];
let currentWindow: unknown;
let openedPath = '';
mock.module('electron', () => ({
  BrowserWindow: {fromWebContents: () => currentWindow},
  ipcMain: {
    handle: (
      name: string,
      action: (event: unknown, value?: unknown) => unknown
    ) => {
      if (handlers.has(name)) throw new Error('Handler already registered');
      handlers.set(name, action);
    },
    removeHandler: (name: string) => {
      handlers.delete(name);
    },
  },
  dialog: {
    showOpenDialog: async () => ({
      canceled: false,
      filePaths: ['C:/files/a.txt'],
    }),
  },
  shell: {
    openExternal: async () => {},
    openPath: async (path: string) => {
      openedPath = path;
      return '';
    },
    showItemInFolder: () => {},
  },
  contextBridge: {
    exposeInMainWorld: (key: string, bridge: Record<string, unknown>) =>
      exposures.push({key, bridge}),
  },
  ipcRenderer: Object.assign(ipcEvents, {
    invoke: async (...args: unknown[]) => {
      invocations.push(args);
    },
  }),
}));

let resize: (() => Promise<void>) | undefined;
let stopped = 0;
let nativeCalls = 0;
let selections: string | string[] | null = null;
const nativeWindow = {
  isMaximized: async () => {
    nativeCalls++;
    return false;
  },
  isFullscreen: async () => {
    nativeCalls++;
    return true;
  },
  onResized: async (callback: () => Promise<void>) => {
    resize = callback;
    return () => {
      stopped++;
    };
  },
  minimize: async () => {
    nativeCalls++;
  },
  toggleMaximize: async () => {},
  close: async () => {},
  setFullscreen: async () => {},
  startDragging: async () => {},
};
mock.module('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => nativeWindow,
}));
mock.module('@tauri-apps/plugin-dialog', () => ({
  open: async () => selections,
}));
mock.module('@tauri-apps/plugin-opener', () => ({
  openUrl: async () => {},
  openPath: async () => {},
  revealItemInDir: async () => {},
}));

const {ElectronHostInstallation, installElectronHost} =
  await import('../packages/electron/dist/main.js');
const {ElectronPreloadHost, exposeElectronHost} =
  await import('../packages/electron/dist/preload.js');
const {TauriHost, createTauriHost} =
  await import('../packages/tauri/dist/index.js');

test('built Electron installation preserves authorization, policy validation, observation and teardown ownership', async () => {
  const events = new EventEmitter();
  let authorized = true;
  const sent: unknown[] = [];
  const frame = {url: 'app://trusted'};
  const sender = {mainFrame: frame};
  const win = Object.assign(events, {
    isMaximized: () => false,
    isFullScreen: () => false,
    isDestroyed: () => false,
    webContents: {
      getURL: () => 'app://trusted',
      send: (_channel: string, state: unknown) => sent.push(state),
    },
  });
  currentWindow = win;
  const event = {sender, senderFrame: frame};
  const registration = new ElectronHostInstallation({
    authorize: () => authorized,
  });
  try {
    expect(handlers.get('frame:state')!(event)).toEqual({
      maximized: false,
      fullscreen: false,
    });
    handlers.get('frame:state')!(event);
    expect(win.listenerCount('maximize')).toBe(1);
    events.emit('maximize');
    expect(sent).toHaveLength(1);
    authorized = false;
    events.emit('maximize');
    expect(sent).toHaveLength(1);
    expect(() => handlers.get('frame:state')!(event)).toThrow('Unauthorized');
    authorized = true;
    expect(() =>
      handlers.get('frame:state')!({
        sender,
        senderFrame: {url: 'app://trusted'},
      })
    ).toThrow('Unauthorized');
    await expect(
      handlers.get('frame:url')!(event, 'javascript:alert(1)')
    ).rejects.toThrow('Unsupported');
    expect(() => handlers.get('frame:fullscreen')!(event, 'true')).toThrow(
      'boolean'
    );
    await expect(
      handlers.get('frame:pick')!(event, {accept: 'image/*'})
    ).rejects.toThrow('extensions');
    await expect(
      handlers.get('frame:pick')!(event, {multiple: 'yes'})
    ).rejects.toThrow('Invalid file options');
    expect(await handlers.get('frame:pick')!(event, {accept: '.txt'})).toEqual([
      {name: 'a.txt', path: 'C:/files/a.txt'},
    ]);
    await expect(
      handlers.get('frame:open-file')!(event, 'C:/secret')
    ).rejects.toThrow('not authorized');
    expect(() => installElectronHost({authorize: () => true})).toThrow(
      'already registered'
    );
    expect(handlers.has('frame:state')).toBe(true);
  } finally {
    registration.dispose();
  }
  expect(handlers.size).toBe(0);
  expect(win.listenerCount('maximize')).toBe(0);
  const dispose = installElectronHost({
    authorize: () => true,
    allowPath: (_window, path) => path === 'C:/allowed',
  });
  registration.dispose();
  expect(handlers.has('frame:state')).toBe(true);
  await handlers.get('frame:open-file')!(event, 'C:/allowed');
  expect(openedPath).toBe('C:/allowed');
  dispose();
  dispose();
  expect(handlers.size).toBe(0);
});

test('built preload exposes a fixed plain bridge and subscriptions release independently', async () => {
  const owner = new ElectronPreloadHost();
  const count = exposures.length;
  owner.expose('testBridge');
  expect(exposures.length).toBe(count + 1);
  expect(Object.getPrototypeOf(owner.bridge)).toBe(Object.prototype);
  expect(Object.keys(owner.bridge)).toHaveLength(10);
  expect('invoke' in owner.bridge).toBe(false);
  const states: unknown[] = [];
  const stop = owner.bridge.subscribe((state: unknown) => states.push(state));
  ipcEvents.emit('frame:changed', {}, {maximized: true, fullscreen: false});
  stop();
  ipcEvents.emit('frame:changed', {}, {maximized: false, fullscreen: false});
  expect(states).toHaveLength(1);
  await owner.bridge.setFullscreen(true);
  expect(invocations.at(-1)).toEqual(['frame:fullscreen', true]);
  exposeElectronHost();
  expect(exposures.at(-1)?.key).toBe('frameHost');
});

test('partial Electron installation rolls back only handlers it registered', () => {
  const existing = () => undefined;
  handlers.set('frame:close', existing);
  try {
    expect(() => installElectronHost({authorize: () => true})).toThrow(
      'already registered'
    );
    expect([...handlers.keys()]).toEqual(['frame:close']);
    expect(handlers.get('frame:close')).toBe(existing);
  } finally {
    handlers.clear();
  }
});

test('built Tauri adapters stay lazy and preserve disabled capabilities and filtered picker results', async () => {
  const before = nativeCalls;
  const disabled = createTauriHost({files: false, external: false});
  expect(disabled).toBeInstanceOf(TauriHost);
  expect(nativeCalls).toBe(before);
  expect(disabled.files).toBeUndefined();
  expect(disabled.external).toBeUndefined();
  const host = new TauriHost();
  const {getState, subscribe, pickFiles} = host;
  expect(await getState()).toEqual({maximized: false, fullscreen: true});
  const states: unknown[] = [];
  const stop = await subscribe((state: unknown) => states.push(state));
  await resize!();
  expect(states).toHaveLength(1);
  const pending = resize!();
  stop();
  await pending;
  expect(states).toHaveLength(1);
  expect(stopped).toBe(1);
  selections = ['C:/files/a.txt'];
  expect(await pickFiles({accept: '.txt'})).toEqual([
    {name: 'a.txt', path: 'C:/files/a.txt'},
  ]);
  selections = null;
  expect(await pickFiles()).toEqual([]);
  await expect(pickFiles({accept: 'text/*'})).rejects.toThrow('extensions');
  await expect(host.openUrl('file:///secret')).rejects.toThrow();
});

test('Tailwind source plugin instances isolate roots, retain hooks and target only their stylesheet', () => {
  const first = new FrameTailwindSources();
  const second = new FrameTailwindSources();
  const {configResolved, transform} = first;
  configResolved({root: 'C:\\app one'} as Parameters<typeof configResolved>[0]);
  second.configResolved({root: 'C:/app-two'} as Parameters<
    typeof second.configResolved
  >[0]);
  const sheet = resolve('packages/tailwind/style.css');
  expect(transform('css', sheet + '?direct')?.code).toContain(
    '@source "C:/app one";'
  );
  expect(second.transform('css', sheet)?.code).toContain(
    '@source "C:/app-two";'
  );
  expect(
    transform('css', resolve('packages/tailwind/theme.css'))
  ).toBeUndefined();
  expect(transform('css', '/missing.css')).toBeUndefined();
  const manifest = JSON.parse(
    readFileSync('packages/tailwind/package.json', 'utf8')
  );
  expect(manifest.files).toContain('src');
});
