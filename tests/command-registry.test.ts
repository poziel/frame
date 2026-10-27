import { test, expect } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';

test('command availability and context enabled state are independent execution gates', async () => {
  const f = createFrame(); let saved = 0, document = false;
  f.commands.register({ id: 'save', feature: 'documents', label: 'Save', enabled: () => document, run: () => { saved++; } });
  f.openQuickInput(); expect(f.quickInputItems.value.find(x => x.id === 'save')?.disabled).toBe(true);
  await f.commands.execute('save'); expect(saved).toBe(0);
  document = true; await f.commands.execute('save'); expect(saved).toBe(1);
  const retained = f.commands.get('save')!;
  f.features.setAvailable('documents', false);
  expect(f.quickInputItems.value.some(x => x.id === 'save')).toBe(false);
  await f.commands.execute('save'); await retained.run(); expect(saved).toBe(1);
  f.commands.setAvailable('save', false); f.features.setAvailable('documents', true);
  expect(f.commands.isAvailable('save')).toBe(false);
  f.commands.setAvailable('save', true); f.commands.disable('save');
  await f.commands.execute('save'); expect(saved).toBe(1);
  f.commands.enable('save'); document = false; await f.commands.execute('save'); expect(saved).toBe(1);
  f.dispose();
});

test('categories default to global, are isolated, and validate prefixes', () => {
  const f = createFrame(), other = createFrame();
  const remove = f.commands.prefixes.register({ prefix: '!', label: 'Artwork' });
  f.commands.register({ id: 'art', label: 'Artwork', quickInput: '!', run() {} });
  f.commands.register({ id: 'global', label: 'Global', run() {} });
  f.commands.register({ id: 'hidden', label: 'Hidden', quickInput: false, run() {} });
  f.openQuickInput(); expect(f.quickInputItems.value.map(x => x.id)).toEqual(['global']);
  f.openQuickInput('!'); expect(f.quickInputItems.value.map(x => x.id)).toEqual(['art']);
  expect(() => f.commands.prefixes.register({ prefix: '>', label: 'Override' })).toThrow();
  expect(() => f.commands.prefixes.register({ prefix: '!', label: 'Duplicate' })).toThrow();
  expect(() => f.commands.prefixes.register({ prefix: 'ab', label: 'Invalid' })).toThrow();
  expect(other.commands.prefixes.get('!')).toBeUndefined();
  remove(); expect(f.quickInputItems.value.some(x => x.id === 'art')).toBe(false);
  f.dispose(); other.dispose();
});

test('unavailable regions cannot be reopened by APIs, commands, layout reset or stale state', async () => {
  const f = createFrame();
  f.registerSecondaryTab({ id: 'details', label: 'Details', component: { render: () => null } });
  f.secondarySidebar.disable(); f.secondaryViewBar.disable(); f.panel.disable(); f.panelViewBar.disable();
  f.secondarySidebar.open('details'); f.openSecondaryPanel('details');
  await f.commands.execute('frame.secondary.toggle'); await f.commands.execute(f.getViewCommand('details')!);
  f.layout.secondarySidebarVisible = true; f.layout.secondaryViewBarVisible = true;
  f.layout.panelVisible = true; f.panelViewBar.setBarVisible(true); f.resetLayout();
  expect(f.layout.secondarySidebarVisible).toBe(false); expect(f.layout.secondaryViewBarVisible).toBe(false);
  expect(f.layout.panelVisible).toBe(false); expect(f.layout.panelViewBarVisible).toBe(false);
  expect(f.commands.isAvailable('frame.secondary.toggle')).toBe(false);
  f.secondarySidebar.enable(); expect(f.layout.secondarySidebarVisible).toBe(false);
  f.secondarySidebar.open('details'); expect(f.layout.secondarySidebarVisible).toBe(true);
  f.dispose(); f.secondarySidebar.open(); expect(f.layout.secondarySidebarVisible).toBe(false);
});

test('unregister cleanup cannot remove a replacement and disposed frames cannot execute', async () => {
  const f = createFrame(); let runs = 0;
  const remove = f.commands.register({ id: 'a', label: 'A', run() { runs++; } });
  const retained = f.commands.get('a')!; f.commands.disable('a'); remove();
  f.commands.register({ id: 'a', label: 'New A', run() { runs += 10; } }); remove();
  await retained.run(); expect(runs).toBe(0);
  await f.commands.execute('a'); expect(runs).toBe(10);
  f.dispose(); await f.commands.execute('a'); expect(runs).toBe(10);
});

test('a retained command cannot invoke a replacement that reuses the same callback', async () => {
  const f = createFrame(); let runs = 0; const run = () => { runs++; };
  const remove = f.commands.register({ id: 'replace', label: 'Original', run });
  const retained = f.commands.get('replace')!; remove();
  f.commands.register({ id: 'replace', label: 'Replacement', run });
  await retained.run(); expect(runs).toBe(0);
  await f.commands.execute('replace'); expect(runs).toBe(1); f.dispose();
});

