import { themeTokens, type FrameThemeTokenName } from './tokens';
import { themeError, themeObject } from './errors';

/** Token documents contain string leaves and arbitrarily mixed nested/dotted keys. */
export interface FrameTokenTree { readonly [key: string]: string | FrameTokenTree }
export const hasThemeToken = (name: string): name is FrameThemeTokenName => Object.prototype.hasOwnProperty.call(themeTokens, name);

export function normalizeThemeTokens(input: unknown): Partial<Record<FrameThemeTokenName, string>> {
  const tokens: Partial<Record<FrameThemeTokenName, string>> = {};
  const ancestors = new Set<object>();
  let entries = 0;
  function visit(value: unknown, segments: string[], path: string, depth: number) {
    if (depth > 48) themeError(path, 'token nesting exceeds 48 levels');
    const tree = themeObject(value, path);
    if (ancestors.has(tree)) themeError(path, 'cyclic token tree');
    ancestors.add(tree);
    for (const [key, leaf] of Object.entries(tree)) {
      const location = `${path}.${key}`;
      if (++entries > 8192) themeError(location, 'too many token entries');
      const cssKey = key.startsWith('--');
      const parts = key.split('.');
      if ((!cssKey && parts.some(part => !/^[a-zA-Z0-9_-]+$/.test(part))) || parts.some(part => ['__proto__', 'prototype', 'constructor'].includes(part))) themeError(location, 'invalid token path');
      if (cssKey && (segments.length || typeof leaf !== 'string')) themeError(location, 'CSS variable keys must be top-level string leaves');
      const next = [...segments, ...parts];
      if (typeof leaf !== 'string' && leaf !== null && typeof leaf === 'object' && !cssKey) {
        visit(leaf, next, location, depth + 1); continue;
      }
      const name = cssKey ? key : `--${next.join('-')}`;
      if (!hasThemeToken(name)) themeError(location, 'unknown token');
      if (Object.prototype.hasOwnProperty.call(tokens, name)) themeError(location, `duplicate token ${name}`);
      if (typeof leaf !== 'string' || !leaf.trim() || leaf.length > 512) themeError(location, 'expected 1–512 characters');
      if (/[;{}@\\\x00-\x1f\x7f]|\/\*|\*\//.test(leaf) || /\b(url|src|image(?:-set)?|cross-fade|paint|env|attr|expression)\s*\(/i.test(leaf)) themeError(location, 'unsupported CSS syntax');
      tokens[name] = leaf.trim();
    }
    ancestors.delete(tree);
  }
  visit(input, [], 'tokens', 0);
  return tokens;
}
