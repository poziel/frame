import { expect, test } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
import { assertExternalUrl, createBrowserHost, type HostWindowState, type HostWindow } from '../packages/core/src/framework/configuration/host';
import { createElectronHost } from '../packages/electron/src/index';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function fixture() {
  let state: HostWindowState = { maximized: false, fullscreen: false };
  let listener: ((state: HostWindowState) => void) | undefined;
  let stopped = 0;
  const window: HostWindow = {
    async getState() { return state; },
    subscribe(receive) { listener = receive; return () => { stopped++; listener = undefined; }; },
    async toggleMaximize() { state = { ...state, maximized: !state.maximized }; listener?.(state); },
    async setFullscreen(fullscreen) { state = { ...state, fullscreen }; listener?.(state); },
  };
  return { window, stopped: () => stopped };
}
test('partial host capabilities, direct API calls and state remain isolated per Frame', async () => {
  const a = fixture(), b = fixture();
  const first = createFrame({ host: { window: a.window } });
  const second = createFrame({ host: { window: b.window } });
  await tick();
  expect(first.host.window.supports('minimize')).toBe(false);
  expect(first.host.window.supports('maximize')).toBe(true);
  await expect(first.host.window.execute('minimize')).rejects.toThrow('does not support');
  await first.host.window.execute('maximize');
  await first.host.window.toggleFullscreen();
  expect(first.host.state.value).toEqual({ maximized: true, fullscreen: true });
  expect(second.host.state.value).toEqual({ maximized: false, fullscreen: false });
  first.dispose(); first.dispose();
  expect(a.stopped()).toBe(1); expect(b.stopped()).toBe(0);
  await expect(first.host.window.execute('maximize')).rejects.toThrow('disposed');
  second.dispose();
});
test('subscription resolved after disposal is released exactly once', async () => {
  let finish!: (stop: () => void) => void;
  let stopped = 0;
  const frame = createFrame({ host: { window: { async getState() { return { maximized: false, fullscreen: false }; }, subscribe() { return new Promise(resolve => { finish = resolve; }); } } } });
  await tick(); frame.dispose(); finish(() => { stopped++; }); await tick();
  expect(stopped).toBe(1);
});
test('browser defaults do not require native APIs or a DOM at creation', async () => {
  const frame = createFrame();
  expect(frame.host.window.supports('close')).toBe(false);
  expect(frame.host.window.supports('fullscreen')).toBe(false);
  await expect(createBrowserHost().files!.pick()).rejects.toThrow('browser document');
  frame.dispose();
});
test('external opening allows ordinary links and rejects executable schemes', () => {
  for (const url of ['https://example.com', 'http://localhost', 'mailto:hello@example.com']) expect(() => assertExternalUrl(url)).not.toThrow();
  for (const url of ['javascript:alert(1)', 'file:///C:/secret', 'data:text/html,hi']) expect(() => assertExternalUrl(url)).toThrow();
});
test('Electron renderer adapter delegates file and window operations through the bridge', async () => {
  let minimized = 0;
  const selected = [{ name: 'a.txt', path: '/a.txt' }];
  const host = createElectronHost({
    async getState() { return { maximized: false, fullscreen: false }; }, subscribe() { return () => {}; },
    async minimize() { minimized++; }, async toggleMaximize() {}, async close() {}, async setFullscreen() {},
    async pickFiles() { return selected; }, async openUrl() {}, async openFile() {}, async revealFile() {},
  });
  await host.window!.minimize!(); expect(minimized).toBe(1);
  expect(await host.files!.pick()).toEqual(selected);
  expect(host.window!.dragRegion).toBe('css');
});
