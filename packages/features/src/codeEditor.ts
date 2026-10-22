import { shallowReadonly, shallowRef, type ShallowRef } from 'vue';
import type * as Monaco from 'monaco-editor';
import type { CodeBlockTheme } from '@frame/core';

/** Value, model, language and theme are managed by the component. */
export type CodeEditorOptions = Omit<Monaco.editor.IStandaloneEditorConstructionOptions, 'value' | 'model' | 'language' | 'theme'> & Monaco.editor.ITextModelUpdateOptions;
export interface CodeEditorProps {
  modelValue?: string;
  editor?: CodeEditorController;
  language?: string;
  theme?: CodeBlockTheme;
  readOnly?: boolean;
  label?: string;
  autofocus?: boolean;
  options?: CodeEditorOptions;
}
export interface CodeEditorController {
  readonly instance: Readonly<ShallowRef<Monaco.editor.IStandaloneCodeEditor | undefined>>;
  focus(): boolean;
  undo(): boolean;
  redo(): boolean;
  find(): boolean;
  replaceCode(code: string): boolean;
  runAction(id: string): Promise<boolean>;
  format(): Promise<boolean>;
  layout(): void;
  /** Used by CodeEditor to claim one mounted surface. Returns an idempotent release. */
  attach(instance: Monaco.editor.IStandaloneCodeEditor): () => void;
}

export function resolveCodeEditorOptions(props: Pick<CodeEditorProps, 'options' | 'readOnly' | 'label'>): CodeEditorOptions {
  return {
    automaticLayout: true, fontSize: 14, minimap: { enabled: false },
    scrollBeyondLastLine: false, ariaLabel: 'Code editor', 'semanticHighlighting.enabled': false,
    ...props.options,
    ...(props.readOnly === undefined ? {} : { readOnly: props.readOnly }),
    ...(props.label === undefined ? {} : { ariaLabel: props.label }),
  };
}

export function createCodeEditor(): CodeEditorController {
  const instance = shallowRef<Monaco.editor.IStandaloneCodeEditor>();
  function trigger(action: string) {
    if (!instance.value) return false;
    instance.value.trigger('frame', action, null);
    return true;
  }
  async function runAction(id: string) {
    const action = instance.value?.getAction(id);
    if (!action?.isSupported()) return false;
    await action.run();
    return true;
  }
  return {
    instance: shallowReadonly(instance),
    attach(editor) {
      if (instance.value) throw new Error('Code editor controller is already attached to a surface');
      instance.value = editor;
      let released = false;
      return () => { if (!released) { released = true; if (instance.value === editor) instance.value = undefined; } };
    },
    focus() { if (!instance.value) return false; instance.value.focus(); return true; },
    undo: () => trigger('undo'), redo: () => trigger('redo'), find: () => trigger('actions.find'),
    replaceCode(code) {
      const editor = instance.value, model = editor?.getModel();
      if (!editor || !model) return false;
      // Host updates must work even when user editing is disabled.
      model.pushStackElement();
      model.pushEditOperations(editor.getSelections() ?? [], [{ range: model.getFullModelRange(), text: code, forceMoveMarkers: true }], () => null);
      model.pushStackElement();
      return true;
    },
    runAction, format: () => runAction('editor.action.formatDocument'),
    layout() { instance.value?.layout(); },
  };
}
