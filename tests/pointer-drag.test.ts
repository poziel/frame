import {expect, test} from 'bun:test';
import {PointerDrag} from '../packages/core/src/framework/layout/pointerDrag';

test('shared pointer sessions threshold, filter pointers, cancel and restore cursor', () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'window'),
    bus = new EventTarget(),
    classes = new Set<string>();
  Object.defineProperty(globalThis, 'window', {configurable: true, value: bus});
  let moves = 0,
    drops = 0,
    ends = 0;
  const pointer = (type: string, x: number, pointerId = 1) => {
    const e = new Event(type, {cancelable: true});
    Object.assign(e, {clientX: x, clientY: 0, pointerId});
    bus.dispatchEvent(e);
  };
  const scope = {
    classList: {
      add: (v: string) => classes.add(v),
      remove: (v: string) => classes.delete(v),
    },
  } as unknown as HTMLElement;
  try {
    const begin = () =>
      new PointerDrag(
        {button: 0, pointerId: 1, clientX: 0, clientY: 0} as PointerEvent,
        {scope, move: () => moves++, drop: () => drops++, end: () => ends++}
      ).cancel;
    const cancel = begin();
    pointer('pointermove', 3);
    expect(moves).toBe(0);
    expect(classes.size).toBe(0);
    pointer('pointermove', 10, 2);
    expect(moves).toBe(0);
    pointer('pointermove', 10);
    expect(moves).toBe(1);
    expect(classes.has('frame-item-dragging')).toBe(true);
    cancel();
    expect(classes.size).toBe(0);
    expect(ends).toBe(1);
    pointer('pointerup', 10);
    expect(drops).toBe(0);
    begin();
    pointer('pointermove', 10);
    pointer('pointerup', 20);
    expect(drops).toBe(1);
    expect(ends).toBe(2);
    expect(classes.size).toBe(0);
    begin();
    pointer('pointermove', 10);
    const escape = new Event('keydown');
    Object.assign(escape, {key: 'Escape'});
    bus.dispatchEvent(escape);
    expect(drops).toBe(1);
    expect(classes.size).toBe(0);
    pointer('pointerup', 10);
    const click = new Event('click', {cancelable: true});
    bus.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
  } finally {
    if (old) Object.defineProperty(globalThis, 'window', old);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
