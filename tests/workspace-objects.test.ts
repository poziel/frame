import {expect, test} from 'bun:test';
import {computed} from 'vue';
import {Workspace} from '../packages/core/src/framework/workspace/workspace';
import {WorkspaceTabMenu} from '../packages/core/src/framework/workspace/workspaceTabMenu';

test('workspace methods remain bound while pane geometry and tab snapshots stay isolated', () => {
  const first = new Workspace({tabs: {allowMove: true}});
  const second = new Workspace();
  const {split, setPaneMode, registerTab, moveTab, dispose} = first;
  const initial = first.initialPaneId;
  setPaneMode(initial, 'tabs');
  registerTab(initial, {id: 'document', title: 'Document'});
  const before = first.tabs.value[0]!;
  const destination = split('right');
  expect(moveTab('document', destination).ok).toBe(true);
  expect(first.tabs.value[0]?.paneId).toBe(destination);
  expect(before.paneId).toBe(initial);
  expect(Object.isFrozen(before)).toBe(true);
  expect(Object.isFrozen(first.tabs.value)).toBe(true);
  expect(second.panes.value).toHaveLength(1);
  expect(second.tabs.value).toHaveLength(0);
  expect(first.dragMime).not.toBe(second.dragMime);
  dispose();
  expect(first.panes.value).toHaveLength(0);
  expect(first.tabs.value).toHaveLength(0);
  second.dispose();
});

test('retained tab unregister only removes its original registration after updates and ID reuse', () => {
  const workspace = new Workspace();
  const pane = workspace.initialPaneId;
  workspace.setPaneMode(pane, 'tabs');
  const remove = workspace.registerTab(pane, {id: 'same', title: 'First'});
  workspace.updateTab('same', {title: 'Updated'});
  remove();
  const replacement = workspace.registerTab(pane, {
    id: 'same',
    title: 'Replacement',
  });
  remove();
  expect(workspace.tabs.value[0]?.title).toBe('Replacement');
  replacement();
  workspace.dispose();
});

test('reset aborts a pending tab factory and suppresses its late result', async () => {
  let finish!: (value: {id: string; title: string}) => void;
  let signal!: AbortSignal;
  const workspace = new Workspace({
    tabs: {
      allowCreate: true,
      create(context) {
        signal = context.signal;
        return new Promise((resolve) => {
          finish = resolve;
        });
      },
    },
  });
  const request = workspace.requestTab();
  workspace.reset();
  expect(signal.aborted).toBe(true);
  expect(await request).toEqual({ok: false, reason: 'stale'});
  finish({id: 'late', title: 'Late'});
  await Promise.resolve();
  expect(workspace.tabs.value).toHaveLength(0);
  workspace.dispose();
});

test('workspace menus read current immutable snapshots and use shared operation policies', () => {
  const workspace = new Workspace({
    tabs: {allowClose: true, lastTab: 'allow-empty'},
  });
  const pane = workspace.initialPaneId;
  workspace.setPaneMode(pane, 'tabs');
  workspace.registerTab(pane, {id: 'one', title: 'One'});
  const menu = new WorkspaceTabMenu(workspace);
  const {items, select} = menu;
  const pinLabel = computed(
    () => items(pane, 'one').find((item) => item.id === 'tab.pin')?.label
  );
  expect(pinLabel.value).toBe('Pin');
  select(pane, 'one', 'tab.pin');
  expect(pinLabel.value).toBe('Unpin');
  expect(
    items(pane, 'one').find((item) => item.id === 'tab.close')?.disabled
  ).toBe(true);
  workspace.dispose();
});
