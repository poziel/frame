import { expect, test } from 'bun:test';
import { createFrame } from '../packages/core/src/frame/createFrame';
import { createNotificationHistory } from '../packages/features/src/notificationHistory';

test('built-in sidebar control moves without replacing its icon, state or command', async () => {
  const frame = createFrame({ toolbar: { primary: true, placements: { primary: { area: 'statusBar', side: 'left', order: -100 } } } });
  frame.layout.primarySidebarVisible = true;
  expect(frame.toolbar.getPlacement('primary')).toEqual({ area: 'statusBar', side: 'left', order: -100 });
  const item = () => frame.status.items.value.find(item => item.id === 'frame.toolbar.primary')!;
  expect(item()).toMatchObject({ kind: 'button', side: 'left', order: -100, visible: true, showInStatusBar: true, expanded: true, icon: 'layout-sidebar-left' });
  frame.status.activate('frame.toolbar.primary');
  expect(frame.layout.primarySidebarVisible).toBe(false);
  expect(item()).toMatchObject({ expanded: false, icon: 'layout-sidebar-left-off' });
  frame.layout.primarySide = 'right';
  expect(item().icon).toBe('layout-sidebar-right-off');
  frame.toolbar.setPlacement('primary', { area: 'titleBar' });
  expect(item().showInStatusBar).toBe(false);
  frame.resetLayout();
  expect(frame.toolbar.getPlacement('primary').area).toBe('statusBar');
  frame.dispose();
});

test('custom actions share placements, command gating, side changes and cleanup', () => {
  const first = createFrame(), second = createFrame(); let calls = 0;
  const remove = first.registerToolbarAction({ id: 'refresh', label: 'Refresh', visible: true, run() { calls++; } });
  expect(first.toolbar.setPlacement('action:refresh', { area: 'statusBar', side: 'right', order: 7 })).toBe(true);
  expect(first.status.items.value.find(item => item.id === 'frame.toolbar.action:refresh')).toMatchObject({ showInStatusBar: true, side: 'right', order: 7 });
  first.status.activate('frame.toolbar.action:refresh'); expect(calls).toBe(1);
  first.status.move('frame.toolbar.action:refresh', 'left');
  expect(first.toolbar.getPlacement('action:refresh')).toMatchObject({ side: 'left' });
  first.toolbar.setPlacement('action:refresh', { area: 'statusBar', side: 'right' });
  expect(first.status.items.value.find(item => item.id === 'frame.toolbar.action:refresh')!.side).toBe('right');
  first.commands.disable('refresh');
  expect(first.status.activate('frame.toolbar.action:refresh')).toBe(false);
  expect(second.status.items.value.some(item => item.id === 'frame.toolbar.action:refresh')).toBe(false);
  remove(); remove();
  expect(first.status.items.value.some(item => item.id === 'frame.toolbar.action:refresh')).toBe(false);
  expect(first.toolbar.setPlacement('action:refresh', { area: 'titleBar' })).toBe(false);
  first.dispose(); second.dispose();
});

test('placement respects availability, visibility, invalid destinations and disposal', () => {
  const frame = createFrame({ features: { primarySidebar: false }, toolbar: { primary: true } });
  frame.toolbar.setPlacement('primary', { area: 'statusBar' });
  expect(frame.status.items.value.find(item => item.id === 'frame.toolbar.primary')!.available).toBe(false);
  expect(frame.toolbar.setPlacement('layoutControls' as any, { area: 'statusBar' })).toBe(false);
  expect(frame.toolbar.setPlacement('primary', { area: 'other' } as any)).toBe(false);
  expect(frame.toolbar.setPlacement('primary', { area: 'statusBar', order: NaN })).toBe(false);
  frame.dispose();
  expect(frame.toolbar.setPlacement('primary', { area: 'titleBar' })).toBe(false);
});

test('configured future actions, visibility gates and stale cleanups retain ownership', () => {
  const frame = createFrame({ toolbar: { placements: { 'action:primary': { area: 'statusBar', side: 'right', order: 4 } } } });
  const remove = frame.registerToolbarAction({ id: 'primary', label: 'Custom primary', visible: true, run() {} });
  const find = () => frame.status.items.value.find(item => item.id === 'frame.toolbar.action:primary')!;
  expect(find()).toMatchObject({ side: 'right', order: 4, showInStatusBar: true });
  frame.status.setVisible(find().id, true);
  frame.toolbar.setActionVisible('primary', false);
  expect(find().showInStatusBar).toBe(false);
  frame.toolbar.setActionVisible('primary', true);
  frame.toolbar.setPlacement('action:primary', { area: 'titleBar' });
  remove();
  const removeNew = frame.registerToolbarAction({ id: 'primary', label: 'New primary', visible: true, run() {} });
  remove();
  expect(find()).toMatchObject({ label: 'New primary', side: 'right', showInStatusBar: true });
  expect(frame.toolbar.getPlacement('primary')).toEqual({ area: 'titleBar' });
  removeNew(); frame.dispose();
});

test('failed status presentation registration rolls back its owned command', () => {
  const frame = createFrame();
  frame.status.register({ id: 'frame.toolbar.action:refresh', label: 'Existing', kind: 'text' });
  expect(() => frame.registerToolbarAction({ id: 'refresh', label: 'Refresh', run() {} })).toThrow();
  expect(frame.commands.get('refresh')).toBeUndefined();
  expect(frame.toolbarActions.length).toBe(0);
  frame.dispose();
});

test('existing feature-owned status indicators stay singular and synchronize placement', () => {
  const frame = createFrame();
  const history = createNotificationHistory(frame, { statusBar: true, indicatorPosition: 'top-right' });
  const key = `action:${history.toolbarActionId}` as const;
  frame.toolbar.setPlacement(key, { area: 'statusBar', side: 'right', order: -100 });
  history.setPosition('bottom-left');
  const shown = frame.status.items.value.filter(item => item.available && item.visible && item.showInStatusBar);
  expect(shown.filter(item => item.id.includes('notification-history')).map(item => item.id)).toEqual([history.statusItemId!]);
  expect(shown.find(item => item.id === history.statusItemId)!.order).toBe(-100);
  expect(frame.toolbar.getPlacement(key)).toMatchObject({ area: 'statusBar', side: 'left' });
  frame.toolbar.setPlacement(key, { area: 'titleBar' });
  expect(history.state.indicatorPosition).toBe('top-right');
  frame.toolbar.setPlacement(key, { area: 'statusBar' });
  expect(history.state.indicatorPosition).toBe('bottom-left');
  frame.resetLayout();
  expect(history.state.indicatorPosition).toBe('top-right');
  history.dispose(); frame.dispose();
});
