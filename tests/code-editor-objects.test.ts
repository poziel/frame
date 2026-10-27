import {expect, test} from 'bun:test';
import type * as Monaco from 'monaco-editor';
import {
  createCodeEditor,
  EditorController,
} from '../packages/core/src/modules/editor/controllers/codeEditor';

test('class-backed editor callbacks remain bound and release only borrowed attachments', async () => {
  const controller = createCodeEditor();
  const other = new EditorController();
  expect(controller).toBeInstanceOf(EditorController);
  const {
    attach,
    focus,
    undo,
    redo,
    find,
    layout,
    format,
    runAction,
    replaceCode,
  } = controller;
  expect(focus()).toBe(false);
  expect(undo()).toBe(false);
  expect(replaceCode('unmounted')).toBe(false);
  expect(await format()).toBe(false);
  const calls: string[] = [];
  const instance = {
    focus() {
      calls.push('focus');
    },
    trigger(_source: string, action: string) {
      calls.push(action);
    },
    layout() {
      calls.push('layout');
    },
    getAction(id: string) {
      return id === 'failing'
        ? {
            isSupported: () => true,
            run: async () => {
              throw new Error('Action failed');
            },
          }
        : null;
    },
    dispose() {
      calls.push('disposed');
    },
  } as unknown as Monaco.editor.IStandaloneCodeEditor;
  const release = attach(instance);
  focus();
  undo();
  redo();
  find();
  layout();
  expect(calls).toEqual(['focus', 'undo', 'redo', 'actions.find', 'layout']);
  expect(other.instance.value).toBeUndefined();
  await expect(runAction('failing')).rejects.toThrow('Action failed');
  release();
  release();
  expect(controller.instance.value).toBeUndefined();
  expect(calls).not.toContain('disposed');
  const next = {} as Monaco.editor.IStandaloneCodeEditor;
  const releaseNext = attach(next);
  release();
  expect(controller.instance.value).toBe(next);
  releaseNext();
});
