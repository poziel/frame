import { themeTokens, themeTokenNames, type FrameThemeTokens, type FrameThemeTokenName } from './tokens';
import { validThemeValue } from './values';
import { themeError as fail, themeObject as object } from './errors';
import { hasThemeToken as hasToken, normalizeThemeTokens, type FrameTokenTree } from './normalize';
import { readThemeDocument, resolveThemeFormat, type ParseThemeOptions } from './formats';
export type { FrameThemeTokens, FrameThemeTokenName } from './tokens';
export { FrameThemeError } from './errors';
export type { FrameTokenTree } from './normalize';
export type { FrameThemeFormat, ParseThemeOptions } from './formats';

export interface FrameTheme {
  readonly version: 1;
  readonly id: string;
  readonly name: string;
  readonly appearance: 'light' | 'dark';
  readonly tokens: Readonly<Partial<FrameThemeTokens>>;
}
export interface FrameThemeDefinition extends Omit<FrameTheme, 'tokens'> { readonly tokens: FrameTokenTree }
const byteLength = (value: string) => new TextEncoder().encode(value).byteLength;

/** Validate first, then return a deeply immutable, JSON-compatible copy. */
export function defineTheme(input: FrameThemeDefinition | FrameTheme): FrameTheme {
  const data = object(input, 'theme');
  for (const key of Object.keys(data)) if (!['version', 'id', 'name', 'appearance', 'tokens'].includes(key)) fail(key, 'unknown field');
  if (data.version !== 1) fail('version', 'expected schema version 1');
  for (const key of ['id', 'name'] as const) if (typeof data[key] !== 'string' || !data[key].trim() || data[key].length > 200 || /[\x00-\x1f\x7f]/.test(data[key])) fail(key, 'expected 1–200 characters without control characters');
  if (data.appearance !== 'light' && data.appearance !== 'dark') fail('appearance', 'expected light or dark');
  const tokens = normalizeThemeTokens(data.tokens);
  const result: FrameTheme = { version: 1, id: data.id as string, name: data.name as string, appearance: data.appearance, tokens: Object.freeze(tokens) };
  if (byteLength(JSON.stringify(result)) > 128 * 1024) fail('theme', 'exceeds 128 KiB');
  const resolved = new Map<FrameThemeTokenName, string>(), visiting = new Set<FrameThemeTokenName>();
  function resolve(name: FrameThemeTokenName): string {
    if (resolved.has(name)) return resolved.get(name)!;
    if (visiting.has(name)) fail(`tokens.${name}`, 'cyclic token reference');
    visiting.add(name);
    const source = tokens[name] ?? themeTokens[name].value;
    const expanded = source.replace(/var\(([^()]*)\)/g, (_, reference: string) => {
      const key = reference.trim();
      if (!hasToken(key)) fail(`tokens.${name}`, `unknown reference ${key}; fallbacks are not supported`);
      if (!(tokens[key] ?? themeTokens[key].value)) fail(`tokens.${name}`, `reference ${key} has no root default; provide an explicit value`);
      return resolve(key);
    });
    if (expanded.length > 8192 || !validThemeValue(expanded, themeTokens[name].kind)) fail(`tokens.${name}`, `expected a supported ${themeTokens[name].kind} value`);
    visiting.delete(name); resolved.set(name, expanded); return expanded;
  }
  for (const name of themeTokenNames) if ((tokens[name] ?? themeTokens[name].value) !== '') resolve(name);
  return Object.freeze(result);
}
/** Imports never apply styles or load resources. Hosts own storage and selection UI. */
export function parseTheme(text: string, options: ParseThemeOptions = {}): FrameTheme {
  if (typeof text !== 'string') fail('theme', 'expected theme text');
  if (byteLength(text) > 128 * 1024) fail('theme', 'exceeds 128 KiB');
  let value = object(readThemeDocument(text, options), 'theme');
  // INI represents numeric scalar metadata as text. Token values stay strings.
  if (options.format === 'ini' && value.version === '1') value = { ...value, version: 1 };
  if (Object.prototype.hasOwnProperty.call(value, 'tokens') || Object.prototype.hasOwnProperty.call(value, 'version')) return defineTheme(value as unknown as FrameThemeDefinition);
  return defineTheme({ version: 1, id: options.id ?? 'custom', name: options.name ?? 'Custom', appearance: options.appearance ?? 'dark', tokens: value as FrameTokenTree });
}

/** Browser Files and host-provided file adapters use the same data-only parser. */
export interface FrameThemeFile {
  readonly name: string;
  readonly size: number;
  text(): Promise<string>;
}
export async function parseThemeFile(file: FrameThemeFile, options: ParseThemeOptions = {}): Promise<FrameTheme> {
  const format = resolveThemeFormat(options.format ?? file.name.split('.').pop()?.toLowerCase());
  if (file.size > 128 * 1024) fail('theme', 'exceeds 128 KiB');
  return parseTheme(await file.text(), { ...options, format });
}
