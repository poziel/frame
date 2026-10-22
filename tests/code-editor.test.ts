import { expect, test } from 'bun:test';
import { createCodeEditor, resolveCodeEditorOptions } from '../packages/extras/src/codeEditor';

test('direct settings override nested options only when supplied', () => {
  expect(resolveCodeEditorOptions({ options: { readOnly: true, fontSize: 19, ariaLabel: 'Nested' } })).toMatchObject({ readOnly: true, fontSize: 19, ariaLabel: 'Nested' });
  expect(resolveCodeEditorOptions({ readOnly: false, label: 'Source', options: { readOnly: true, ariaLabel: 'Nested' } })).toMatchObject({ readOnly: false, ariaLabel: 'Source' });
});

test('controller is safe before mount, rejects concurrent attachment, and can reattach', () => {
  const controller = createCodeEditor();
  expect(controller.instance.value).toBeUndefined();
  expect(controller.focus()).toBe(false);
  const first = {} as any, second = {} as any;
  const detach = controller.attach(first);
  expect(controller.instance.value).toBe(first);
  expect(() => controller.attach(second)).toThrow('already attached');
  detach();
  const detachSecond = controller.attach(second);
  detach(); // An old release must never disconnect the new surface.
  expect(controller.instance.value).toBe(second);
  detachSecond();
  expect(controller.instance.value).toBeUndefined();
});

test('controller delegates editing and actions to the current editor', async () => {
  const calls: string[] = [];
  const controller = createCodeEditor();
  const detach = controller.attach({
    focus: () => calls.push('focus'),
    trigger: (_source: string, action: string) => calls.push(action),
    getAction: (id: string) => id === 'editor.action.formatDocument' ? { isSupported: () => true, run: async () => { calls.push('format'); } } : null,
    getSelections: () => [],
    getModel: () => ({
      getFullModelRange: () => 'full',
      pushStackElement: () => calls.push('stop'),
      pushEditOperations: (_selections: unknown, edits: any[]) => { calls.push(edits[0].text); return null; },
    }),
  } as any);
  expect(controller.replaceCode('replacement')).toBe(true);
  controller.focus(); controller.undo(); controller.redo();
  expect(await controller.format()).toBe(true);
  expect(await controller.runAction('unavailable')).toBe(false);
  expect(calls).toEqual(['stop', 'replacement', 'stop', 'focus', 'undo', 'redo', 'format']);
  detach();
});
