import {loadCodeHighlight} from '../../../../components/data-display/codeHighlight';
import type {CodeBlockTheme} from '../../../../components/data-display/codeThemes';
import type * as Monaco from 'monaco-editor';
import {PreparedCodeEditor} from './preparedCodeEditor';

/**
 * Owns lazy loading and language bookkeeping for Monaco's shared browser engine.
 *
 * Monaco and Shiki keep global registrations; one module-owned runtime preserves
 * that behavior across independent surfaces. Construction starts no loading.
 * Failed imports clear the cached promise so a later mount can retry.
 */
export class CodeEditorRuntime {

  /** Shared in-flight or successful engine import. */
  private runtime: Promise<typeof Monaco> | undefined;

  /** Grammar IDs added by Shiki, excluded from canonical built-in lookup. */
  private readonly shikiLanguages = new Set<string>();

  /** Creates an idle runtime with bound loader and preparation callbacks. */
  constructor() {
    this.load = this.load.bind(this);
    this.prepare = this.prepare.bind(this);
  }

  /**
   * Returns the shared in-flight or successful Monaco import.
   *
   * @returns The same promise until an import fails; the next call then retries.
   * @remarks Editor instances and models remain owned by their surfaces.
   */
  load(): Promise<typeof Monaco> {
    return (this.runtime ??= import('monaco-editor').catch((error) => {
      this.runtime = undefined;
      throw error;
    }));
  }

  /**
   * Loads syntax and resolves its canonical Monaco language without activation.
   *
   * @param language - Requested language or alias, with plaintext fallback.
   * @param theme - Requested Shiki palette, shared with the code-block loader.
   * @returns A request-specific preparation activated by the current surface.
   * @remarks Preparation does not select a theme or create models. The surface
   * checks its request revision before activating this result.
   */
  async prepare(
    language: string,
    theme: CodeBlockTheme
  ): Promise<PreparedCodeEditor> {
    const [monaco, syntax] = await Promise.all([
      this.load(),
      loadCodeHighlight(language, theme),
    ]);
    const languages = monaco.languages
      .getLanguages()
      .filter((item) => !this.shikiLanguages.has(item.id));
    // Prefer Monaco's canonical ID so aliases keep their language services.
    const monacoLanguage =
      languages.find((item) => item.id === syntax.language)?.id ??
      languages.find((item) =>
        item.aliases?.some(
          (alias) => alias.toLowerCase() === syntax.language.toLowerCase()
        )
      )?.id ??
      syntax.language;
    return new PreparedCodeEditor(
      monaco,
      syntax,
      monacoLanguage,
      this.shikiLanguages
    );
  }
}

/** Shared engine owner; importing this module does not load Monaco. */
const runtime = new CodeEditorRuntime();

/** Loads the shared Monaco engine through the existing lazy API. */
export function loadMonaco(): Promise<typeof Monaco> {
  return runtime.load();
}

/** Prepares syntax for the next current surface update. */
export function prepareCodeEditor(
  language: string,
  theme: CodeBlockTheme
): Promise<PreparedCodeEditor> {
  return runtime.prepare(language, theme);
}
