import {readFileSync} from 'node:fs';
import {writeGeneratedFile as writeFileSync} from './generated-file';
import {resolve, relative, dirname} from 'node:path';
import {parse as parseSfc} from '@vue/compiler-sfc';
import postcss from 'postcss';
import data from '../src/examples/documentation/contracts.json';
import {readCssSources} from './theme-contracts/read-css-sources';
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
const sharedFiles = [
  'packages/core/src/style.css',
  'packages/core/src/components/forms/shared/inputSurfaces.css',
  ...['editor', 'terminal', 'chat', 'viewer', 'notifications'].map(
    (name) => `packages/core/src/modules/${name}/styles/index.css`
  ),
  'packages/core/src/themes/generated/default.css',
];
const semantic: Record<string, string> = {};
postcss
  .parse(readFileSync(resolve(root, sharedFiles.at(-1)!), 'utf8'))
  .walkDecls((declaration) => {
    if (declaration.prop.startsWith('--frame-'))
      semantic[declaration.prop] = declaration.value;
  });
const result: Record<
  string,
  ThemeSurfaceContract & {classes: {name: string; description: string}[]}
> = {};
for (const file of Object.keys(data.contracts)) {
  const files = [file];
  if (/FrameQuick(Input|Panel)\.vue$/.test(file))
    files.push('packages/core/src/components/framework/QuickOverlay.vue');
  const classes = new Set<string>();
  const sheets = new Map<string, string>();
  for (const shared of sharedFiles) {
    for (const [path, css] of readCssSources(resolve(root, shared)))
      sheets.set(relative(root, path).replaceAll('\\', '/'), css);
  }
  for (const component of files) {
    const source = readFileSync(resolve(root, component), 'utf8');
    const {descriptor} = parseSfc(source, {filename: component});
    for (const match of descriptor.template?.content.matchAll(
      /(?<!:)class=["']([^"']+)["']/g
    ) ?? []) {
      for (const name of match[1]!.split(/\s+/).filter(Boolean))
        classes.add(name);
    }
    for (const block of [descriptor.script, descriptor.scriptSetup]) {
      for (const match of block?.content.matchAll(
        /import\s+['"]([^'"]+\.css)['"]/g
      ) ?? []) {
        const imported = resolve(root, dirname(component), match[1]!);
        for (const [path, css] of readCssSources(imported))
          sheets.set(relative(root, path).replaceAll('\\', '/'), css);
      }
    }
    for (const style of descriptor.styles)
      sheets.set(
        component,
        (sheets.get(component) ?? '') + '\n' + style.content
      );
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
for (const [source, css] of productionCssSources(root)) {
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
