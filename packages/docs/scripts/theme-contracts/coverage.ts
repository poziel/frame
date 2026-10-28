import type {CssTokenContract} from './css-contracts';

/** Public surface data needed to audit CSS documentation independently of Vue. */
export interface ThemeSurfaceContract {

  /** Source-derived token rows, including separate selector/state contexts. */
  tokens: readonly CssTokenContract[];
}

/**
 * Derives coverage from source contracts without a parallel token-name manifest.
 * Every selector context must have source-owned prose, including inherited and
 * runtime references. New documentation gaps fail extraction immediately.
 */
export function themeContractCoverage(
  surfaces: Readonly<Record<string, ThemeSurfaceContract>>
): {documented: CssTokenContract[]; legacy: CssTokenContract[]} {
  const unique = new Map<string, CssTokenContract>();
  for (const surface of Object.values(surfaces)) {
    for (const token of surface.tokens) {
      if (!token.description.trim())
        throw new Error(
          `Missing CSS token documentation: ${token.source}: ${token.selector}: ${token.name}`
        );
      if (token.value.includes('--_frame-default-'))
        throw new Error(
          `Private CSS default leaked: ${token.source}: ${token.name}`
        );
      const key = `${token.source}\0${token.name}`;
      if (!unique.get(key)?.description || token.description)
        unique.set(key, token);
    }
  }
  return {
    documented: [...unique.values()].filter(
      (token) => token.description !== ''
    ),
    legacy: [...unique.values()].filter((token) => token.description === ''),
  };
}
