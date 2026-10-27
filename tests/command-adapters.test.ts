import {expect, test} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
import {ShellShortcutRouter} from '../packages/core/src/framework/shortcuts/shellShortcutRouter';
import {ContextMenuCommands} from '../packages/core/src/framework/commands/contextMenuCommands';

test('context menu rebinds retained actions and releases removed registrations', async () => {
  const frame = createFrame();
  const calls: string[] = [];
  const menu = new ContextMenuCommands(
    frame,
    'test.menu',
    () => 'shell',
    (item) => {
      calls.push(item.id);
    }
  );
  menu.bind([{id: 'action', label: 'First'}]);
  const command = frame.commands.get('test.menu.action')!;
  menu.bind([{id: 'action', label: 'Second', disabled: true}]);
  await command.run();
  expect(calls).toEqual([]);
  menu.bind([{id: 'action', label: 'Second'}]);
  await command.run();
  expect(calls).toEqual(['action']);
  menu.bind([]);
  expect(frame.commands.get('test.menu.action')).toBeUndefined();
  menu.dispose();
  frame.dispose();
});

test('view-bar built-ins belong to their feature and respect its availability', async () => {
  const frame = createFrame();
  expect(frame.commands.get('frame.primaryViewBar.close')?.feature).toBe(
    'primaryViewBar'
  );
  frame.features.setAvailable('primaryViewBar', false);
  expect(frame.commands.isAvailable('frame.primaryViewBar.close')).toBe(false);
  expect(frame.primaryViewBar.setDisplay('text')).toBe(false);
  frame.dispose();
});

test('shortcut routing shares listeners, isolates host focus, and cleans up owners', () => {
  const originalNode = Object.getOwnPropertyDescriptor(globalThis, 'Node');
  class TestNode {}
  Object.defineProperty(globalThis, 'Node', {
    value: TestNode,
    configurable: true,
  });
  const listeners = new Map<string, EventListener>();
  const body = new TestNode();
  const firstTarget = new TestNode();
  const secondTarget = new TestNode();
  const hostTarget = new TestNode();
  const document = {
    body,
    documentElement: new TestNode(),
    addEventListener(type: string, listener: EventListener) {
      listeners.set(type, listener);
    },
    removeEventListener(type: string, listener: EventListener) {
      expect(listeners.get(type)).toBe(listener);
      listeners.delete(type);
    },
  } as unknown as Document;
  const calls: string[] = [];
  const dispatch = (type: string, target: unknown) =>
    listeners.get(type)?.({target} as Event);
  try {
    const removeFirst = ShellShortcutRouter.register(
      {
        owns: (target) => target === (firstTarget as Node),
        handle: () => {
          calls.push('first');
        },
      },
      document
    );
    const removeSecond = ShellShortcutRouter.register(
      {
        owns: (target) => target === (secondTarget as Node),
        handle: () => {
          calls.push('second');
        },
      },
      document
    );
    expect(listeners.size).toBe(3);
    dispatch('focusin', firstTarget);
    dispatch('keydown', firstTarget);
    dispatch('pointerdown', secondTarget);
    dispatch('keydown', body);
    dispatch('keydown', hostTarget);
    expect(calls).toEqual(['first', 'second']);
    removeSecond();
    dispatch('keydown', body);
    expect(calls).toEqual(['first', 'second', 'first']);
    removeFirst();
    expect(listeners.size).toBe(0);
    const removeReplacement = ShellShortcutRouter.register(
      {owns: () => false, handle: () => {}},
      document
    );
    removeFirst();
    expect(listeners.size).toBe(3);
    removeReplacement();
    expect(listeners.size).toBe(0);
  } finally {
    if (originalNode) Object.defineProperty(globalThis, 'Node', originalNode);
    else Reflect.deleteProperty(globalThis, 'Node');
  }
});
