import {expect, test} from 'bun:test';
import type * as Monaco from 'monaco-editor';
import {isReadonly} from 'vue';
import {createFrame} from '@frame/core';
import {
  EditorController,
  createCodeEditor,
  editorModule,
} from '@frame/core/modules/editor';
import {SettingsEditorRegistration} from '../packages/core/src/modules/editor/integrations/settings/settingsEditorRegistration';

test('class and factory controllers isolate attachments and preserve retained callbacks', async () => {
  const first = createCodeEditor();
  const second = new EditorController();
  expect(first).toBeInstanceOf(EditorController);
  expect(isReadonly(first.instance)).toBe(true);
  const {
    attach,
    focus,
    undo,
    redo,
    find,
    format,
    layout,
    replaceCode,
    runAction,
  } = first;
  expect(focus()).toBe(false);
  expect(undo()).toBe(false);
  expect(redo()).toBe(false);
  expect(find()).toBe(false);
  expect(replaceCode('unmounted')).toBe(false);
  expect(await format()).toBe(false);
  expect(await runAction('missing')).toBe(false);
  expect(layout()).toBeUndefined();
  const calls: string[] = [];
  const widget = {
    focus: () => calls.push('focus'),
    trigger: (_source: string, action: string) => calls.push(action),
    layout: () => calls.push('layout'),
    getModel: () => null,
    getAction: () => null,
  } as unknown as Monaco.editor.IStandaloneCodeEditor;
  const release = attach(widget);
  expect(second.instance.value).toBeUndefined();
  expect(focus()).toBe(true);
  undo();
  redo();
  find();
  layout();
  expect(calls).toEqual(['focus', 'undo', 'redo', 'actions.find', 'layout']);
  expect(replaceCode('no model')).toBe(false);
  release();
  const releaseAgain = attach(widget);
  release();
  expect(first.instance.value).toBe(widget);
  releaseAgain();
  expect(focus()).toBe(false);
});

test('supported action failures propagate without detaching the controller', async () => {
  const editor = new EditorController();
  const failure = new Error('Formatter failed');
  const widget = {
    getAction: (id: string) => ({
      isSupported: () => id !== 'unsupported',
      run: async () => {
        throw failure;
      },
    }),
  } as unknown as Monaco.editor.IStandaloneCodeEditor;
  const release = editor.attach(widget);
  expect(await editor.runAction('unsupported')).toBe(false);
  await expect(editor.format()).rejects.toBe(failure);
  expect(editor.instance.value).toBe(widget);
  release();
});

test('settings registrations reject duplicates and release once', () => {
  const frame = createFrame();
  const baseline = frame.settings.editor.value;
  const registration = new SettingsEditorRegistration(frame);
  const first = frame.settings.editor.value;
  expect(first).toBeDefined();
  expect(frame.keybindings.editor.value).toBeDefined();
  expect(() => new SettingsEditorRegistration(frame)).toThrow(
    'already installed'
  );
  expect(frame.settings.editor.value).toBe(first);
  const {dispose} = registration;
  dispose();
  dispose();
  expect(frame.settings.editor.value).toBe(baseline);
  expect(frame.keybindings.editor.value).toBeUndefined();
  frame.dispose();
});

test('partial settings installation rolls back its first registration', () => {
  let removed = 0;
  const failure = new Error('Keybindings registration failed');
  const frame = {
    settings: {
      registerEditor: () => () => {
        removed++;
      },
    },
    keybindings: {
      registerEditor: () => {
        throw failure;
      },
    },
  } as unknown as Parameters<typeof editorModule.install>[0];
  expect(() => new SettingsEditorRegistration(frame)).toThrow(failure);
  expect(removed).toBe(1);
});

test('installed capabilities return isolated class controllers without mounting', () => {
  const frame = createFrame().use(editorModule);
  const other = createFrame().use(editorModule);
  const editor = frame.editor.create();
  expect(editor).toBeInstanceOf(EditorController);
  expect(editor).not.toBe(frame.editor.create());
  expect(editor).not.toBe(other.editor.create());
  expect(editor.instance.value).toBeUndefined();
  frame.dispose();
  other.dispose();
});
