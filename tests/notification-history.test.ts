import { test, expect } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
import { createNotificationHistory } from '../packages/core/src/modules/notifications/controllers/notificationHistory';

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

test('notification indicator placement, availability, and pinning are independent and disposed',()=>{
 const first=createFrame(),second=createFrame();
 const history=createNotificationHistory(first);
 const action=first.toolbarActions.find(item=>item.id===history.toolbarActionId)!;
 expect(second.toolbarActions).toHaveLength(0);
 expect(action.showInToolbar?.()).toBe(false);
 history.setPosition('top-right');expect(action.showInToolbar?.()).toBe(true);
 expect(action.visible).toBe(true);
 first.toolbar.setActionVisible(action.id,false);action.run();expect(history.state.open).toBe(true);
 first.notify({title:'Retained',duration:0});
 expect(first.toolbar.setActionEnabled(action.id,false)).toBe(true);
 expect(history.state.indicatorEnabled).toBe(false);expect(history.state.open).toBe(false);
 action.run();expect(history.state.open).toBe(false);
 expect(history.state.items).toHaveLength(1);
 first.toolbar.setActionEnabled(action.id,true);expect(action.feature?.enabled).toBe(true);
 history.setPosition('bottom-left');expect(action.showInToolbar?.()).toBe(false);expect(action.visible).toBe(false);
 history.setPosition('top-right');expect(action.visible).toBe(false);
 const otherHistory=createNotificationHistory(first);expect(otherHistory.toolbarActionId).not.toBe(action.id);
 history.dispose();history.dispose();expect(first.toolbarActions.some(item=>item.id===action.id)).toBe(false);
 history.toggle();history.setPosition('bottom-right');expect(history.state.open).toBe(false);expect(history.state.indicatorPosition).toBe('top-right');
 otherHistory.dispose();first.dispose();second.dispose();
});
