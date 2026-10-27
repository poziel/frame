import {expect, test} from 'bun:test';
import {
  HostController,
  type HostWindowState,
} from '../packages/core/src/framework/configuration/host';
import {HostWindowController} from '../packages/core/src/framework/configuration/hostWindowController';
import {BrowserHost} from '../packages/core/src/framework/configuration/browserHost';
import {createFrame} from '../packages/core/src/framework/frame';

test('host objects share readonly state and ignore stale initial native reads', async () => {
  let receive!: (state: HostWindowState) => void;
  let finish!: (state: HostWindowState) => void;
  let stopped = 0;
  const host = new HostController({
    window: {
      subscribe(listener) {
        receive = listener;
        return () => {
          stopped++;
        };
      },
      getState() {
        return new Promise((resolve) => {
          finish = resolve;
        });
      },
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(host.window).toBeInstanceOf(HostWindowController);
  expect(host.state).toBe(host.window.state);
  receive({maximized: true, fullscreen: true});
  finish({maximized: false, fullscreen: false});
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(host.state.value).toEqual({maximized: true, fullscreen: true});
  const {dispose} = host;
  dispose();
  dispose();
  receive({maximized: false, fullscreen: false});
  expect(host.state.value.maximized).toBe(true);
  expect(stopped).toBe(1);
});

test('browser document replacement releases listeners and preserves bound operations', async () => {
  const listeners = new Map<object, EventListener>();
  let entries = 0;
  const makeDocument = () => {
    const document = {
      fullscreenEnabled: true,
      fullscreenElement: null,
      documentElement: {
        async requestFullscreen() {
          entries++;
        },
      },
      addEventListener(_name: string, listener: EventListener) {
        listeners.set(document, listener);
      },
      removeEventListener(_name: string, listener: EventListener) {
        expect(listeners.get(document)).toBe(listener);
        listeners.delete(document);
      },
    };
    return document as unknown as Document;
  };
  const first = makeDocument(),
    second = makeDocument();
  const host = new HostController(new BrowserHost());
  const {attach} = host;
  attach(first);
  attach(first);
  expect(listeners.size).toBe(1);
  attach(second);
  expect(listeners.has(first)).toBe(false);
  expect(listeners.has(second)).toBe(true);
  const {supports, toggleFullscreen} = host.window;
  expect(supports('fullscreen')).toBe(true);
  await toggleFullscreen();
  expect(entries).toBe(1);
  host.dispose();
  expect(listeners.size).toBe(0);
  expect(supports('fullscreen')).toBe(false);
  expect(() => attach(first)).toThrow('disposed');
});

test('disposal during fullscreen state read prevents a later native mutation', async () => {
  let reads = 0,
    changes = 0;
  let finish!: (state: HostWindowState) => void;
  const controller = new HostWindowController({
    async getState() {
      if (++reads === 1) return {maximized: false, fullscreen: false};
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
    async setFullscreen() {
      changes++;
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  const operation = controller.toggleFullscreen();
  controller.dispose();
  finish({maximized: false, fullscreen: false});
  await expect(operation).rejects.toThrow('disposed');
  expect(changes).toBe(0);
});

test('modules clean up in reverse order and remove capabilities despite failures', () => {
  const frame = createFrame();
  const order: string[] = [];
  for (const id of ['first', 'second', 'third']) {
    frame.use({
      id,
      key: id,
      install: () => ({
        capability: {},
        dispose() {
          order.push(id);
          if (id === 'second') throw new Error('Cleanup failed');
        },
      }),
    });
  }
  expect(() => frame.dispose()).toThrow();
  expect(order).toEqual(['third', 'second', 'first']);
  for (const id of order) expect(id in frame).toBe(false);
  frame.dispose();
  expect(order).toHaveLength(3);
});
