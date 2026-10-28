import {readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {parse as parseSfc} from '@vue/compiler-sfc';

/** Reads production CSS and Vue style blocks without generated theme defaults. */
export function productionCssSources(root: string): Map<string, string> {
  const result = new Map<string, string>();
  const sourceRoot = resolve(root, 'packages/core/src');
  for (const relative of readdirSync(sourceRoot, {recursive: true})
    .map(String)
    .sort()) {
    const name = relative.replaceAll('\\', '/');
    if (!/\.(css|vue)$/.test(name) || name.includes('themes/generated/'))
      continue;
    const source = `packages/core/src/${name}`;
    const content = readFileSync(resolve(root, source), 'utf8');
    const css = name.endsWith('.vue')
      ? parseSfc(content, {filename: source})
          .descriptor.styles.map((style) => style.content)
          .join('\n')
      : content;
    if (css.trim()) result.set(source, css);
  }
  return result;
}
