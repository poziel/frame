import { test, expect } from 'bun:test';
import { nextTick, ref } from 'vue';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {createFrame} from '../packages/core/src/framework/frame';
import { settingCommandId } from '../packages/core/src/framework/settings/settingsCommands';
import { matchesShortcut } from '../packages/core/src/framework/shortcuts/shortcuts';
const section = { id: 'editor', title: 'Editor', settings: [
  { id: 'editor.size', label: 'Size', type: 'number' as const, default: 14, min: 8, max: 40 },
  { id: 'editor.enabled', label: 'Enabled', type: 'checkbox' as const, default: true },
] };

test('keyboard shortcut editor uses Ctrl+Shift+comma even on layouts producing a shifted symbol', () => {
  const f = createFrame(); expect(f.commands.get('frame.keybindings')?.shortcut).toBe('Ctrl+Shift+,');
  expect(matchesShortcut({ key: '<', code: 'Comma', ctrlKey: true, metaKey: false, shiftKey: true, altKey: false } as KeyboardEvent, 'Ctrl+Shift+,')).toBe(true); f.dispose();
});

test('JSON file persistence saves only overrides and restores values through host callbacks', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'frame-settings-'));
  const path = join(dir, 'settings.json'); await writeFile(path, '{"editor.size":18}');
  const storage = { read: () => readFile(path, 'utf8'), write: (
    json: string
  ) => writeFile(path, json) };
  const f = createFrame({ settings: { storage } });
  try {
    f.settings.register(section); await f.settings.load();
    expect(f.settings.read('editor.size')).toBe(18); expect(f.settings.isModified('editor.size')).toBe(true);
    f.settings.set('editor.size', 22); await f.settings.flush();
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({ 'editor.size': 22 });
    f.settings.reset('editor.size'); await f.settings.flush();
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({});
  } finally { f.dispose(); await rm(dir, { recursive: true, force: true }); }
});

test('invalid JSON and invalid known values do not change existing settings', () => {
  const f = createFrame(); f.settings.register(section); f.settings.set('editor.size', 20);
  for (const json of ['[]', '{', '{"editor.size":2}', '{"editor.size":22,"editor.enabled":"yes"}']) expect(() => f.settings.applyJSON(json)).toThrow();
  expect(f.settings.read('editor.size')).toBe(20);
  f.settings.applyJSON('{"editor.enabled":false}');
  expect(f.settings.read('editor.size')).toBe(14); expect(f.settings.read('editor.enabled')).toBe(false);
  f.dispose();
});

test('edits and resets made while loading win over late file contents', async () => {
  let finish!: (json: string) => void; let saved = '';
  const f = createFrame({ settings: { storage: { read: () => new Promise<string>(resolve => { finish = resolve; }), async write(
    json
  ) { saved = json; } } } });
  f.settings.register(section); f.settings.reset('editor.size'); f.settings.set('editor.enabled', false);
  finish('{"editor.size":30,"editor.enabled":true}'); await f.settings.flush();
  expect(JSON.parse(saved)).toEqual({ 'editor.enabled': false });
  f.dispose();
});

test('host-owned reactive values autosave and unknown plugin overrides survive registration', async () => {
  let saved = ''; const external = ref(14);
  const f = createFrame({ settings: { storage: { async read() { return '{"plugin.flag":false}'; }, async write(
    json
  ) { saved = json; } } } });
  await f.settings.load();
  f.settings.register({ id: 'host', title: 'Host', settings: [{ id: 'size', label: 'Size', type: 'number', default: 14, getValue: () => external.value, onChange: value => { external.value = Number(value); } }] });
  await nextTick(); external.value = 19; await f.settings.flush();
  expect(JSON.parse(saved)).toEqual({ size: 19, 'plugin.flag': false });
  f.settings.register({ id: 'plugin', title: 'Plugin', settings: [{ id: 'plugin.flag', label: 'Flag', type: 'checkbox', default: true }] });
  expect(f.settings.read('plugin.flag')).toBe(false); f.dispose();
});

test('row actions use commands, copy effective values, reset, and respect availability', async () => {
  const copied: string[] = []; const f = createFrame({ settings: { url: id => `myapp://settings/${id}`, async writeClipboard(
    text
  ) { copied.push(text); } } });
  const remove = f.settings.register(section); f.settings.set('editor.size', 21);
  let hooks = 0; f.commands.hook(() => { hooks++; });
  for (const kind of ['id', 'json', 'url']) await f.commands.execute(settingCommandId('editor.size', kind));
  expect(copied).toEqual(['editor.size', '{\n  "editor.size": 21\n}', 'myapp://settings/editor.size']);
  await f.commands.execute(settingCommandId('editor.size', 'reset')); expect(f.settings.read('editor.size')).toBe(14); expect(hooks).toBe(4);
  f.features.settings = false; await f.commands.execute(settingCommandId('editor.size', 'id')); expect(copied).toHaveLength(3);
  remove(); expect(f.commands.get(settingCommandId('editor.size', 'id'))).toBeUndefined(); f.dispose();
});

test('failed loads never overwrite the file and can be retried', async () => {
  let bad = true, writes = 0;
  const f = createFrame({ settings: { storage: { async read() { return bad ? '{' : '{"editor.size":18}'; }, async write() { writes++; } } } });
  f.settings.register(section); await expect(f.settings.load()).rejects.toThrow();
  f.settings.set('editor.enabled', false); await nextTick(); expect(writes).toBe(0); expect(f.settings.error.value).not.toBe('');
  bad = false; await f.settings.load(); await f.settings.flush(); expect(f.settings.read('editor.size')).toBe(18); expect(writes).toBeGreaterThan(0); f.dispose();
});

test('write failures are visible and an explicit flush can retry after recovery', async () => {
  let fail = true, saved = '';
  const f = createFrame({ settings: { storage: { async read() { return '{}'; }, async write(
    json
  ) { if (fail) throw new Error('Disk unavailable'); saved = json; } } } });
  f.settings.register(section); await f.settings.load(); f.settings.set('editor.size', 20);
  await expect(f.settings.flush()).rejects.toThrow('Disk unavailable'); expect(f.settings.error.value).toBe('Disk unavailable');
  fail = false; await f.settings.flush(); expect(JSON.parse(saved)).toEqual({ 'editor.size': 20 }); expect(f.settings.error.value).toBe(''); f.dispose();
});
