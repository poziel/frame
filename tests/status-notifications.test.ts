import { expect, test } from 'bun:test';
import { createFrame } from '../packages/core/src/frame/createFrame';
import { createNotificationHistory } from '../packages/features/src/notificationHistory';

test('opt-in notification status item shares placement and badges without disposing history when hidden', () => {
  const frame = createFrame();
  const history = createNotificationHistory(frame, { statusBar: true });
  const id = history.statusItemId!;
  const item = () => frame.status.items.value.find(item => item.id === id)!;
  expect(item()).toMatchObject({ side: 'right', kind: 'button', label: 'Notification history' });
  frame.notify({ title: 'Saved', duration: 0 });
  expect(item().badge).toBe(1);
  frame.status.setBadgeVisible(id, false);
  expect(item()).toMatchObject({ badgeVisible: false, icon: 'bell' });
  frame.status.setVisible(id, false);
  expect(history.state.items).toHaveLength(1);
  frame.status.move(id, 'left');
  expect(history.state.indicatorPosition).toBe('bottom-left');
  history.setPosition('bottom-right');
  expect(item().side).toBe('right');
  history.setPosition('top-right');
  expect(item().showInStatusBar).toBe(false);
  frame.status.move(id, 'left');
  expect(history.state.indicatorPosition).toBe('bottom-left');
  expect(item().showInStatusBar).toBe(true);
  history.setEnabled(false);
  expect(item().available).toBe(false);
  expect(frame.status.activate(id)).toBe(false);
  history.setEnabled(true); frame.status.setVisible(id, true); frame.status.activate(id);
  expect(history.state.open).toBe(true);
  history.dispose(); history.dispose();
  expect(frame.status.items.value.some(item => item.id === id)).toBe(false);
  frame.dispose();
});

test('history remains compatible with standalone indicator consumers and independent registrations', () => {
  const frame = createFrame();
  const standalone = createNotificationHistory(frame);
  expect(standalone.statusItemId).toBeUndefined();
  const first = createNotificationHistory(frame, { statusBar: true });
  const second = createNotificationHistory(frame, { statusBar: true });
  expect(first.statusItemId).not.toBe(second.statusItemId);
  first.dispose();
  expect(frame.status.items.value.some(item => item.id === second.statusItemId)).toBe(true);
  frame.dispose(); second.dispose(); standalone.dispose();
});
