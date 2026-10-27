import {expect, test} from 'bun:test';
import {isReactive} from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';
import {
  createNotificationHistory,
  NotificationHistoryController,
} from '../packages/core/src/modules/notifications/controllers/notificationHistory';

test('class-backed history callbacks preserve mutable state and monotonic snapshot identities', () => {
  const frame = createFrame();
  const history = createNotificationHistory(frame, {limit: 2});
  expect(history).toBeInstanceOf(NotificationHistoryController);
  expect(isReactive(history.state)).toBe(true);
  const {toggle, setEnabled, setPosition, dismiss, clear, dispose} = history;
  frame.notify({id: 'same-live-id', title: 'First', duration: 0});
  const first = history.state.items[0]!;
  first.expanded = true;
  expect(history.state.items[0]?.expanded).toBe(true);
  clear();
  frame.notifications.dismiss('same-live-id');
  frame.notify({id: 'same-live-id', title: 'Second', duration: 0});
  expect(history.state.items[0]?.historyId).toBeGreaterThan(first.historyId);
  dismiss(first.historyId);
  expect(history.state.items).toHaveLength(1);
  toggle();
  expect(history.state.open).toBe(true);
  setEnabled(false);
  expect(history.state.open).toBe(false);
  toggle();
  expect(history.state.open).toBe(false);
  setEnabled(true);
  setPosition('top-right');
  toggle();
  expect(history.state.open).toBe(true);
  const action = frame.toolbarActions.find(
    (item) => item.id === history.toolbarActionId
  )!;
  dispose();
  dispose();
  action.run();
  setPosition('bottom-left');
  setEnabled(false);
  frame.notify({title: 'After disposal', duration: 0});
  expect(history.state.open).toBe(false);
  expect(history.state.items).toHaveLength(0);
  expect(history.state.indicatorPosition).toBe('top-right');
  expect(history.state.indicatorEnabled).toBe(true);
  expect(frame.notifications.state.items.length).toBeGreaterThan(0);
  frame.dispose();
});

test('shell bindings isolate status collisions, placement callbacks, and registration cleanup', () => {
  const frame = createFrame();
  const removeHostStatus = frame.status.register({
    id: 'notification-history',
    label: 'Host status',
    kind: 'text',
  });
  const first = new NotificationHistoryController(frame, {statusBar: true});
  const second = new NotificationHistoryController(frame, {statusBar: true});
  expect(first.statusItemId).not.toBe('notification-history');
  expect(first.statusItemId).not.toBe(second.statusItemId);
  const firstAction = frame.toolbarActions.find(
    (item) => item.id === first.toolbarActionId
  )!;
  first.dispose();
  firstAction.onPlacementChange?.({area: 'titleBar'});
  expect(first.state.indicatorPosition).toBe('bottom-right');
  expect(
    frame.status.items.value.some((item) => item.id === 'notification-history')
  ).toBe(true);
  expect(
    frame.status.items.value.some((item) => item.id === second.statusItemId)
  ).toBe(true);
  second.setPosition('bottom-left');
  expect(
    frame.status.items.value.find((item) => item.id === second.statusItemId)
      ?.side
  ).toBe('left');
  frame.notify({title: 'Only second history', duration: 0});
  expect(first.state.items).toEqual([]);
  expect(second.state.items).toHaveLength(1);
  second.dispose();
  removeHostStatus();
  frame.dispose();
});
