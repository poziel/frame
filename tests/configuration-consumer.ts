import {
  BrowserHost,
  HostController,
  HostWindowController,
  createBrowserHost,
  createFrame,
  type FrameHost,
  type FrameModule,
  type HostWindowAction,
} from '@frame/core';

const adapter: FrameHost = createBrowserHost();
const host = new HostController(adapter);
const window: HostWindowController = host.window;
const action: HostWindowAction = 'fullscreen';
window.supports(action);
// @ts-expect-error Only declared native window actions can be executed.
void window.execute('fullscreen');
// @ts-expect-error Host state is exposed through a readonly projection.
window.state.value.fullscreen = true;
const browser: FrameHost = new BrowserHost();
const frame = createFrame({host: browser});
const descriptor: FrameModule<'sample', {read(): string}> = {
  id: 'sample',
  key: 'sample',
  install: () => ({capability: {read: () => 'ready'}}),
};
const extended = frame.use(descriptor);
const value: string = extended.sample.read();
void value;
frame.dispose();
host.dispose();
