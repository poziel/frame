import {
  CodeEditor,
  EditorController,
  createCodeEditor,
  editorModule,
  type CodeEditorController,
  type CodeEditorProps,
} from '@frame/core/modules/editor';
import {createFrame} from '@frame/core';

const editor = new EditorController();
const contract: CodeEditorController = editor;
const factoryContract: CodeEditorController = createCodeEditor();
const props: CodeEditorProps = {editor: contract, readOnly: false};
const custom: CodeEditorController = {
  instance: editor.instance,
  attach: editor.attach,
  focus: editor.focus,
  undo: editor.undo,
  redo: editor.redo,
  find: editor.find,
  replaceCode: editor.replaceCode,
  runAction: editor.runAction,
  format: editor.format,
  layout: editor.layout,
};
const frame = createFrame().use(editorModule);
const installed: CodeEditorController = frame.editor.create();
const detachedFocus: () => boolean = installed.focus;
void [CodeEditor, factoryContract, props, custom, detachedFocus];
// @ts-expect-error The attached instance is a readonly consumer reference.
contract.instance.value = undefined;
// @ts-expect-error Replacements must remain source text.
editor.replaceCode(42);
frame.dispose();
