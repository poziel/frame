import { test, expect } from 'bun:test';
import { createNotifications } from '../packages/core/src/frame/notifications';

test('notifications expire, persistent notifications remain, and events survive expiry', async () => {
  const service = createNotifications();
  const received: string[] = [];
  const unsubscribe = service.subscribe(item => received.push(item.title));
  service.notify({ title: 'Brief', duration: 15 });
  service.notify({ title: 'Persistent', duration: 0 });
  await Bun.sleep(40);
  expect(service.state.items.map(item => item.title)).toEqual(['Persistent']);
  expect(received).toEqual(['Brief', 'Persistent']);
  unsubscribe(); service.notify({ title: 'Unobserved', duration: 0 });
  expect(received).toHaveLength(2);
  service.dispose();
});

test('hover and keyboard focus independently pause notification expiry', async () => {
  const service = createNotifications();
  const handle = service.notify({ title: 'Read this', duration: 20 });
  service.pause(handle.id, 'pointer'); service.pause(handle.id, 'focus');
  await Bun.sleep(35);
  service.resume(handle.id, 'pointer');
  await Bun.sleep(35);
  expect(service.state.items).toHaveLength(1);
  service.resume(handle.id, 'focus');
  await Bun.sleep(40);
  expect(service.state.items).toHaveLength(0);
  service.dispose();
});

test('notification action executes once and closes only its own instance', async () => {
  const service = createNotifications();
  let calls = 0;
  const handle = service.notify({ id: 'save', title: 'Save', duration: 0, action: { label: 'Save now', run: async () => { calls++; await Bun.sleep(10); } } });
  const pending = service.runAction(handle.id);
  await service.runAction(handle.id);
  await pending;
  expect(calls).toBe(1); expect(service.state.items).toHaveLength(0);
  service.notify({ id: 'save', title: 'Replacement', duration: 0 });
  handle.close(); expect(service.state.items).toHaveLength(1);
  service.dispose();
});
test('disposing Frame while an action is pending prevents late notifications', async () => {
  const service = createNotifications();
  const handle = service.notify({ title: 'Pending', duration: 0, action: { label: 'Run', run: async () => { await Bun.sleep(10); throw new Error('Late failure'); } } });
  const pending = service.runAction(handle.id);
  service.dispose();
  await expect(pending).resolves.toBeUndefined();
  expect(service.state.items).toHaveLength(0);
});
