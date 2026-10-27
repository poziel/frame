import {
  parseJSON,
  parseJSONC,
  parseJSON5,
  parseYAML,
  parseTOML,
  parseINI,
} from 'confbox';
import {themeError} from './frameThemeError';

/** Supported serialized document formats, in display order. */
export const themeFormats = Object.freeze([
  'json',
  'jsonc',
  'json5',
  'yaml',
  'toml',
  'ini',
] as const);

/** Canonical format identifier accepted by theme readers. */
export type FrameThemeFormat = (typeof themeFormats)[number];

/** Format selection and fallback metadata for bare token documents. */
export interface ParseThemeOptions {

  /** Explicit format. Defaults to JSON; yml is an alias for yaml. */
  readonly format?: FrameThemeFormat | 'yml';

  /** Metadata for bare token documents. Envelopes carry their own metadata. */
  readonly id?: string;

  /** Display name for a bare token document. */
  readonly name?: string;

  /** Native color scheme for a bare token document. */
  readonly appearance?: 'light' | 'dark';
}

/** Data-only readers; imports never load styles or external resources. */
const readers: Record<FrameThemeFormat, (text: string) => unknown> = {
  json: (text) => parseJSON(text),
  jsonc: (text) => parseJSONC(text, {allowTrailingComma: true}),
  json5: (text) => parseJSON5(text),
  yaml: (text) => parseYAML(text, {maxDepth: 48, maxAliases: 128}),
  toml: (text) => parseTOML(text),
  ini: (text) => parseINI(text),
};
/** Resolves the default and aliases, rejecting unsupported format names. */
export function resolveThemeFormat(input: unknown): FrameThemeFormat {
  const format = input === 'yml' ? 'yaml' : (input ?? 'json');
  if (
    typeof format !== 'string' ||
    !Object.prototype.hasOwnProperty.call(readers, format)
  )
    themeError(
      'format',
      `unsupported theme format ${String(format)}; use ${themeFormats.join(', ')}`
    );
  return format as FrameThemeFormat;
}
/** Reads serialized data and wraps parser failures with theme field context. */
export function readThemeDocument(
  text: string,
  options: ParseThemeOptions
): unknown {
  const format = resolveThemeFormat(options.format);
  try {
    return readers[format](text);
  } catch (error) {
    return themeError(
      'theme',
      `invalid ${format}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
