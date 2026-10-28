import {readFileSync} from 'node:fs';
import {writeGeneratedFile as writeFileSync} from './generated-file';
import {resolve} from 'node:path';
import {parse as parseSfc} from '@vue/compiler-sfc';
import postcss from 'postcss';
import data from '../src/examples/documentation/contracts.json';
import {productionCssSources} from './theme-contracts/production-css-sources';
import {readThemeTokenDescriptions} from './theme-contracts/theme-token-descriptions';
import {
  themeContractCoverage,
  type ThemeSurfaceContract,
} from './theme-contracts/coverage';
import {
  cssTokenContextKey,
  extractCssContracts,
  type CssTokenContract,
} from './theme-contracts/css-contracts';

const root = resolve(import.meta.dir, '../../..');
const semanticDescriptions = readThemeTokenDescriptions(root);
const maintainedStyles = productionCssSources(root);
const semantic: Record<string, string> = {};
postcss
  .parse(
    readFileSync(
      resolve(root, 'packages/core/src/themes/generated/default.css'),
      'utf8'
    )
  )
  .walkDecls((declaration) => {
    if (declaration.prop.startsWith('--frame-'))
      semantic[declaration.prop] = declaration.value;
  });
const result: Record<
  string,
  ThemeSurfaceContract & {classes: {name: string; description: string}[]}
> = {};
for (const file of Object.keys(data.contracts)) {
  const files = [
    ...(/FrameQuick(Pick|Panel)\.vue$/.test(file)
      ? ['packages/core/src/components/framework/QuickOverlay.vue']
      : []),
    file,
  ];
  const classes = new Set<string>();
  const sheets = new Map(maintainedStyles);
  for (const component of files) {
    const source = readFileSync(resolve(root, component), 'utf8');
    const {descriptor} = parseSfc(source, {filename: component});
    for (const match of descriptor.template?.content.matchAll(
      /(?<!:)class=["']([^"']+)["']/g
    ) ?? []) {
      for (const name of match[1]!.split(/\s+/).filter(Boolean))
        classes.add(name);
    }
    const css = maintainedStyles.get(component);
    if (css !== undefined) {
      sheets.delete(component);
      sheets.set(component, css);
    }
  }
  const tokens = new Map<string, CssTokenContract>();
  const publicClasses = new Map<string, {name: string; description: string}>();
  for (const [source, css] of sheets) {
    const extracted = extractCssContracts(
      css,
      source,
      [...classes],
      semantic,
      false,
      semanticDescriptions
    );
    for (const item of extracted.classes) publicClasses.set(item.name, item);
    for (const item of extracted.tokens) {
      const key = cssTokenContextKey(item);
      if (!tokens.get(key)?.description || item.description)
        tokens.set(key, item);
    }
  }
  result[file] = {
    classes: [...publicClasses.values()],
    tokens: [...tokens.values()],
  };
}
// Enforce migrated declarations at their source even when a private composition
// has no standalone documentation page or literal class in its public wrapper.
const sourceCoverage: Record<string, ThemeSurfaceContract> = {...result};
for (const [source, css] of maintainedStyles) {
  sourceCoverage[source] = extractCssContracts(
    css,
    source,
    [],
    semantic,
    true,
    semanticDescriptions
  );
}
const coverage = themeContractCoverage(sourceCoverage);
console.log(
  'CSS token coverage:',
  coverage.documented.length,
  'documented;',
  coverage.legacy.length,
  'legacy entries without descriptions'
);
if (!process.argv.includes('--dry-run')) {
  writeFileSync(
    resolve(root, 'packages/docs/src/examples/documentation/themes.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
}
console.log(
  'Recorded CSS theme contracts for',
  Object.keys(result).length,
  'surfaces'
);
