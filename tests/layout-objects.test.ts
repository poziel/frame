import {expect, test} from 'bun:test';
import {computed, reactive} from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';
import {
  Layout,
  defaultLayout,
  layoutGeometry,
  maximizedRegionBounds,
} from '../packages/core/src/framework/layout/layout';
import {DockRegistry} from '../packages/core/src/framework/layout/docks';
import {BarSeparators} from '../packages/core/src/framework/layout/barSeparators';
import {BarDrag} from '../packages/core/src/framework/layout/barDrag';
import {PointerDrag} from '../packages/core/src/framework/layout/pointerDrag';

test('layout instances retain reactive geometry and independent preferred dimensions', () => {
  const layout = reactive(new Layout());
  const other = new Layout();
  layout.primarySidebarVisible = true;
  layout.secondarySidebarVisible = true;
  layout.primaryWidth = 800;
  layout.panelVisible = true;
  layout.maximizedRegion = 'bottom';
  expect(layout.geometry(1200, 800)).toEqual(layoutGeometry(layout, 1200, 800));
  expect(layout.maximizedBounds(1200, 800)).toEqual(
    maximizedRegionBounds(layout, 1200, 800)
  );
  const geometry = computed(() => layout.geometry(1200, 800));
  const previous = geometry.value;
  layout.panelPosition = 'left';
  expect(geometry.value).not.toBe(previous);
  expect(layout.primaryWidth).toBe(800);
  expect(other.primaryWidth).toBe(defaultLayout().primaryWidth);
  const frame = createFrame();
  expect(frame.layout).toBeInstanceOf(Layout);
  expect(frame.docks).toBeInstanceOf(DockRegistry);
  frame.dispose();
});

test('separator callbacks remain bound and composite bar APIs expose no controller storage', () => {
  const separators = new BarSeparators(
    {allowAddSeparator: true},
    (id) => id === 'view'
  );
  const {addSeparator, removeSeparator, disposeSeparators} = separators;
  const id = addSeparator('view')!;
  expect(removeSeparator(id)).toBe(true);
  disposeSeparators();
  expect(addSeparator()).toBeUndefined();
  const frame = createFrame();
  for (const bar of [
    frame.primaryViewBar,
    frame.secondaryViewBar,
    frame.panelViewBar,
    frame.status,
  ]) {
    expect('entries' in bar).toBe(false);
    expect('owners' in bar).toBe(false);
    expect('options' in bar).toBe(false);
    expect(typeof bar.registerSeparator).toBe('function');
  }
  frame.dispose();
});

test('pointer classes replace only gestures owned by the same workbench', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const bus = new EventTarget();
  Object.defineProperty(globalThis, 'window', {configurable: true, value: bus});
  const scope = () =>
    ({classList: {add() {}, remove() {}}}) as unknown as HTMLElement;
  const a = scope(),
    b = scope();
  let first = 0,
    second = 0,
    replacement = 0;
  const event = (pointerId: number) =>
    ({button: 0, pointerId, clientX: 0, clientY: 0}) as PointerEvent;
  try {
    new PointerDrag(event(1), {
      scope: a,
      move() {},
      drop() {},
      end() {
        first++;
      },
    });
    const other = new PointerDrag(event(2), {
      scope: b,
      move() {},
      drop() {},
      end() {
        second++;
      },
    });
    const next = new PointerDrag(event(3), {
      scope: a,
      move() {},
      drop() {},
      end() {
        replacement++;
      },
    });
    expect(first).toBe(1);
    expect(second).toBe(0);
    const cancel = next.cancel;
    cancel();
    cancel();
    expect(replacement).toBe(1);
    other.cancel();
    expect(second).toBe(1);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('bar drag previews and commits an insertion target then clears state', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const bus = new EventTarget();
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
    dataset: {barAxis: 'y'},
    getBoundingClientRect: () => box,
    querySelectorAll: () => [
      {dataset: {barDropBefore: 'next'}, getBoundingClientRect: () => box},
    ],
  } as unknown as HTMLElement;
  const source = {closest: () => undefined} as unknown as HTMLElement;
  const moves: (string | undefined)[][] = [];
  let starts = 0;
  const drag = new BarDrag({
    list: () => list,
    exists: () => true,
    move: (id, before) => moves.push([id, before]),
    start: () => {
      starts++;
    },
  });
  const dispatch = (type: string) => {
    const event = new Event(type, {cancelable: true});
    Object.assign(event, {pointerId: 1, clientX: 50, clientY: 50});
    bus.dispatchEvent(event);
  };
  try {
    drag.begin(
      {
        button: 0,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
        currentTarget: source,
      } as unknown as PointerEvent,
      'first'
    );
    dispatch('pointermove');
    expect(drag.state.active).toBe(true);
    expect(drag.state.before).toBe('next');
    expect(starts).toBe(1);
    dispatch('pointerup');
    expect(moves).toEqual([['first', 'next']]);
    expect(drag.state.active).toBe(false);
    expect(drag.state.marker).toBeNull();
    bus.dispatchEvent(new Event('click', {cancelable: true}));
    drag.cancel();
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('non-primary pointer construction is inert without browser globals', () => {
  let ended = false;
  const session = new PointerDrag({button: 2} as PointerEvent, {
    move() {},
    drop() {},
    end() {
      ended = true;
    },
  });
  session.cancel();
  expect(ended).toBe(false);
});
