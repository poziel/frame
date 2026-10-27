import {CommandRegistry} from '../packages/core/src/framework/commands/commandRegistry';
import {FeatureRegistry} from '../packages/core/src/framework/features/featureRegistry';
import {Keybindings} from '../packages/core/src/framework/keybindings/keybindings';
import {expect, test} from 'bun:test';
import {computed, effectScope, nextTick, ref} from 'vue';
import {PreferenceDocument} from '../packages/core/src/framework/preferences/preferenceDocument';
import {PreferencePage} from '../packages/core/src/framework/preferences/preferencePage';

function host() {
  const value = ref('{}');
  return {
    value,
    toJSON() {
      return this.value.value;
    },
    applyJSON(text: string) {
      JSON.parse(text);
      this.value.value = text;
    },
    async load() {},
    async flush() {},
  };
}

test('preference documents track clean host changes and protect dirty drafts', async () => {
  const source = host();
  const caller = effectScope();
  const document = caller.run(
    () => new PreferenceDocument(source, 'Settings')
  )!;
  caller.stop();
  source.value.value = '{"size":18}';
  expect(document.draft.value).toBe(source.value.value);
  document.draft.value = '{"size":20}';
  source.value.value = '{"size":22}';
  expect(document.draft.value).toBe('{"size":20}');
  await document.save();
  expect(document.error.value).toContain('Settings changed');
  expect(source.value.value).toBe('{"size":22}');
  const {reset, save, dispose} = document;
  reset();
  expect(document.dirty.value).toBe(false);
  document.draft.value = '{"size":24}';
  await save();
  expect(source.value.value).toBe('{"size":24}');
  expect(document.dirty.value).toBe(false);
  dispose();
  source.value.value = '{}';
  reset();
  expect(document.draft.value).toBe('{"size":24}');
});

test('disposing a document during hydration prevents application of its pending draft', async () => {
  const source = host();
  let finish!: () => void;
  source.load = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  const document = new PreferenceDocument(source);
  document.draft.value = '{"size":18}';
  const saving = document.save();
  expect(document.saving.value).toBe(true);
  document.dispose();
  finish();
  await saving;
  expect(source.value.value).toBe('{}');
  expect(document.saving.value).toBe(false);
});

test('preference page callbacks remain bound and stale editor cleanup cannot remove a replacement', () => {
  const page = new PreferencePage(host(), 'Settings');
  const {showJSON, showForm, registerEditor, dispose} = page;
  const first = registerEditor({component: {render: () => null}});
  showJSON();
  expect(page.mode.value).toBe('json');
  page.json.draft.value = '{"changed":true}';
  showForm();
  expect(page.json.dirty.value).toBe(false);
  first();
  const second = registerEditor({component: {render: () => null}});
  const editor = page.editor.value;
  first();
  expect(page.editor.value).toBe(editor);
  second();
  dispose();
  expect(() => registerEditor({component: {render: () => null}})).toThrow();
  showJSON();
  expect(page.mode.value).toBe('form');
});

test('keybinding persistence belongs to its instance and preserves detached callbacks', async () => {
  const features = new FeatureRegistry();
  const commands = new CommandRegistry(
    computed(() => []),
    () => () => {},
    features,
    () => {}
  );
  const writes: string[] = [];
  const caller = effectScope();
  const keys = caller.run(
    () =>
      new Keybindings(commands, {
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
  const {load, flush, toJSON, showJSON, dispose} = keys;
  await load();
  await flush();
  caller.stop();
  commands.replaceKeybindings({'app.save': 'Ctrl+S'});
  await flush();
  expect(JSON.parse(toJSON())).toEqual({'app.save': 'Ctrl+S'});
  expect(JSON.parse(writes.at(-1)!)).toEqual({'app.save': 'Ctrl+S'});
  showJSON();
  expect(keys.mode.value).toBe('json');
  dispose();
  const count = writes.length;
  commands.replaceKeybindings({});
  await nextTick();
  expect(writes.length).toBe(count);
  commands.dispose();
  features.dispose();
});
