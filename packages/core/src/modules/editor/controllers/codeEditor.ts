import {shallowReadonly, shallowRef} from 'vue';
import type * as Monaco from 'monaco-editor';
import type {
  CodeEditorController,
  CodeEditorProps,
  CodeEditorOptions,
} from '../types/codeEditorTypes';

export type {
  CodeEditorController,
  CodeEditorProps,
  CodeEditorOptions,
} from '../types/codeEditorTypes';

/**
 * Owns the imperative controls for one mounted Monaco surface.
 *
 * Construction is lazy: it neither loads Monaco nor creates a model. The Vue
 * surface owns disposal; attaching only lends this controller its instance.
 * Public operations remain bound so hosts can pass them as callbacks.
 *
 * @example
 * const editor = new EditorController();
 * // Pass editor to CodeEditor, then call editor.focus() after ready.
 */
export class EditorController implements CodeEditorController {

  /** Writable attachment reference kept private from consumers. */
  private readonly attached = shallowRef<Monaco.editor.IStandaloneCodeEditor>();

  /** Readonly view of the surface currently claimed by this controller. */
  readonly instance = shallowReadonly(this.attached);

  /** Creates an unattached controller with independently usable callbacks. */
  constructor() {
    this.attach = this.attach.bind(this);
    this.focus = this.focus.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.find = this.find.bind(this);
    this.replaceCode = this.replaceCode.bind(this);
    this.runAction = this.runAction.bind(this);
    this.format = this.format.bind(this);
    this.layout = this.layout.bind(this);
  }

  /**
   * Claims one surface and returns its idempotent release callback.
   *
   * @throws If another surface is already attached.
   * @remarks Release never disposes the surface or clears a newer attachment.
   */
  attach(editor: Monaco.editor.IStandaloneCodeEditor): () => void {
    if (this.attached.value) {
      throw new Error(
        'Code editor controller is already attached to a surface'
      );
    }
    this.attached.value = editor;
    let released = false;
    return () => {
      if (!released) {
        released = true;
        if (this.attached.value === editor) this.attached.value = undefined;
      }
    };
  }

  /** Focuses the attached surface, returning false when unattached. */
  focus(): boolean {
    if (!this.attached.value) return false;
    this.attached.value.focus();
    return true;
  }

  /** Runs undo on the attached surface. */
  undo(): boolean {
    return this.trigger('undo');
  }

  /** Runs redo on the attached surface. */
  redo(): boolean {
    return this.trigger('redo');
  }

  /** Opens find on the attached surface. */
  find(): boolean {
    return this.trigger('actions.find');
  }

  /** Replaces all source text as one undoable edit, even in read-only mode. */
  replaceCode(code: string): boolean {
    const editor = this.attached.value;
    const model = editor?.getModel();
    if (!editor || !model) return false;
    model.pushStackElement();
    model.pushEditOperations(
      editor.getSelections() ?? [],
      [
        {
          range: model.getFullModelRange(),
          text: code,
          forceMoveMarkers: true,
        },
      ],
      () => null
    );
    model.pushStackElement();
    return true;
  }

  /** Runs a supported action and preserves its asynchronous failure. */
  async runAction(id: string): Promise<boolean> {
    const action = this.attached.value?.getAction(id);
    if (!action?.isSupported()) return false;
    await action.run();
    return true;
  }

  /** Formats the current document when a formatter is available. */
  format(): Promise<boolean> {
    return this.runAction('editor.action.formatDocument');
  }

  /** Requests layout without creating or attaching a surface. */
  layout(): void {
    this.attached.value?.layout();
  }

  /** Dispatches a built-in Monaco action with Frame as its source. */
  private trigger(action: string): boolean {
    if (!this.attached.value) return false;
    this.attached.value.trigger('frame', action, null);
    return true;
  }
}

/** Combines defaults and nested options with explicitly supplied surface props. */
export function resolveCodeEditorOptions(
  props: Pick<CodeEditorProps, 'options' | 'readOnly' | 'label'>
): CodeEditorOptions {
  return {
    automaticLayout: true,
    fontSize: 14,
    minimap: {enabled: false},
    scrollBeyondLastLine: false,
    ariaLabel: 'Code editor',
    'semanticHighlighting.enabled': false,
    ...props.options,
    ...(props.readOnly === undefined ? {} : {readOnly: props.readOnly}),
    ...(props.label === undefined ? {} : {ariaLabel: props.label}),
  };
}

/** Creates a lazy class-backed controller through the existing structural API. */
export function createCodeEditor(): CodeEditorController {
  return new EditorController();
}
