import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {compile} from 'sass';
import {compileStyleSource} from '../../core/scripts/compile-style-source';
import data from '../src/examples/documentation/contracts.json';

const root = resolve(import.meta.dir, '../../..');
const defaults = readFileSync(
  resolve(root, 'packages/core/src/themes/generated/default.css'),
  'utf8'
);
const semantic = Object.fromEntries(
  [...defaults.matchAll(/(--frame-[\w-]+):\s*([^;]+);/g)].map((m) => [
    m[1],
    m[2],
  ])
);

const styleCache = new Map<string, {source: string; css: string}[]>();

/** Compiles styles before scanning so Sass composition and nesting are visible. */
function styles(file: string): {source: string; css: string}[] {
  if (file.includes('?')) {
    return [{source: file.split('?', 1)[0]!, css: compileStyleSource(file)}];
  }
  const cached = styleCache.get(file);
  if (cached) return cached;
  if (file.endsWith('.scss')) {
    const result = compile(file);
    // Scan each owner after its composition entry so source links identify the
    // declaration's maintained file rather than only the top-level entry.
    const sheets = result.loadedUrls.map((url) => {
      const source = fileURLToPath(url);
      return {source, css: compile(source).css};
    });
    styleCache.set(file, sheets);
    return sheets;
  }
  const sheets = [{source: file, css: compileStyleSource(file)}];
  styleCache.set(file, sheets);
  return sheets;
}
function variables(value: string) {
  const found: {name: string; value: string}[] = [];
  for (const match of value.matchAll(/var\((--frame-[\w-]+)/g)) {
    let i = match.index! + match[0].length,
      level = 1;
    const start = i;
    while (i < value.length && level) {
      if (value[i] === '(') level++;
      if (value[i] === ')') level--;
      if (level) i++;
    }
    const fallback = value
      .slice(start, i)
      .replace(/^\s*,\s*/, '')
      .trim();
    found.push({
      name: match[1]!,
      value:
        fallback ||
        semantic[match[1]!] ||
        'Inherited from the rendering context',
    });
  }
  return found;
}
// Build-time inspection includes every maintained owner: shared selectors may
// be consumed by siblings, not only by directly imported components.
const core = resolve(root, 'packages/core/src');
const styleOwners = readdirSync(core, {recursive: true})
  .map(String)
  .filter((file) => /\.(s?css|vue)$/.test(file))
  .sort()
  .flatMap((file) => styles(resolve(core, file)));
const maintainedStyles = [
  ...new Map(styleOwners.map((sheet) => [sheet.source, sheet])).values(),
];
const result: Record<string, unknown> = {};
for (const [file] of Object.entries(data.contracts)) {
  const sources = [
    ...(/FrameQuick(Pick|Panel)\.vue$/.test(file)
      ? ['packages/core/src/components/framework/QuickOverlay.vue']
      : []),
    file,
  ];
  const source = sources
    .map((entry) => readFileSync(resolve(root, entry), 'utf8'))
    .join('\n');
  const classes = [
    ...new Set(
      [...source.matchAll(/(?<!:)class=["']([^"']+)["']/g)]
        .flatMap((m) => m[1]!.split(/\s+/))
        .filter(Boolean)
    ),
  ];
  const matches = (selector: string, name: string) =>
    new RegExp(
      '\\.' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])'
    ).test(selector.replace(/:(?:not|has)\([^)]*\)/g, ''));
  const tokens = new Map<string, unknown>();
  const publicClasses = new Map<string, unknown>();
  for (const {source: cssFile, css} of [
    ...maintainedStyles,
    ...sources.flatMap((entry) => styles(resolve(root, entry))),
  ]) {
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = rule[1]!.trim();
      if (
        !classes.some((name) => matches(selector, name)) ||
        selector.startsWith(':root')
      )
        continue;
      for (const name of classes)
        if (matches(selector, name))
          publicClasses.set(name, {
            name: '.' + name,
            description:
              'Styles the ' +
              name.replace(/^frame-/, '').replace(/-/g, ' ') +
              ' element.',
          });
      for (const decl of rule[2]!.matchAll(
        /(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g
      )) {
        if (decl[1]!.startsWith('--')) continue;
        for (const variable of variables(decl[2]!))
          tokens.set(variable.name, {
            ...variable,
            description: decl[1]!.replace(/-/g, ' ') + ' for ' + selector + '.',
            selector,
            source: relative(root, resolve(root, cssFile)).replace(/\\/g, '/'),
          });
      }
    }
  }
  result[file] = {
    classes: [...publicClasses.values()],
    tokens: [...tokens.values()],
  };
}
writeFileSync(
  resolve(root, 'packages/docs/src/examples/documentation/themes.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  'Recorded theme classes and consumed tokens for',
  Object.keys(result).length,
  'surfaces'
);