test('menu presentation distinguishes disabled, hidden and unavailable commands', async () => {
  const f = createFrame(); let runs = 0;
  f.commands.register({ id: 'save', label: 'Save', enabled: false, run() { runs++; } });
  f.commands.register({ id: 'hidden', label: 'Hidden', visible: false, run() { runs++; } });
  const menu = () => f.resolveMenuItems([{ id: 'file', label: 'File', children: [
    { id: 'save', label: 'Save', command: 'save' }, { id: 'hidden', label: 'Hidden', command: 'hidden' },
  ] }]);
  expect(menu()).toEqual([{ id: 'file', label: 'File', disabled: false, children: [{ id: 'save', label: 'Save', command: 'save', disabled: true }] }]);
  f.commands.setAvailable('save', false); expect(menu()).toEqual([]);
  await f.commands.execute('hidden'); expect(runs).toBe(1); f.dispose();
});

test('boolean initial states can be restored while predicate restrictions remain authoritative', async () => {
  const f = createFrame(); let runs = 0;
  f.commands.register({ id: 'optional', label: 'Optional', available: false, enabled: false, visible: false, run() { runs++; } });
  f.commands.setAvailable('optional', true); f.commands.enable('optional'); f.commands.setVisible('optional', true);
  expect(f.commands.isVisible('optional')).toBe(true); await f.commands.execute('optional'); expect(runs).toBe(1);
  f.commands.register({ id: 'context', label: 'Context', available: () => false, enabled: () => false, run() { runs++; } });
  f.commands.setAvailable('context', true); f.commands.enable('context');
  await f.commands.execute('context'); expect(runs).toBe(1); f.dispose();
});

test('view commands follow relocation and unavailable destinations reject moves', async () => {
  const f = createFrame(); f.primarySidebar.register({ id: 'outline', label: 'Outline', component: { render: () => null } });
  const command = f.getViewCommand('outline')!;
  f.secondarySidebar.disable(); expect(f.moveView('outline', 'secondary')).toBe(false);
  f.secondarySidebar.enable(); expect(f.moveView('outline', 'secondary')).toBe(true);
  f.secondarySidebar.disable(); await f.commands.execute(command); expect(f.layout.secondarySidebarVisible).toBe(false);
  expect(f.commands.isAvailable(command)).toBe(false);
  f.secondarySidebar.enable(); await f.commands.execute(command); expect(f.layout.secondarySidebarVisible).toBe(true); f.dispose();
});

test('availability survives history, zen, reset and initially unavailable configuration', () => {
  const f = createFrame({ navigation: true, navigationBar: true, features: { secondarySidebar: false, navigationBar: false, menuBar: false } });
  expect(f.secondarySidebar.available).toBe(false); expect(f.secondaryViewBar.available).toBe(false);
  f.secondaryViewBar.setPosition('default'); f.navigationBar.setVisible(true); f.menuBar.open();
  f.setZenMode(true); f.setZenMode(false); f.resetLayout();
  expect(f.layout.menuBarVisible).toBe(false); expect(f.navigationBar.visible.value).toBe(false);
  f.features.setAvailable('navigationBar', true); expect(f.navigationBar.visible.value).toBe(false);
  f.secondarySidebar.enable(); f.openSecondaryPanel(); f.closeSecondaryPanel(); f.secondarySidebar.disable();
  f.navigation.back(); expect(f.layout.secondarySidebarVisible).toBe(false); f.dispose();
});

test('presentation setters respect individual command restrictions as well as feature availability', () => {
  const f = createFrame();
  f.commands.disable('frame.secondaryViewBar.display.icons');
  expect(f.secondaryViewBar.setDisplay('icons')).toBe(false); expect(f.secondaryViewBar.display.value).toBe('both');
  f.commands.enable('frame.secondaryViewBar.display.icons');
  expect(f.secondaryViewBar.setDisplay('icons')).toBe(true); expect(f.secondaryViewBar.display.value).toBe('icons');
  f.commands.setAvailable('frame.layout.panel.position.left', false);
  expect(f.panel.setPosition('left')).toBe(false); expect(f.panel.position.value).toBe('bottom');
  f.commands.disable('frame.sidebar.open'); f.primarySidebar.open(); expect(f.primarySidebar.visible.value).toBe(false);
  f.dispose();
});

test('registered toolbar and navigation actions execute through command state and clean up', async () => {
  const f = createFrame({ navigationBar: true }); let runs = 0;
  const removeToolbar = f.registerToolbarAction({ id: 'tool', label: 'Tool', visible: true, run() { runs++; } });
  const removeNavigation = f.registerNavigationItem({ id: 'navigate', label: 'Navigate', type: 'action', run() { runs++; } });
  f.commands.disable('tool'); f.toolbarActions[0]!.run(); expect(runs).toBe(0);
  f.commands.enable('tool'); f.toolbarActions[0]!.run(); expect(runs).toBe(1);
  f.commands.setAvailable('navigate', false); await f.navigationBar.activate('navigate'); expect(runs).toBe(1);
  expect(f.navigationBar.getItemState('navigate')?.visible).toBe(false);
  f.commands.setAvailable('navigate', true); f.navigationBar.disable(); await f.navigationBar.activate('navigate'); expect(runs).toBe(1);
  removeToolbar(); removeNavigation(); expect(f.commands.get('tool')).toBeUndefined(); expect(f.commands.get('navigate')).toBeUndefined();
  f.dispose();
});
