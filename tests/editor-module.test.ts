import { expect, test } from 'bun:test';
import { createFrame } from '@frame/core';
import { editorModule, CodeEditor } from '@frame/core/modules/editor';

test('registering the editor automatically enables settings JSON without opening a surface', async () => {
  const frame = createFrame().use(editorModule), other = createFrame();
  expect(frame.editor.create().instance.value).toBeUndefined();
  expect(CodeEditor).toBeDefined(); expect(frame.settings.editor.value).toBeDefined();
  expect(frame.settingsJsonRequest.value).toBe(0);
  expect(other.settings.editor.value).toBeUndefined(); expect(other.openSettingsJSON()).toBe(false);
  expect(frame.commands.isAvailable('frame.settings.json')).toBe(true);
  frame.use(editorModule); expect(frame.settingsJsonRequest.value).toBe(0);
  await frame.commands.execute('frame.settings.json'); expect(frame.settingsJsonRequest.value).toBe(1);
  frame.dispose(); expect(frame.settings.editor.value).toBeUndefined(); other.dispose();
});

test('editor registration respects disabled settings and restores availability when enabled', () => {
  const frame = createFrame({ settings: false }).use(editorModule);
  expect(frame.openSettingsJSON()).toBe(false);
  frame.features.settings = true;
  expect(frame.openSettingsJSON()).toBe(true); frame.dispose();
});
