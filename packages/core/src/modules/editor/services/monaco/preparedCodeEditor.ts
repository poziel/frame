import {shikiToMonaco} from '@shikijs/monaco';
import type * as Monaco from 'monaco-editor';
import type {loadCodeHighlight} from '../../../../components/data-display/codeHighlight';

/** Syntax/highlighter data shared with the Core code-block loader. */
type EditorSyntax = Awaited<ReturnType<typeof loadCodeHighlight>>;

/**
 * Retains the syntax selected for one preparation request.
 *
 * Activation uses a fresh Monaco facade to avoid stacking Shiki wrappers and
 * restores the editor palette before each tokenization on the shared engine.
 */
export class PreparedCodeEditor {

  /** Shared Monaco engine used to construct and update editor surfaces. */
  readonly monaco: typeof Monaco;

  /** Canonical Monaco language identifier for this request. */
  readonly language: string;

  /** Loaded Shiki palette identifier. */
  readonly theme: EditorSyntax['theme'];

  /** Prepared highlighter and grammar selection. */
  private readonly syntax: EditorSyntax;

  /** Runtime-owned IDs introduced by Shiki rather than built-in Monaco services. */
  private readonly shikiLanguages: Set<string>;

  /** Captures preparation data without changing the shared Monaco theme. */
  constructor(
    monaco: typeof Monaco,
    syntax: EditorSyntax,
    language: string,
    shikiLanguages: Set<string>
  ) {
    this.monaco = monaco;
    this.syntax = syntax;
    this.language = language === 'text' ? 'plaintext' : language;
    this.theme = syntax.theme;
    this.shikiLanguages = shikiLanguages;
    this.activate = this.activate.bind(this);
  }

  /** Registers grammars and applies this prepared syntax palette to Monaco. */
  activate(): void {
    const {monaco, syntax} = this;
    const known = new Set(
      monaco.languages.getLanguages().map((item) => item.id)
    );
    for (const id of syntax.highlighter.getLoadedLanguages()) {
      if (!known.has(id)) {
        monaco.languages.register({id});
        known.add(id);
        this.shikiLanguages.add(id);
      }
    }
    const bridge = {...monaco, editor: {...monaco.editor}};
    // Code Block can use a different theme between Monaco tokenization calls.
    // Restore the editor palette before tokenizing each line on the shared engine.
    const highlighter = {
      ...syntax.highlighter,
      getLanguage(id: Parameters<typeof syntax.highlighter.getLanguage>[0]) {
        const grammar = syntax.highlighter.getLanguage(id);
        const wrapped = Object.create(grammar) as typeof grammar;
        wrapped.tokenizeLine2 = (
          ...args: Parameters<typeof grammar.tokenizeLine2>
        ) => {
          syntax.highlighter.setTheme(syntax.theme);
          return grammar.tokenizeLine2(...args);
        };
        return wrapped;
      },
    };
    shikiToMonaco(highlighter, bridge);
    bridge.editor.setTheme(syntax.theme);
  }
}
