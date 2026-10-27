import {expect, test} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';

test('settings and shortcuts share a page model with isolated search and draft state', () => {
  const f = createFrame();
  expect(f.settings.page.constructor).toBe(f.keybindings.page.constructor);
  f.settings.search.value = 'canvas';
  f.keybindings.search.value = 'save';
  expect(f.settings.search.value).toBe('canvas');
  expect(f.keybindings.search.value).toBe('save');
  f.keybindings.showJSON();
  f.keybindings.json.draft.value = '{"app.save":"Ctrl+L"}';
  expect(f.settings.mode.value).toBe('form');
  expect(f.settings.json.dirty.value).toBe(false);
  f.keybindings.showForm();
  expect(f.keybindings.json.dirty.value).toBe(false);
  f.dispose();
});
test('both preference pages can use an empty workspace but cannot replace owned plain content', () => {
  const f = createFrame();
  expect(f.workspace.tabs.value).toHaveLength(0);
  expect(f.canOpenSettingsInTab.value).toBe(true);
  expect(f.canOpenKeybindingsInTab.value).toBe(true);
  expect(f.openSettingsInTab()).toBe(true);
  expect(f.openKeybindingsInTab()).toBe(true);
  const remove = f.workspace.registerPaneContent(f.workspace.initialPaneId);
  expect(f.canOpenSettingsInTab.value).toBe(false);
  expect(f.canOpenKeybindingsInTab.value).toBe(false);
  remove();
  expect(f.canOpenSettingsInTab.value).toBe(true);
  f.features.setAvailable('workspace', false);
  expect(f.openKeybindingsInTab()).toBe(false);
  f.dispose();
});
test('keybindings file loads, preserves later command IDs, saves null removals and resets', async () => {
  let disk = '{"app.save":"Ctrl+L","future.action":null}';
  const f = createFrame({
    keybindings: {
      storage: {
        async read() {
          return disk;
        },
        async write(json) {
          disk = json;
        },
      },
    },
  });
  f.commands.register({
    id: 'app.save',
    label: 'Save',
    shortcut: 'Ctrl+S',
    run() {},
  });
  await f.keybindings.load();
  await f.keybindings.flush();
  expect(f.commands.get('app.save')?.shortcut).toBe('Ctrl+L');
  f.commands.register({
    id: 'future.action',
    label: 'Later',
    shortcut: 'Ctrl+F',
    run() {},
  });
  expect(f.commands.get('future.action')?.shortcut).toBeUndefined();
  f.commands.setKeybinding('app.save', null);
  await f.keybindings.flush();
  expect(JSON.parse(disk)['app.save']).toBeNull();
  f.commands.resetKeybinding('app.save');
  await f.keybindings.flush();
  expect(JSON.parse(disk)['app.save']).toBeUndefined();
  expect(f.commands.get('app.save')?.shortcut).toBe('Ctrl+S');
  f.dispose();
});
test('keybinding JSON validation is atomic and draft changes require Save', async () => {
  let disk = '{}';
  const f = createFrame({
    keybindings: {
      storage: {
        async read() {
          return disk;
        },
        async write(json) {
          disk = json;
        },
      },
    },
  });
  f.commands.register({
    id: 'app.save',
    label: 'Save',
    shortcut: 'Ctrl+S',
    run() {},
  });
  await f.keybindings.load();
  f.keybindings.showJSON();
  f.keybindings.json.draft.value = '{"app.save":"Ctrl+L"}';
  expect(f.commands.get('app.save')?.shortcut).toBe('Ctrl+S');
  await f.keybindings.json.save();
  expect(f.commands.get('app.save')?.shortcut).toBe('Ctrl+L');
  expect(JSON.parse(disk)).toEqual({'app.save': 'Ctrl+L'});
  expect(() =>
    f.keybindings.applyJSON('{"app.save":"Ctrl+X","other":false}')
  ).toThrow();
  expect(f.commands.get('app.save')?.shortcut).toBe('Ctrl+L');
  f.keybindings.showForm();
  f.keybindings.showJSON();
  f.keybindings.json.draft.value = '{}';
  f.commands.setKeybinding('app.save', 'Ctrl+K');
  await f.keybindings.json.save();
  expect(f.keybindings.json.error.value).toContain('changed');
  f.dispose();
});
test('invalid keybinding files are not overwritten and writes can be retried', async () => {
  let disk = '{"app.save":false}',
    writes = 0;
  const f = createFrame({
    keybindings: {
      storage: {
        async read() {
          return disk;
        },
        async write(json) {
          writes++;
          disk = json;
        },
      },
    },
  });
  await expect(f.keybindings.load()).rejects.toThrow();
  expect(writes).toBe(0);
  expect(disk).toContain('false');
  f.dispose();
  let fail = true;
  const other = createFrame({
    keybindings: {
      storage: {
        async read() {
          return '{}';
        },
        async write() {
          if (fail) throw Error('disk full');
        },
      },
    },
  });
  await other.keybindings.load();
  other.keybindings.applyJSON('{"later":"Ctrl+L"}');
  await expect(other.keybindings.flush()).rejects.toThrow('disk full');
  fail = false;
  await other.keybindings.flush();
  expect(other.keybindings.error.value).toBe('');
  other.dispose();
});

test('hidden persisted values round trip while contextual controls stay out of JSON', async () => {
  const f = createFrame();
  f.settings.register({
    id: 'app',
    title: 'App',
    settings: [
      {
        id: 'model.codex',
        label: 'Codex model',
        type: 'text',
        default: '',
        visible: false,
      },
      {
        id: 'current.reference',
        label: 'Reference',
        type: 'text',
        default: '',
        persist: false,
      },
    ],
  });
  f.settings.set('model.codex', 'first');
  f.settings.set('current.reference', 'artwork');
  expect(JSON.parse(f.settings.toJSON())).toEqual({'model.codex': 'first'});
  f.settings.applyJSON(
    '{"model.codex":"second","current.reference":"ignored"}'
  );
  expect(f.settings.read('model.codex')).toBe('second');
  expect(f.settings.read('current.reference')).toBe('artwork');
  f.settings.applyJSON('{}');
  expect(f.settings.read('model.codex')).toBe('');
  expect(f.settings.read('current.reference')).toBe('artwork');
  f.dispose();
});

test('an explicit keybindings JSON reset wins over a pending file read', async () => {
  let resolve!: (json: string) => void;
  const f = createFrame({
    keybindings: {
      storage: {
        read: () =>
          new Promise<string>((done) => {
            resolve = done;
          }),
        async write() {},
      },
    },
  });
  f.keybindings.applyJSON('{}');
  resolve('{"app.save":"Ctrl+L"}');
  await f.keybindings.load();
  expect(f.commands.getKeybindings()).toEqual({});
  f.dispose();
});
