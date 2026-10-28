import {readdirSync} from 'node:fs';
import {relative, resolve} from 'node:path';
import {readCssSources} from './read-css-sources';

/** Reads production CSS and Vue style blocks without generated theme defaults. */
export function productionCssSources(root: string): Map<string, string> {
  const result = new Map<string, string>();
  const sourceRoot = resolve(root, 'packages/core/src');
  const seen = new Set<string>();
  for (const file of readdirSync(sourceRoot, {recursive: true})
    .map(String)
    .sort()) {
    const name = file.replaceAll('\\', '/');
    if (!/\.(s?css|vue)$/.test(name) || name.includes('themes/generated/'))
      continue;
    const source = `packages/core/src/${name}`;
    for (const [owner, css] of readCssSources(
      resolve(root, source),
      undefined,
      seen
    )) {
      const owned = relative(root, owner).replaceAll('\\', '/');
      if (!owned.includes('themes/generated/') && css.trim())
        result.set(owned, css);
    }
  }
  return result;
}
