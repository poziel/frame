import type {FrameThemeTokens} from './tokens/tokenCatalog';
import {ThemeTokenValidator} from './parsing/themeTokenValidator';
import {
  themeError as fail,
  themeObject as object,
} from './parsing/frameThemeError';
import {TokenNormalizer, type FrameTokenTree} from './parsing/tokenNormalizer';
import {
  readThemeDocument,
  resolveThemeFormat,
  type ParseThemeOptions,
} from './parsing/documentFormats';

export type {
  FrameThemeTokens,
  FrameThemeTokenName,
} from './tokens/tokenCatalog';
export {FrameThemeError} from './parsing/frameThemeError';
export type {FrameTokenTree} from './parsing/tokenNormalizer';
export type {
  FrameThemeFormat,
  ParseThemeOptions,
} from './parsing/documentFormats';

/** Validated immutable theme with canonical CSS variable token names. */
export interface FrameTheme {

  /** Supported theme document schema version. */
  readonly version: 1;

  /** Stable identifier used by registration and theme selection. */
  readonly id: string;

  /** Human-readable name displayed by host selection UI. */
  readonly name: string;

  /** Native color scheme applied to attached surfaces. */
  readonly appearance: 'light' | 'dark';

  /** Explicit overrides; omitted shared tokens use the catalog defaults. */
  readonly tokens: Readonly<Partial<FrameThemeTokens>>;
}

/** Input definition accepting nested, dotted, or canonical token paths. */
export interface FrameThemeDefinition extends Omit<FrameTheme, 'tokens'> {

  /** Token tree normalized and validated by defineTheme before use. */
  readonly tokens: FrameTokenTree;
}

/** Measures the serialized UTF-8 size for the theme import limit. */
const byteLength = (value: string) =>
  new TextEncoder().encode(value).byteLength;

/**
 * Validates metadata, normalizes token paths, and checks reference dependencies.
 *
 * @param input - Theme definition or previously validated theme to copy.
 * @returns A defensive, deeply immutable definition with canonical token names.
 * @throws FrameThemeError for invalid metadata, tokens, references, or size.
 */
export function defineTheme(
  input: FrameThemeDefinition | FrameTheme
): FrameTheme {
  const data = object(input, 'theme');
  for (const key of Object.keys(data))
    if (!['version', 'id', 'name', 'appearance', 'tokens'].includes(key))
      fail(key, 'unknown field');
  if (data.version !== 1) fail('version', 'expected schema version 1');
  for (const key of ['id', 'name'] as const)
    if (
      typeof data[key] !== 'string' ||
      !data[key].trim() ||
      data[key].length > 200 ||
      /[\x00-\x1f\x7f]/.test(data[key])
    )
      fail(key, 'expected 1–200 characters without control characters');
  if (data.appearance !== 'light' && data.appearance !== 'dark')
    fail('appearance', 'expected light or dark');
  const tokens = new TokenNormalizer().normalize(data.tokens);
  const result: FrameTheme = {
    version: 1,
    id: data.id as string,
    name: data.name as string,
    appearance: data.appearance,
    tokens: Object.freeze(tokens),
  };
  if (byteLength(JSON.stringify(result)) > 128 * 1024)
    fail('theme', 'exceeds 128 KiB');
  new ThemeTokenValidator(tokens).validate();
  return Object.freeze(result);
}
/** Imports never apply styles or load resources. Hosts own storage and selection UI. */
export function parseTheme(
  text: string,
  options: ParseThemeOptions = {}
): FrameTheme {
  if (typeof text !== 'string') fail('theme', 'expected theme text');
  if (byteLength(text) > 128 * 1024) fail('theme', 'exceeds 128 KiB');
  let value = object(readThemeDocument(text, options), 'theme');
  // INI represents numeric scalar metadata as text. Token values stay strings.
  if (options.format === 'ini' && value.version === '1')
    value = {...value, version: 1};
  if (
    Object.prototype.hasOwnProperty.call(value, 'tokens') ||
    Object.prototype.hasOwnProperty.call(value, 'version')
  )
    return defineTheme(value as unknown as FrameThemeDefinition);
  return defineTheme({
    version: 1,
    id: options.id ?? 'custom',
    name: options.name ?? 'Custom',
    appearance: options.appearance ?? 'dark',
    tokens: value as FrameTokenTree,
  });
}

/** Browser Files and host-provided file adapters use the same data-only parser. */
export interface FrameThemeFile {

  /** File name used to infer the serialized document format. */
  readonly name: string;

  /** Byte size checked before reading the document contents. */
  readonly size: number;

  /** Reads text without applying the resulting definition. */
  text(): Promise<string>;
}

/** Parses a bounded file, inferring its format from the extension when omitted. */
export async function parseThemeFile(
  file: FrameThemeFile,
  options: ParseThemeOptions = {}
): Promise<FrameTheme> {
  const format = resolveThemeFormat(
    options.format ?? file.name.split('.').pop()?.toLowerCase()
  );
  if (file.size > 128 * 1024) fail('theme', 'exceeds 128 KiB');
  return parseTheme(await file.text(), {...options, format});
}
