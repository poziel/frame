import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

/** Reads local CSS imports in dependency order without fetching remote styles. */
export function readCssSources(
  file: string,
  read: (path: string) => string = (path) => readFileSync(path, 'utf8'),
  seen = new Set<string>()
): Map<string, string> {
  const path = resolve(file);
  const result = new Map<string, string>();
  if (seen.has(path)) return result;
  seen.add(path);
  const css = read(path);
  postcss.parse(css, {from: path}).walkAtRules('import', (rule) => {
    const first = valueParser(rule.params).nodes[0];
    const target =
      first?.type === 'string'
        ? first.value
        : first?.type === 'function' && first.value === 'url'
          ? first.nodes[0]?.value
          : undefined;
    if (!target?.startsWith('.') || !target.endsWith('.css')) return;
    for (const [imported, source] of readCssSources(
      resolve(dirname(path), target),
      read,
      seen
    ))
      result.set(imported, source);
  });
  result.set(path, css);
  return result;
}
