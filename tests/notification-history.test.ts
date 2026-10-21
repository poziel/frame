import { test, expect } from 'bun:test';
import { createFrame } from '../packages/core/src/frame/createFrame';
import { createNotificationHistory } from '../packages/extras/src/notificationHistory';

test('optional history retains expired notifications and clears independently of core', async () => {
  const frame = createFrame(); const other = createFrame();
  const history = createNotificationHistory(frame);
  frame.notify({ id: 'task', title: 'Completed', duration: 10 });
  await Bun.sleep(30);
  expect(frame.notifications.state.items).toHaveLength(0);
  expect(history.state.items[0]?.title).toBe('Completed');
  frame.notify({ id: 'task', title: 'Another task', duration: 0 });
  expect(history.state.items).toHaveLength(2);
  const old = history.state.items[1]!;
  history.dismiss(old.historyId);
  expect(history.state.items[0]?.title).toBe('Another task');
  history.clear(); expect(frame.notifications.state.items).toHaveLength(1);
  expect(other.notifications.state.items).toHaveLength(0);
  history.dispose(); frame.notify({ title: 'After unsubscribe', duration: 0 });
  expect(history.state.items).toHaveLength(0);
  frame.dispose(); other.dispose();
});

test('notification history is bounded and starts only when explicitly created', () => {
  const frame = createFrame();
  frame.notify({ title: 'Before history', duration: 0 });
  const history = createNotificationHistory(frame, { limit: 2 });
  expect(history.state.items).toHaveLength(0);
  for (const title of ['One','Two','Three']) frame.notify({ title, duration: 0 });
  expect(history.state.items.map(item => item.title)).toEqual(['Three','Two']);
  expect(() => createNotificationHistory(frame, { limit: 0 })).toThrow();
  history.dispose(); frame.dispose();
});
