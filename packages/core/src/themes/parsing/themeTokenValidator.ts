import {
  themeTokens,
  hasThemeToken as hasToken,
  themeTokenNames,
  type FrameThemeTokenName,
  type FrameThemeTokens,
} from '../tokens/tokenCatalog';
import {validThemeValue} from './cssValues';
import {themeError as fail} from './frameThemeError';

/**
 * Validates a definition's token references using isolated resolution state.
 *
 * Reference expansion is only for validation: source expressions remain intact
 * in the returned theme. Cached expansions avoid repeating work, while the
 * active recursion set detects cycles through explicit values or defaults.
 */
export class ThemeTokenValidator {

  /** Expanded values already checked during this validation pass. */
  private readonly resolved = new Map<FrameThemeTokenName, string>();

  /** Active reference path used to reject recursive token dependencies. */
  private readonly visiting = new Set<FrameThemeTokenName>();

  /** Immutable explicit overrides; omitted tokens resolve through the catalog. */
  private readonly tokens: Readonly<Partial<FrameThemeTokens>>;

  /** Associates this validator with one definition's normalized overrides. */
  constructor(tokens: Readonly<Partial<FrameThemeTokens>>) {
    this.tokens = tokens;
  }

  /**
   * Checks all explicit and default values without replacing source expressions.
   * @throws FrameThemeError for cycles, unknown references, or invalid values.
   */
  validate(): void {
    this.resolved.clear();
    this.visiting.clear();
    for (const name of themeTokenNames) {
      if ((this.tokens[name] ?? themeTokens[name].value) !== '')
        this.resolve(name);
    }
  }

  /** Expands a reference chain, checking its resulting size and value category. */
  private resolve(name: FrameThemeTokenName): string {
    if (this.resolved.has(name)) return this.resolved.get(name)!;
    if (this.visiting.has(name))
      fail(`tokens.${name}`, 'cyclic token reference');
    this.visiting.add(name);
    const source = this.tokens[name] ?? themeTokens[name].value;
    const expanded = source.replace(
      /var\(([^()]*)\)/g,
      (_, reference: string) => {
        const key = reference.trim();
        if (!hasToken(key))
          fail(
            `tokens.${name}`,
            `unknown reference ${key}; fallbacks are not supported`
          );
        if (!(this.tokens[key] ?? themeTokens[key].value))
          fail(
            `tokens.${name}`,
            `reference ${key} has no root default; provide an explicit value`
          );
        return this.resolve(key);
      }
    );
    if (
      expanded.length > 8192 ||
      !validThemeValue(expanded, themeTokens[name].kind)
    )
      fail(
        `tokens.${name}`,
        `expected a supported ${themeTokens[name].kind} value`
      );
    this.visiting.delete(name);
    this.resolved.set(name, expanded);
    return expanded;
  }
}
