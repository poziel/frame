import {expect, test} from 'bun:test';
import {BarDrag} from '../packages/core/src/framework/layout/barDrag';

test('bar drag callbacks update the controller, commit the target, and clear on cancellation', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const bus = {
    addEventListener(type: string, listener: (event: Event) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: (event: Event) => void) {
      listeners.get(type)?.delete(listener);
    },
  };
  Object.defineProperty(globalThis, 'window', {configurable: true, value: bus});
  const box = {
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
  };
  const list = {
    dataset: {barAxis: 'x'},
    getBoundingClientRect: () => box,
    querySelectorAll: () => [
      {dataset: {barDropBefore: 'second'}, getBoundingClientRect: () => box},
    ],
  } as unknown as HTMLElement;
  const source = {closest: () => null} as unknown as HTMLElement;
  const moves: [string, string | undefined][] = [];
  const focused: string[] = [];
  let starts = 0;
  const drag = new BarDrag({
    list: () => list,
    exists: (id) => id === 'first',
    move: (id, before) => moves.push([id, before]),
    start: () => {
      starts++;
    },
    focus: (id) => focused.push(id),
  });
  const emit = (type: string, x = 50) => {
    const event = new Event(type, {cancelable: true});
    Object.assign(event, {pointerId: 1, clientX: x, clientY: 20});
    for (const listener of [...(listeners.get(type) ?? [])]) listener(event);
  };
  const begin = () =>
    drag.begin(
      {
        button: 0,
        pointerId: 1,
        clientX: 0,
        clientY: 20,
        currentTarget: source,
      } as unknown as PointerEvent,
      'first'
    );
  try {
    begin();
    emit('pointermove');
    expect(drag.state.active).toBe(true);
    expect(drag.state.id).toBe('first');
    expect(drag.state.before).toBe('second');
    expect(drag.state.marker?.kind).toBe('insert');
    emit('pointerup');
    expect(moves).toEqual([['first', 'second']]);
    expect(focused).toEqual(['first']);
    expect(starts).toBe(1);
    expect(drag.state.active).toBe(false);
    begin();
    emit('pointermove');
    drag.cancel();
    emit('pointerup');
    expect(moves).toHaveLength(1);
    expect(drag.state.id).toBe('');
    expect(drag.state.marker).toBeNull();
    expect(drag.state.before).toBeUndefined();
  } finally {
    drag.cancel();
    if (previousWindow)
      Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
