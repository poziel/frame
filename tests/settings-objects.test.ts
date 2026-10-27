import {expect, test} from 'bun:test';
import {effectScope, nextTick, ref} from 'vue';
import {Settings} from '../packages/core/src/framework/settings/settings';
import {Setting} from '../packages/core/src/framework/settings/setting';
import {
  SettingsFileStorage,
  createSettingsFileStorage,
} from '../packages/core/src/framework/settings/settingsFileStorage';

const section = {
  id: 'editor',
  title: 'Editor',
  settings: [
    {
      id: 'editor.size',
      label: 'Size',
      type: 'number' as const,
      default: 14,
      min: 8,
      max: 40,
    },
  ],
};

test('settings own stable item handles and reject retained handles after ID reuse', () => {
  const settings = new Settings();
  const other = new Settings();
  const remove = settings.register(section);
  other.register(section);
  const item = settings.get('editor.size')!;
  expect(item).toBeInstanceOf(Setting);
  expect(settings.get(item.id)).toBe(item);
  expect(item.set(18)).toBe(true);
  expect(settings.read(item.id)).toBe(18);
  expect(item.modified).toBe(true);
  expect(settings.set(item.id, 20)).toBe(true);
  expect(item.value).toBe(20);
  expect(item.set(200)).toBe(false);
  expect(other.read(item.id)).toBe(14);
  remove();
  settings.register(section);
  expect(item.active).toBe(false);
  expect(item.value).toBeUndefined();
  expect(item.set(22)).toBe(false);
  expect(item.reset()).toBe(false);
  expect(settings.get(item.id)).not.toBe(item);
  const replacement = settings.get(item.id)!;
  expect(replacement.reset()).toBe(true);
  settings.dispose();
  expect(replacement.active).toBe(false);
  expect(replacement.set(22)).toBe(false);
  other.dispose();
});

test('settings retain bound callbacks and collect each effective value once per serialization', () => {
  let reads = 0;
  const settings = new Settings();
  settings.register({
    id: 'app',
    title: 'Application',
    settings: [
      {
        id: 'theme',
        label: 'Theme',
        type: 'text',
        default: 'light',
        getValue: () => {
          reads++;
          return 'dark';
        },
      },
    ],
  });
  const {toJSON, read, reset, dispose} = settings;
  reads = 0;
  expect(JSON.parse(toJSON())).toEqual({theme: 'dark'});
  expect(reads).toBe(1);
  expect(read('theme')).toBe('dark');
  expect(reset('missing')).toBe(false);
  dispose();
});

test('settings observers outlive a caller scope and stop on controller disposal', async () => {
  const value = ref(14);
  const writes: string[] = [];
  const scope = effectScope();
  const settings = scope.run(
    () =>
      new Settings({
        storage: {
          async read() {
            return '{}';
          },
          async write(json) {
            writes.push(json);
          },
        },
      })
  )!;
  settings.register({
    id: 'app',
    title: 'Application',
    settings: [
      {
        id: 'size',
        label: 'Size',
        type: 'number',
        default: 14,
        getValue: () => value.value,
        onChange: (next) => {
          value.value = Number(next);
        },
      },
    ],
  });
  await settings.load();
  await settings.flush();
  scope.stop();
  value.value = 18;
  await settings.flush();
  expect(JSON.parse(writes.at(-1)!)).toEqual({size: 18});
  settings.showJSON();
  expect(settings.json.draft.value).toContain('18');
  value.value = 20;
  expect(settings.json.draft.value).toContain('20');
  settings.dispose();
  const count = writes.length;
  value.value = 22;
  await nextTick();
  expect(writes.length).toBe(count);
});

test('file storage is lazy and commits or aborts individual write streams', async () => {
  const calls: string[] = [];
  let fail = false;
  const handle = {
    async getFile() {
      calls.push('read');
      return {
        async text() {
          return '  ';
        },
      };
    },
    async createWritable() {
      calls.push('open');
      return {
        async write(_json: string) {
          calls.push('write');
          if (fail) throw new Error('Disk full');
        },
        async close() {
          calls.push('close');
        },
        async abort() {
          calls.push('abort');
        },
      };
    },
  };
  const storage = new SettingsFileStorage(handle);
  expect(createSettingsFileStorage(handle)).toBeInstanceOf(SettingsFileStorage);
  expect(calls).toEqual([]);
  expect(await storage.read()).toBeUndefined();
  await storage.write('{}');
  expect(calls).toEqual(['read', 'open', 'write', 'close']);
  fail = true;
  await expect(storage.write('{}')).rejects.toThrow('Disk full');
  expect(calls.slice(-3)).toEqual(['open', 'write', 'abort']);
});
