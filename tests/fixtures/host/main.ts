import { createApp, h } from 'vue';
import { createFrame, createBrowserHost, FrameShell, FrameButton, type HostWindowState } from '@frame/core';
let state: HostWindowState = { maximized: false, fullscreen: false };
let receive: ((state: HostWindowState) => void) | undefined;
let stopped = 0;
const frame = createFrame({ host: { ...createBrowserHost(), window: {
  async getState() { return state; },
  subscribe(listener) { receive = listener; return () => { receive = undefined; stopped++; }; },
  async toggleMaximize() { state = { ...state, maximized: !state.maximized }; receive?.(state); },
} } });
const browser = createFrame();
let files: unknown;
createApp({ render: () => h(FrameShell, { frame: location.search === '?browser' ? browser : frame, titleText: 'Host contract fixture' }, { default: () => h('main', [
  h(FrameButton, { label: 'Pick files', onClick: async () => { files = await frame.host.files!.pick({ multiple: true, accept: '.txt' }); } }),
]) }) }).mount('#app');
Object.assign(window, { hostFixture: { frame, browser, files: () => files, stopped: () => stopped } });
