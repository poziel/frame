import {expect, test} from 'bun:test';
import {Workspace} from '../packages/core/src/framework/workspace/workspace';
import {WorkspaceTabMenu} from '../packages/core/src/framework/workspace/workspaceTabMenu';

test('bulk menus exclude pinned tabs and leave the last-tab policy to shared operations', async () => {
  const w = new Workspace({tabs: {allowClose: true, lastTab: 'allow-empty'}});
  w.setPaneMode('pane-1', 'tabs');
  for (const id of ['a', 'b', 'c']) w.registerTab('pane-1', {id, title: id});
  w.setTabPinned('a', true);
  new WorkspaceTabMenu(w).select('pane-1', 'b', 'tab.right');
  expect(w.tabs.value.map((t) => t.id)).toEqual(['a', 'b']);
  new WorkspaceTabMenu(w).select('pane-1', 'b', 'tab.all');
  expect(w.tabs.value.map((t) => t.id)).toEqual(['a']);
  const menu = new WorkspaceTabMenu(w).items('pane-1', 'a');
  expect(menu.find((i) => i.id === 'tab.close')).toMatchObject({
    disabled: true,
  });
  expect(menu.find((i) => i.id === 'tab.pin')).toMatchObject({label: 'Unpin'});
});

test('menu splitting creates an empty pane and movement respects permissions', () => {
  const w = new Workspace();
  w.setPaneMode('pane-1', 'tabs');
  w.registerTab('pane-1', {id: 'a', title: 'A'});
  new WorkspaceTabMenu(w).select('pane-1', 'a', 'tab.split.right');
  expect(w.panes.value).toHaveLength(2);
  expect(w.tabs.value[0]!.paneId).toBe('pane-1');
  const destination = w.activePane.value;
  new WorkspaceTabMenu(w).select('pane-1', 'a', `tab.move.${destination}`);
  expect(w.tabs.value[0]!.paneId).toBe('pane-1');
  w.configure({allowPaneCreation: false, tabs: {allowMove: true}});
  new WorkspaceTabMenu(w).select('pane-1', 'a', `tab.move.${destination}`);
  expect(w.tabs.value[0]!.paneId).toBe(destination);
});
