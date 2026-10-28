import {expect, test} from 'bun:test';
import {readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {parse as parseSfc} from '@vue/compiler-sfc';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import {extractCssContracts} from './css-contracts';

const root = resolve(import.meta.dir, '../../../..');
const keywords = new Set([
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
]);

test('CSS-wide fallback keywords never become private default declarations', () => {
  const violations: string[] = [];
  for (const relative of readdirSync(resolve(root, 'packages/core/src'), {
    recursive: true,
  }).map(String)) {
    const file = relative.replaceAll('\\', '/');
    if (!/\.(css|vue)$/.test(file) || file.includes('themes/generated/'))
      continue;
    const content = readFileSync(
      resolve(root, 'packages/core/src', file),
      'utf8'
    );
    const css = file.endsWith('.vue')
      ? parseSfc(content)
          .descriptor.styles.map((style) => style.content)
          .join('\n')
      : content;
    postcss.parse(css).walkDecls((declaration) => {
      if (!declaration.prop.startsWith('--_frame-default-')) return;
      if (keywords.has(declaration.value.trim().toLowerCase()))
        violations.push(`${file}: ${declaration.prop}`);
      valueParser(declaration.value).walk((node) => {
        if (node.type !== 'function' || node.value !== 'var') return;
        const comma = node.nodes.findIndex(
          (part) => part.type === 'div' && part.value === ','
        );
        if (
          comma >= 0 &&
          keywords.has(
            valueParser
              .stringify(node.nodes.slice(comma + 1))
              .trim()
              .toLowerCase()
          )
        )
          violations.push(
            `${file}: ${declaration.prop}: nested CSS-wide fallback`
          );
      });
    });
  }
  expect(violations).toEqual([]);
});

test('icon label font size inherits the actual font-size property', () => {
  const css = readFileSync(
    resolve(root, 'packages/core/src/style.css'),
    'utf8'
  );
  const contract = extractCssContracts(css, 'style.css', [
    'frame-icon-button-label',
  ]).tokens.find(({name}) => name === '--frame-icon-button-label-font-size');
  expect(contract?.value).toBe('inherit');
  expect(contract?.description).toContain(
    'CSS-wide keywords stay at the property use site'
  );
});
