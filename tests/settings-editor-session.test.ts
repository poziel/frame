import {expect, test} from 'bun:test';
import {Settings} from '../packages/core/src/framework/settings/settings';

test('settings JSON mode isolates drafts, discards on return, and saves only on request', async () => {
  let stored = '{}';
  const settings = new Settings({
    storage: {
      async read() {
        return stored;
      },
      async write(json) {
        stored = json;
      },
    },
  });
  settings.register({
    id: 'app',
    title: 'App',
    settings: [{id: 'size', label: 'Size', type: 'number', default: 14}],
  });
  await settings.load();
  settings.showJSON();
  expect(settings.mode.value).toBe('json');
  expect(settings.json.dirty.value).toBe(false);
  settings.json.draft.value = '{"size":20}';
  expect(settings.json.dirty.value).toBe(true);
  expect(settings.read('size')).toBe(14);
  settings.showForm();
  expect(settings.mode.value).toBe('form');
  expect(settings.read('size')).toBe(14);
  expect(stored).toBe('{}');
  settings.showJSON();
  expect(settings.json.dirty.value).toBe(false);
  settings.json.draft.value = '{"size":22}';
  await settings.json.save();
  expect(settings.read('size')).toBe(22);
  expect(JSON.parse(stored)).toEqual({size: 22});
  expect(settings.json.dirty.value).toBe(false);
  settings.dispose();
});

test('JSON save rejects invalid and stale drafts without silently applying them', async () => {
  const settings = new Settings();
  settings.register({
    id: 'app',
    title: 'App',
    settings: [{id: 'size', label: 'Size', type: 'number', default: 14}],
  });
  settings.showJSON();
  settings.json.draft.value = '{';
  await settings.json.save();
  expect(settings.json.error.value).not.toBe('');
  expect(settings.read('size')).toBe(14);
  settings.json.draft.value = '{"size":20}';
  settings.set('size', 18);
  await settings.json.save();
  expect(settings.json.error.value).toContain('Settings changed');
  expect(settings.read('size')).toBe(18);
  settings.showForm();
  settings.showJSON();
  expect(JSON.parse(settings.json.draft.value)).toEqual({size: 18});
  settings.dispose();
});

test('failed persistence keeps Save available for retry, and settings drafts are isolated', async () => {
  let fail = true,
    saved = '';
  const first = new Settings({
    storage: {
      async read() {
        return '{}';
      },
      async write(json) {
        if (fail) throw new Error('Cannot write');
        saved = json;
      },
    },
  });
  const second = new Settings();
  await first.load();
  first.showJSON();
  first.json.draft.value = '{"plugin.enabled":true}';
  await first.json.save();
  expect(first.json.error.value).toContain('Cannot write');
  expect(first.json.dirty.value).toBe(true);
  expect(second.json.dirty.value).toBe(false);
  expect(second.getOverrides()).toEqual({});
  fail = false;
  await first.json.save();
  expect(first.json.error.value).toBe('');
  expect(first.json.dirty.value).toBe(false);
  expect(JSON.parse(saved)).toEqual({'plugin.enabled': true});
  first.dispose();
  second.dispose();
});
