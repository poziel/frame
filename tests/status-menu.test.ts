import {expect, test} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
import {StatusMenu} from '../packages/core/src/framework/views/statusMenu';

test('status context menus share item behavior and keep hide bar last', () => {
  const frame = createFrame();
  frame.status.register({
    id: 'branch',
    kind: 'text',
    label: 'Branch',
    badge: 3,
  });
  let items = new StatusMenu(frame).items('branch');
  expect(items.map((item) => item.id)).toEqual([
    'hide-target',
    'badge-target',
    'target-separator',
    'toggle:branch',
    'toggle:frame.manage',
    'position-separator',
    'move-target',
    'bar-separator',
    'hide-bar',
  ]);
  new StatusMenu(frame).select('branch', 'badge-target');
  expect(new StatusMenu(frame).items('branch')[1]?.label).toBe('Show Badge');
  new StatusMenu(frame).select('branch', 'move-target');
  expect(
    frame.status.items.value.find((item) => item.id === 'branch')?.side
  ).toBe('right');
  new StatusMenu(frame).select('branch', 'hide-target');
  expect(frame.status.isVisible('branch')).toBe(false);
  items = new StatusMenu(frame).items();
  expect(items.map((item) => item.id)).toEqual([
    'toggle:branch',
    'toggle:frame.manage',
    'bar-separator',
    'hide-bar',
  ]);
  new StatusMenu(frame).select(undefined, 'toggle:branch');
  expect(frame.status.isVisible('branch')).toBe(true);
  new StatusMenu(frame).select('frame.manage', 'manage-position');
  expect(frame.layout.manageButtonPosition).toBe('top');
  new StatusMenu(frame).select('frame.manage', 'move-target');
  expect(frame.layout.manageButtonPosition).toBe('bottom');
  new StatusMenu(frame).select(undefined, 'hide-bar');
  expect(frame.layout.statusBarVisible).toBe(false);
  frame.dispose();
});

test('status separator menus add, move, and remove through the controller', () => {
  const frame = createFrame({status: {allowAddSeparator: true}});
  frame.status.register({id: 'size', kind: 'text', label: 'Size', order: 0});
  frame.status.register({
    id: 'frames',
    kind: 'text',
    label: 'Frames',
    order: 1,
  });
  new StatusMenu(frame).select('frames', 'add-separator');
  const separator = frame.status.separators.value[0]!;
  expect(separator.before).toBe('frames');
  expect(
    new StatusMenu(frame)
      .items(separator.id)
      .some((item) => item.id === 'delete-separator')
  ).toBe(true);
  new StatusMenu(frame).select(separator.id, 'separator-earlier');
  expect(frame.status.separators.value[0]?.before).toBe('size');
  new StatusMenu(frame).select(separator.id, 'delete-separator');
  expect(frame.status.separators.value).toEqual([]);
  frame.dispose();
});

test('separator addition remains independent of movement permission', () => {
  for (const allowMove of [true, false]) {
    const frame = createFrame({status: {allowMove, allowAddSeparator: true}});
    frame.status.register({id: 'frames', label: 'Frames', kind: 'text'});
    frame.status.registerSeparator({
      id: 'divider',
      before: 'frames',
      allowRemove: true,
    });
    for (const target of ['frames', 'divider']) {
      const items = new StatusMenu(frame).items(target);
      const editEnd = items.findIndex((item) => item.id === 'edit-divider');
      expect(items.some((item) => item.id === 'add-separator')).toBe(true);
      expect(editEnd).toBeGreaterThan(0);
      expect(items[editEnd]?.type).toBe('separator');
      expect(items.some((item) => item.id === 'separator-later')).toBe(
        allowMove && target === 'divider'
      );
    }
    new StatusMenu(frame).select('divider', 'separator-later');
    if (!allowMove) {
      expect(frame.status.addSeparator('frames')).toBeDefined();
      new StatusMenu(frame).select('frames', 'add-separator');
      expect(frame.status.separators.value).toHaveLength(3);
    }
    if (!allowMove)
      expect(frame.status.separators.value[0]?.before).toBe('frames');
    frame.dispose();
  }
});
