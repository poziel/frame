import { createHighlighterCore, type HighlighterCore, type ThemedToken } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";
import { CodeBlockTheme } from "./codeThemes";
import { codeThemeLoaders } from "./codeThemeLoaders";

export interface CodeHighlight {
  lines: ThemedToken[][];
  background: string;
  foreground: string;
  gutter: string;
}
let highlighter: Promise<HighlighterCore> | undefined;
const loading = new Map<string, Promise<void>>();
function getHighlighter() {
  return highlighter ??= createHighlighterCore({ themes: [], langs: [], engine: createJavaScriptRegexEngine() });
}
function loadOnce(key: string, load: () => Promise<void>) {
  let pending = loading.get(key);
  if (!pending) { pending = load().catch(error => { loading.delete(key); throw error; }); loading.set(key, pending); }
  return pending;
}
/** Load the same grammar and theme used by Code Block and optional editor integrations. */
export async function loadCodeHighlight(language: string, requestedTheme: CodeBlockTheme) {
  const theme = Object.prototype.hasOwnProperty.call(codeThemeLoaders, requestedTheme) ? requestedTheme : CodeBlockTheme.DarkPlus;
  const lang = Object.prototype.hasOwnProperty.call(bundledLanguages, language) ? language as keyof typeof bundledLanguages : "text";
  const engine = await getHighlighter();
  await Promise.all([
    loadOnce(`theme:${theme}`, async () => { await engine.loadTheme((await codeThemeLoaders[theme]()).default); }),
    lang === "text" ? Promise.resolve() : loadOnce(`lang:${lang}`, async () => { await engine.loadLanguage((await bundledLanguages[lang]()).default); }),
  ]);
  return { highlighter: engine, language: lang, theme };
}
export async function highlightCode(code: string, language: string, requestedTheme: CodeBlockTheme): Promise<CodeHighlight> {
  const { highlighter: engine, language: lang, theme } = await loadCodeHighlight(language, requestedTheme);
  const result = engine.codeToTokens(code, { lang, theme });
  return { lines: result.tokens, foreground: result.fg ?? "#d4d4d4", background: result.bg ?? "#1e1e1e", gutter: engine.getTheme(theme).colors?.["editorLineNumber.foreground"] ?? result.fg ?? "#858585" };
}
