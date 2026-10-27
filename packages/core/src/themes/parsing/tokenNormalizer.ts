import {hasThemeToken, type FrameThemeTokenName} from '../tokens/tokenCatalog';
import {themeError, themeObject} from './frameThemeError';

/** Token documents contain string leaves and arbitrarily mixed nested/dotted keys. */
export interface FrameTokenTree {

  /** Nested path segment or string token value. */
  readonly [key: string]: string | FrameTokenTree;
}

/**
 * Flattens one token tree while owning traversal bounds and cycle detection.
 *
 * Each normalization starts with fresh output and traversal state. Reusing an
 * instance after success or failure cannot mutate an earlier result or carry
 * ancestor references into another document. No state is shared across calls.
 */
export class TokenNormalizer {

  /** Canonical token values collected for the current document. */
  private tokens: Partial<Record<FrameThemeTokenName, string>> = {};

  /** Current recursion path; shared subtrees are allowed, cycles are rejected. */
  private readonly ancestors = new Set<object>();

  /** Entry count enforcing the document-wide traversal budget. */
  private entries = 0;

  /**
   * Validates paths and string leaves, producing a fresh canonical token map.
   *
   * @param input - Untrusted nested, dotted, or CSS-variable token tree.
   * @throws FrameThemeError for invalid paths, cycles, bounds, or CSS syntax.
   */
  normalize(input: unknown): Partial<Record<FrameThemeTokenName, string>> {
    this.tokens = {};
    this.ancestors.clear();
    this.entries = 0;
    try {
      this.visit(input, [], 'tokens', 0);
      return this.tokens;
    } finally {
      this.ancestors.clear();
    }
  }

  /** Visits a subtree, retaining its source path for precise validation errors. */
  private visit(
    value: unknown,
    segments: string[],
    path: string,
    depth: number
  ): void {
    if (depth > 48) themeError(path, 'token nesting exceeds 48 levels');
    const tree = themeObject(value, path);
    if (this.ancestors.has(tree)) themeError(path, 'cyclic token tree');
    this.ancestors.add(tree);
    for (const [key, leaf] of Object.entries(tree)) {
      const location = `${path}.${key}`;
      if (++this.entries > 8192) themeError(location, 'too many token entries');
      const cssKey = key.startsWith('--');
      const parts = key.split('.');
      if (
        (!cssKey && parts.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))) ||
        parts.some((part) =>
          ['__proto__', 'prototype', 'constructor'].includes(part)
        )
      )
        themeError(location, 'invalid token path');
      if (cssKey && (segments.length || typeof leaf !== 'string'))
        themeError(
          location,
          'CSS variable keys must be top-level string leaves'
        );
      const next = [...segments, ...parts];
      if (
        typeof leaf !== 'string' &&
        leaf !== null &&
        typeof leaf === 'object' &&
        !cssKey
      ) {
        this.visit(leaf, next, location, depth + 1);
        continue;
      }
      const name = cssKey ? key : `--${next.join('-')}`;
      if (!hasThemeToken(name)) themeError(location, 'unknown token');
      if (Object.prototype.hasOwnProperty.call(this.tokens, name))
        themeError(location, `duplicate token ${name}`);
      if (typeof leaf !== 'string' || !leaf.trim() || leaf.length > 512)
        themeError(location, 'expected 1–512 characters');
      if (
        /[;{}@\\\x00-\x1f\x7f]|\/\*|\*\//.test(leaf) ||
        /\b(url|src|image(?:-set)?|cross-fade|paint|env|attr|expression)\s*\(/i.test(
          leaf
        )
      )
        themeError(location, 'unsupported CSS syntax');
      this.tokens[name] = leaf.trim();
    }
    this.ancestors.delete(tree);
  }
}
