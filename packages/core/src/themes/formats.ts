import { parseJSON, parseJSONC, parseJSON5, parseYAML, parseTOML, parseINI } from 'confbox';
import { themeError } from './errors';

export const themeFormats = Object.freeze(['json', 'jsonc', 'json5', 'yaml', 'toml', 'ini'] as const);
export type FrameThemeFormat = typeof themeFormats[number];
export interface ParseThemeOptions {
  /** Explicit format. Defaults to JSON; yml is an alias for yaml. */
  readonly format?: FrameThemeFormat | 'yml';
  /** Metadata for bare token documents. Envelopes carry their own metadata. */
  readonly id?: string;
  readonly name?: string;
  readonly appearance?: 'light' | 'dark';
}
const readers: Record<FrameThemeFormat, (text: string) => unknown> = {
  json: text => parseJSON(text),
  jsonc: text => parseJSONC(text, { allowTrailingComma: true }),
  json5: text => parseJSON5(text),
  yaml: text => parseYAML(text, { maxDepth: 48, maxAliases: 128 }),
  toml: text => parseTOML(text),
  ini: text => parseINI(text),
};
export function resolveThemeFormat(input: unknown): FrameThemeFormat {
  const format = input === 'yml' ? 'yaml' : input ?? 'json';
  if (typeof format !== 'string' || !Object.prototype.hasOwnProperty.call(readers, format)) themeError('format', `unsupported theme format ${String(format)}; use ${themeFormats.join(', ')}`);
  return format as FrameThemeFormat;
}
export function readThemeDocument(text: string, options: ParseThemeOptions): unknown {
  const format = resolveThemeFormat(options.format);
  try { return readers[format](text); }
  catch (error) { return themeError('theme', `invalid ${format}: ${error instanceof Error ? error.message : String(error)}`); }
}
