import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {compile} from 'sass';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import {compileStyleSource} from '../../../core/scripts/compile-style-source';

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
  if (path.split('?', 1)[0]!.endsWith('.vue')) {
    result.set(path.split('?', 1)[0]!, compileStyleSource(path));
    return result;
  }
  if (path.endsWith('.scss')) {
    const compiled = compile(path, {sourceMap: true});
    // Attribute composed rules to their actual maintained owner. Sass source
    // maps retain the selector's owner even when a mixin emits declarations.
    for (const url of compiled.loadedUrls) {
      if (url.protocol !== 'file:') continue;
      const owner = fileURLToPath(url);
      if (seen.has(owner) && owner !== path) continue;
      seen.add(owner);
      const sheet =
        owner === path ? compiled : compile(owner, {sourceMap: true});
      const css = postcss().process(sheet.css, {
        from: owner,
        map: {prev: sheet.sourceMap, inline: false, annotation: false},
      }).root;
      css.walkRules((rule) => {
        const start = rule.source?.start;
        const origin =
          start && rule.source?.input.origin(start.line, start.column);
        if (origin?.url && origin.url !== pathToFileURL(owner).href)
          rule.remove();
      });
      result.set(owner, css.toString());
    }
    return result;
  }
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
