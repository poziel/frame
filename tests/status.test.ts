import { expect, test } from 'bun:test';
import { createFrame } from '../packages/core/src/frame/createFrame';

test('status items keep registration, side, visibility and badges isolated', () => {
  const first = createFrame({ status: { hidden: ['branch'], hiddenBadges: ['branch'] } });
  const other = createFrame();
  let calls = 0;
  const remove = first.status.register({ id: 'branch', kind: 'button', label: 'Branch', text: 'main', side: 'right', badge: 2, run: () => { calls++; } });
  expect(first.status.isVisible('branch')).toBe(false);
  expect(first.status.items.value.find(item => item.id === 'branch')?.badgeVisible).toBe(false);
  expect(other.status.items.value.some(item => item.id === 'branch')).toBe(false);
  expect(first.status.setVisible('branch', true)).toBe(true);
  expect(first.status.move('branch', 'left')).toBe(true);
  expect(first.status.setBadgeVisible('branch', true)).toBe(true);
  expect(first.status.update('branch', { text: 'feature', badge: 3 })).toBe(true);
  expect(first.status.items.value.find(item => item.id === 'branch')).toMatchObject({ text: 'feature', side: 'left', badge: 3, visible: true, badgeVisible: true });
  expect(first.status.activate('branch')).toBe(true);
  expect(calls).toBe(1);
  expect(first.status.move('branch', 'center' as 'left')).toBe(false);
  expect(() => first.status.register({ id: 'branch', kind: 'text', label: 'Duplicate' })).toThrow();
  first.status.setVisible('branch', false);
  expect(calls).toBe(1);
  remove(); remove();
  first.status.register({ id: 'branch', kind: 'text', label: 'New registration' });
  remove();
  expect(first.status.items.value.find(item => item.id === 'branch')?.label).toBe('New registration');
  first.dispose(); other.dispose();
  expect(first.status.items.value).toEqual([]);
  expect(first.status.update('branch', { text: 'late' })).toBe(false);
  expect(first.status.move('branch', 'right')).toBe(false);
  expect(() => first.status.register({ id: 'late', kind: 'text', label: 'Late' })).toThrow();
});

test('status messages restore the latest persistent text without stale timers', async () => {
  const frame = createFrame();
  frame.status.set('Saving document');
  expect(frame.state.message).toBe('Saving document');
  frame.status.show('Could not save', { severity: 'error', duration: 20 });
  expect(frame.status.message.value).toEqual({ text: 'Could not save', severity: 'error' });
  frame.status.set('Retrying save');
  await Bun.sleep(40);
  expect(frame.status.message.value.text).toBe('Retrying save');
  const dismissOld = frame.status.show('Old', { duration: 15 });
  frame.status.show('New', { duration: 60 });
  dismissOld(); await Bun.sleep(30);
  expect(frame.state.message).toBe('New');
  await Bun.sleep(50);
  expect(frame.state.message).toBe('Retrying save');
  frame.state.message = 'Compatibility';
  expect(frame.status.message.value.text).toBe('Compatibility');
  frame.status.show('Dispose pending', { duration: 10 });
  frame.dispose(); await Bun.sleep(25);
  expect(frame.status.message.value.text).toBe('');
  frame.status.set('Late');
  expect(frame.status.message.value.text).toBe('');
});

test('status presentation reset and availability preserve installed resources', () => {
  const frame = createFrame({ status: { visible: false } });
  const other = createFrame({ settings: false });
  let available = true;
  frame.status.register({ id: 'save', label: 'Save', kind: 'button', side: 'right', available: () => available, run() {} });
  frame.status.setVisible('save', false); frame.status.move('save', 'left');
  frame.status.setBarVisible(true);
  expect(frame.layout.statusBarVisible).toBe(true);
  frame.resetLayout();
  expect(frame.layout.statusBarVisible).toBe(false);
  expect(frame.status.items.value.find(item => item.id === 'save')).toMatchObject({ side: 'right', visible: true });
  available = false;
  expect(frame.status.activate('save')).toBe(false);
  expect(other.status.activate('frame.manage')).toBe(false);
  frame.dispose(); other.dispose();
});

test('status separators share ownership, menu actions, and anchored placement', () => {
  const frame = createFrame({ status: { allowAddSeparator: true } });
  const other = createFrame();
  frame.status.register({ id: 'resolution', kind: 'text', label: 'Resolution' });
  frame.status.register({ id: 'frames', kind: 'text', label: 'Frames' });
  const remove = frame.status.registerSeparator({ id: 'fixed', before: 'frames' });
  expect(frame.status.removeSeparator('fixed')).toBe(false);
  expect(() => frame.status.register({ id: 'fixed', kind: 'text', label: 'Collision' })).toThrow();
  const id = frame.status.addSeparator('frames')!;
  expect(frame.status.separators.value.find(item => item.id === id)).toMatchObject({ before: 'frames', allowRemove: true });
  expect(frame.status.moveSeparator(id, 'resolution')).toBe(true);
  expect(frame.status.moveSeparator(id, 'missing')).toBe(false);
  expect(frame.status.removeSeparator(id)).toBe(true);
  expect(other.status.separators.value).toEqual([]);
  expect(other.status.addSeparator()).toBeUndefined();
  remove(); remove();
  frame.dispose(); other.dispose();
  expect(frame.status.separators.value).toEqual([]);
  expect(frame.status.addSeparator()).toBeUndefined();
});

test('status movement permission blocks item and separator APIs', () => {
  const frame = createFrame({ status: { allowMove: false, allowAddSeparator: true } });
  frame.status.register({ id: 'frames', label: 'Frames', kind: 'text' });
  frame.status.registerSeparator({ id: 'divider', before: 'frames', allowRemove: true });
  expect(frame.status.move('frames', 'right')).toBe(false);
  expect(frame.status.moveSeparator('divider')).toBe(false);
  expect(frame.status.separators.value[0]?.before).toBe('frames');
  expect(frame.status.addSeparator('frames')).toBeDefined();
  expect(frame.status.removeSeparator('divider')).toBe(true);
  frame.dispose();
});
