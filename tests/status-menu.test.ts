import { expect, test } from 'bun:test';
import { createFrame } from '../packages/core/src/frame/createFrame';
import { statusMenuItems, selectStatusMenuItem } from '../packages/core/src/frame/statusMenu';

test('status context menus share item behavior and keep hide bar last', () => {
  const frame = createFrame();
  frame.status.register({ id: 'branch', kind: 'text', label: 'Branch', badge: 3 });
  let items = statusMenuItems(frame, 'branch');
  expect(items.map(item => item.id)).toEqual(['hide-target', 'badge-target', 'target-separator', 'toggle:branch', 'toggle:frame.manage', 'position-separator', 'move-target', 'bar-separator', 'hide-bar']);
  selectStatusMenuItem(frame, 'branch', 'badge-target');
  expect(statusMenuItems(frame, 'branch')[1]?.label).toBe('Show Badge');
  selectStatusMenuItem(frame, 'branch', 'move-target');
  expect(frame.status.items.value.find(item => item.id === 'branch')?.side).toBe('right');
  selectStatusMenuItem(frame, 'branch', 'hide-target');
  expect(frame.status.isVisible('branch')).toBe(false);
  items = statusMenuItems(frame);
  expect(items.map(item => item.id)).toEqual(['toggle:branch', 'toggle:frame.manage', 'bar-separator', 'hide-bar']);
  selectStatusMenuItem(frame, undefined, 'toggle:branch');
  expect(frame.status.isVisible('branch')).toBe(true);
  selectStatusMenuItem(frame, 'frame.manage', 'manage-position');
  expect(frame.layout.manageButtonPosition).toBe('top');
  selectStatusMenuItem(frame, 'frame.manage', 'move-target');
  expect(frame.layout.manageButtonPosition).toBe('bottom');
  selectStatusMenuItem(frame, undefined, 'hide-bar');
  expect(frame.layout.statusBarVisible).toBe(false);
  frame.dispose();
});

test('status separator menus add, move, and remove through the controller', () => {
  const frame = createFrame({ status: { allowAddSeparator: true } });
  frame.status.register({ id: 'size', kind: 'text', label: 'Size', order: 0 });
  frame.status.register({ id: 'frames', kind: 'text', label: 'Frames', order: 1 });
  selectStatusMenuItem(frame, 'frames', 'add-separator');
  const separator = frame.status.separators.value[0]!;
  expect(separator.before).toBe('frames');
  expect(statusMenuItems(frame, separator.id).some(item => item.id === 'delete-separator')).toBe(true);
  selectStatusMenuItem(frame, separator.id, 'separator-earlier');
  expect(frame.status.separators.value[0]?.before).toBe('size');
  selectStatusMenuItem(frame, separator.id, 'delete-separator');
  expect(frame.status.separators.value).toEqual([]);
  frame.dispose();
});

test('separator edit options are separated from visibility and respect movement permission', () => {
  for (const allowMove of [true, false]) {
    const frame = createFrame({ status: { allowMove, allowAddSeparator: true } });
    frame.status.register({ id: 'frames', label: 'Frames', kind: 'text' });
    frame.status.registerSeparator({ id: 'divider', before: 'frames', allowRemove: true });
    for (const target of ['frames', 'divider']) {
      const items = statusMenuItems(frame, target);
      const editEnd = items.findIndex(item => item.id === 'edit-divider');
      expect(items.some(item => item.id === 'add-separator')).toBe(allowMove);
      if (allowMove || target === 'divider') {
        expect(editEnd).toBeGreaterThan(0);
        expect(items[editEnd]?.type).toBe('separator');
      } else expect(editEnd).toBe(-1);
      expect(items.some(item => item.id === 'separator-later')).toBe(allowMove && target === 'divider');
    }
    selectStatusMenuItem(frame, 'divider', 'separator-later');
    if (!allowMove) {
      expect(frame.status.addSeparator('frames')).toBeUndefined();
      selectStatusMenuItem(frame, 'frames', 'add-separator');
      expect(frame.status.separators.value).toHaveLength(1);
    }
    if (!allowMove) expect(frame.status.separators.value[0]?.before).toBe('frames');
    frame.dispose();
  }
});
