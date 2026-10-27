import { test, expect } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
import { matchesShortcut, shortcutFromEvent } from '../packages/core/src/framework/shortcuts/shortcuts';
const key = (value: string, modifiers: Partial<KeyboardEvent> = {}) => ({ key: value, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...modifiers }) as KeyboardEvent;

test('duplicate overrides retain both commands and dispatch only an active context', async () => {
  const f = createFrame(), other = createFrame(); let editor = false, calls = 0;
  f.commands.register({ id: 'editor.save', label: 'Save editor', shortcut: 'Ctrl+S', when: () => editor, run() { calls++; } });
  f.commands.register({ id: 'other.save', label: 'Save other', shortcut: 'Ctrl+O', when: () => !editor, run() { calls += 10; } });
  f.commands.setKeybinding('other.save', 'ctrl+s');
  const menuShortcut = () => { const item = f.resolveMenuItems([{ id: 'save', label: 'Save', command: 'other.save', shortcut: 'Ctrl+O' }])[0]; return item?.type !== 'separator' ? item?.shortcut : undefined; };
  expect(menuShortcut()).toBe('Ctrl+S');
  const event = key('s', { ctrlKey: true });
  expect(f.commands.list().filter(c => c.shortcut === 'Ctrl+S')).toHaveLength(2);
  expect(f.commands.resolveShortcut(event)?.id).toBe('other.save');
  editor = true; expect(f.commands.resolveShortcut(event)?.id).toBe('editor.save');
  await f.commands.resolveShortcut(event)?.run(); expect(calls).toBe(1);
  f.commands.disable('editor.save'); expect(f.commands.resolveShortcut(event)).toBeUndefined();
  expect(other.commands.getKeybindings()).toEqual({});
  f.commands.setKeybinding('other.save', null); expect(f.commands.get('other.save')?.shortcut).toBeUndefined();
  expect(menuShortcut()).toBeUndefined();
  f.commands.resetKeybinding('other.save'); expect(f.commands.get('other.save')?.shortcut).toBe('Ctrl+O');
  f.dispose(); expect(f.commands.getKeybindings()).toEqual({}); expect(() => f.commands.setKeybinding('other.save', 'Ctrl+S')).toThrow(); other.dispose();
});

test('capture round trips punctuation, space, localized keys, and modifiers', () => {
  for (const event of [key('+', { ctrlKey: true, shiftKey: true }), key(' ', { altKey: true }), key('é', { ctrlKey: true }), key('ArrowLeft', { metaKey: true })]) {
    const binding = shortcutFromEvent(event)!; expect(matchesShortcut(event, binding)).toBe(true);
  }
  expect(shortcutFromEvent(key('Control', { ctrlKey: true }))).toBeUndefined();
  expect(shortcutFromEvent(key('Dead'))).toBeUndefined();
});

test('displayed shortcut contexts share dispatch gates and describe built-in applicability', () => {
  const f = createFrame();
  f.commands.register({ id: 'app.global', label: 'Global', shortcut: 'Ctrl+G', run() {} });
  expect(f.commands.getShortcutCondition('app.global')).toEqual({ label: 'true', active: true });
  expect(f.commands.getShortcutCondition('frame.panel.toggle').label).toBe('panelAvailable');
  f.features.setAvailable('panel', false);
  expect(f.commands.getShortcutCondition('frame.panel.toggle').active).toBe(false);
  expect(f.commands.resolveShortcut(key('j', { ctrlKey: true }))).toBeUndefined();
  expect(f.commands.getShortcutCondition('frame.workspace.tab.create').label).toContain('workspaceCanCreateTab');
  expect(f.commands.getShortcutCondition('frame.workspace.tab.create').active).toBe(false);
  f.commands.disable('app.global');
  expect(f.commands.getShortcutCondition('app.global').active).toBe(false);
  expect(f.commands.getShortcutCondition('missing')).toEqual({ label: 'false', active: false });
  f.dispose();
});

test('independent subsection registration cleans descendants without damaging reused IDs', () => {
  const f = createFrame();
  const parent = f.settings.register({ id: 'editor', title: 'Editor' });
  const child = f.settings.register({ id: 'font', title: 'Font', settings: [{ id: 'size', label: 'Size', type: 'number', default: 14 }] }, 'editor');
  expect(f.settings.sections[0]?.children?.[0]?.id).toBe('font');
  expect(f.settings.set('size', 20)).toBe(true);
  parent(); expect(f.settings.allSections.value).toEqual([]); expect(f.settings.set('size', 12)).toBe(false);
  f.settings.register({ id: 'font', title: 'New font', settings: [{ id: 'size', label: 'Size', type: 'number', default: 18 }] });
  child(); expect(f.settings.values.size).toBe(20); // User overrides survive unloading a contribution.
  expect(() => f.settings.register({ id: 'missing', title: 'Missing' }, 'unknown')).toThrow();
  f.dispose(); expect(() => f.settings.register({ id: 'disposed', title: 'Disposed' })).toThrow();
});

test('shortcut presentation is per instance and respects feature availability', async () => {
  const f = createFrame({ features: { keybindings: false } }), other = createFrame();
  f.openKeybindings(); await f.commands.execute('frame.keybindings'); expect(f.keybindingsRequest.value).toBe(0);
  other.openKeybindings(); expect(other.keybindingsRequest.value).toBe(1);
  f.features.setAvailable('keybindings', true); await f.commands.execute('frame.keybindings'); expect(f.keybindingsRequest.value).toBe(1);
  f.dispose(); other.dispose();
});
