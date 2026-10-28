import {expect, test} from 'bun:test';
import {resolve} from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import {extractCssContracts} from './css-contracts';
import {productionCssSources} from './production-css-sources';
import {compileStyleSource} from '../../../core/scripts/compile-style-source';

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
  for (const [file, css] of productionCssSources(root)) {
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
  const source = 'packages/core/src/components/actions/FrameIconButton.vue';
  const css = compileStyleSource(resolve(root, source));
  const contract = extractCssContracts(css, source, [
    'frame-icon-button-label',
  ]).tokens.find(({name}) => name === '--frame-icon-button-label-font-size');
  expect(contract?.value).toBe('inherit');
  expect(contract?.description).toContain(
    'CSS-wide keywords stay at the property use site'
  );
});
