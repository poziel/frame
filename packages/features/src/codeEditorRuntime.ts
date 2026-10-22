import { loadCodeHighlight, CodeBlockTheme } from '@frame/core';
import { shikiToMonaco } from '@shikijs/monaco';
import type * as Monaco from 'monaco-editor';

let runtime: Promise<typeof Monaco> | undefined;
const shikiLanguages = new Set<string>();
export function loadMonaco() {
  return runtime ??= import('monaco-editor').catch(error => { runtime = undefined; throw error; });
}

export async function prepareCodeEditor(language: string, theme: CodeBlockTheme) {
  const [monaco, syntax] = await Promise.all([loadMonaco(), loadCodeHighlight(language, theme)]);
  const languages = monaco.languages.getLanguages().filter(item => !shikiLanguages.has(item.id));
  // Prefer Monaco's canonical ID so aliases keep their language services.
  const monacoLanguage = languages.find(item => item.id === syntax.language)?.id
    ?? languages.find(item => item.aliases?.some(alias => alias.toLowerCase() === syntax.language.toLowerCase()))?.id
    ?? syntax.language;
  // The bridge patches setTheme/create. Give it a fresh facade so repeated
  // lazy grammar loads never stack wrappers on the shared Monaco singleton.
  function activate() {
    const known = new Set(monaco.languages.getLanguages().map(item => item.id));
    for (const id of syntax.highlighter.getLoadedLanguages()) {
      if (!known.has(id)) { monaco.languages.register({ id }); known.add(id); shikiLanguages.add(id); }
    }
    const bridge = { ...monaco, editor: { ...monaco.editor } };
    // Code Block can use a different theme between Monaco tokenization calls.
    // Restore the editor palette before tokenizing each line on the shared engine.
    const highlighter = {
      ...syntax.highlighter,
      getLanguage(id: Parameters<typeof syntax.highlighter.getLanguage>[0]) {
        const grammar = syntax.highlighter.getLanguage(id);
        const wrapped = Object.create(grammar) as typeof grammar;
        wrapped.tokenizeLine2 = (...args: Parameters<typeof grammar.tokenizeLine2>) => {
          syntax.highlighter.setTheme(syntax.theme);
          return grammar.tokenizeLine2(...args);
        };
        return wrapped;
      },
    };
    shikiToMonaco(highlighter, bridge);
    bridge.editor.setTheme(syntax.theme);
  }
  return { monaco, activate, language: monacoLanguage === 'text' ? 'plaintext' : monacoLanguage, theme: syntax.theme };
}
