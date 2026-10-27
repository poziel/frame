import type {ShallowRef} from 'vue';
import type * as Monaco from 'monaco-editor';
import type {CodeBlockTheme} from '../../../components/data-display/codeThemes';

/** Value, model, language and theme are managed by the component. */
export type CodeEditorOptions = Omit<
  Monaco.editor.IStandaloneEditorConstructionOptions,
  'value' | 'model' | 'language' | 'theme'
> &
  Monaco.editor.ITextModelUpdateOptions;

/** Standalone surface inputs; omission preserves nested Monaco options. */
export interface CodeEditorProps {

  /** Controlled source text; omitted values leave the model locally owned. */
  modelValue?: string;

  /** Optional caller-owned controller attached while the surface is mounted. */
  editor?: CodeEditorController;

  /** Language identifier or alias; defaults to plaintext. */
  language?: string;

  /** Syntax palette; defaults to Dark Plus. */
  theme?: CodeBlockTheme;

  /** Explicit user-editing override; host replacements remain permitted. */
  readOnly?: boolean;

  /** Accessible editor name; overrides the nested ariaLabel. */
  label?: string;

  /** Focuses the editor after its initial successful mount. */
  autofocus?: boolean;

  /** Monaco construction and model options merged with surface defaults. */
  options?: CodeEditorOptions;
}

/** Structural host contract for one mounted surface; no Frame is required. */
export interface CodeEditorController {

  /** Readonly reactive reference to the currently attached Monaco surface. */
  readonly instance: Readonly<
    ShallowRef<Monaco.editor.IStandaloneCodeEditor | undefined>
  >;

  /** Focuses the mounted surface, returning false before attachment. */
  focus(): boolean;

  /** Runs Monaco undo on the mounted surface. */
  undo(): boolean;

  /** Runs Monaco redo on the mounted surface. */
  redo(): boolean;

  /** Opens the mounted editor’s find widget. */
  find(): boolean;

  /** Replaces the complete model within undo boundaries, including read-only models. */
  replaceCode(code: string): boolean;

  /** Runs a supported Monaco action; returns false when unavailable. */
  runAction(id: string): Promise<boolean>;

  /** Runs the registered document formatter when supported. */
  format(): Promise<boolean>;

  /** Recomputes the mounted editor layout. */
  layout(): void;

  /** Used by CodeEditor to claim one mounted surface. Returns an idempotent release. */
  attach(instance: Monaco.editor.IStandaloneCodeEditor): () => void;
}
