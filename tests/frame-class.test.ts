import {expect, test} from 'bun:test';
import {effectScope, reactive} from 'vue';
import {Frame, createFrame} from '../packages/core/src/framework/frame';

test('Frame is the application owner for both constructor and factory entry points', () => {
  const frame = new Frame();
  const other = createFrame();
  expect(frame).toBeInstanceOf(Frame);
  expect(other).toBeInstanceOf(Frame);
  expect(reactive(frame)).toBe(frame);
  expect(frame.commands).not.toBe(other.commands);
  expect(frame.settings).not.toBe(other.settings);
  expect(frame.host).not.toBe(other.host);
  expect(Object.hasOwn(frame, 'commands')).toBe(true);
  expect(typeof Frame.prototype.registerView).toBe('function');
  const {registerSidePanel, openSidePanel, dispose} = frame;
  registerSidePanel({
    id: 'tools',
    label: 'Tools',
    component: {render: () => null},
  });
  openSidePanel('tools');
  expect(frame.state.activeSidePanel).toBe('tools');
  expect(other.sidePanels.value).toEqual([]);
  dispose();
  dispose();
  other.dispose();
});

test('Frame.use preserves class identity and composes capabilities on the same root', () => {
  const frame = new Frame();
  const order: string[] = [];
  const first = {
    id: 'first',
    key: 'first' as const,
    install: () => ({
      capability: {read: () => 'first'},
      dispose: () => {
        order.push('first');
      },
    }),
  };
  const second = {
    id: 'second',
    key: 'second' as const,
    install: () => ({
      capability: {read: () => 'second'},
      dispose: () => {
        order.push('second');
      },
    }),
  };
  const extended = frame.use(first).use(second);
  expect(extended).toBe(frame);
  expect(extended).toBeInstanceOf(Frame);
  expect(extended.first.read()).toBe('first');
  expect(extended.second.read()).toBe('second');
  expect(frame.use(first)).toBe(frame);
  frame.dispose();
  expect(order).toEqual(['second', 'first']);
  expect('first' in frame).toBe(false);
  expect(() => frame.use(first)).toThrow('disposed');
});

test('Frame observers outlive a caller scope and stop with their owning root', () => {
  const caller = effectScope();
  const frame = caller.run(() => new Frame({navigation: true}))!;
  const pane = frame.workspace.initialPaneId;
  frame.workspace.setPane(pane, {
    component: {render: () => null},
    label: 'One',
  });
  frame.workspace.setPane(pane, {
    component: {render: () => null},
    label: 'Two',
  });
  expect(frame.navigation.canGoBack).toBe(true);
  caller.stop();
  frame.features.navigation = false;
  expect(frame.navigation.canGoBack).toBe(false);
  frame.dispose();
});

test('module cleanup failure still releases class-owned services and subscriptions', () => {
  const frame = new Frame();
  frame.commands.register({id: 'test', label: 'Test', run() {}});
  frame.use({
    id: 'failure',
    key: 'failure',
    install: () => ({
      capability: {},
      dispose() {
        throw new Error('Cleanup failed');
      },
    }),
  });
  expect(() => frame.dispose()).toThrow();
  expect(frame.commands.list()).toEqual([]);
  expect(frame.host.window.supports('close')).toBe(false);
  expect(frame.settings.sections).toEqual([]);
  expect('failure' in frame).toBe(false);
  frame.dispose();
});
