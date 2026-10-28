import {expect, test} from 'bun:test';
import {resolve} from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import {extractCssContracts} from './css-contracts';
import {themeContractCoverage} from './coverage';
import {productionCssSources} from './production-css-sources';
import {readThemeTokenDescriptions} from './theme-token-descriptions';

const root = resolve(import.meta.dir, '../../../..');

test('production private defaults own real comments and public token annotations', () => {
  const violations: string[] = [];
  for (const [source, css] of productionCssSources(root)) {
    postcss.parse(css).walkDecls((declaration) => {
      if (!declaration.prop.startsWith('--_frame-default-')) return;
      const previous = declaration.prev();
      const comment = previous?.type === 'comment' ? previous.text : '';
      if (
        !/@token\s+--frame-[\w-]+/.test(comment) ||
        !comment.replace(/\s*@token\s+--frame-[\w-]+/, '').trim()
      )
        violations.push(`${source}: ${declaration.prop}`);
    });
  }
  expect(violations).toEqual([]);
});

test('production public fallbacks follow the declaration convention', () => {
  const violations: string[] = [];
  const keywords = new Set([
    'inherit',
    'initial',
    'unset',
    'revert',
    'revert-layer',
  ]);
  for (const [source, css] of productionCssSources(root)) {
    postcss.parse(css).walkDecls((declaration) => {
      valueParser(declaration.value).walk((node) => {
        if (
          node.type !== 'function' ||
          node.value !== 'var' ||
          !node.nodes[0]?.value.startsWith('--frame-')
        )
          return;
        const comma = node.nodes.findIndex(
          (part) => part.type === 'div' && part.value === ','
        );
        if (comma < 0) return;
        const fallback = valueParser
          .stringify(node.nodes.slice(comma + 1))
          .trim();
        const isPrivateDefault = /^var\(\s*--_frame-default-[\w-]+\s*\)$/.test(
          fallback
        );
        const isKeywordAtUse =
          !declaration.prop.startsWith('--') &&
          keywords.has(fallback.toLowerCase());
        if (!isPrivateDefault && !isKeywordAtUse)
          violations.push(
            `${source}: ${declaration.prop}: ${node.nodes[0]?.value}`
          );
      });
    });
  }
  expect(violations).toEqual([]);
});

test('coverage is derived from source and never exposes private aliases', () => {
  const shared = readThemeTokenDescriptions(root);
  const surfaces = Object.fromEntries(
    [...productionCssSources(root)].map(([source, css]) => [
      source,
      extractCssContracts(css, source, [], {}, true, shared),
    ])
  );
  const coverage = themeContractCoverage(surfaces);
  expect(coverage.documented.length).toBeGreaterThan(0);
  expect(coverage.legacy).toEqual([]);
  expect(() =>
    themeContractCoverage({
      broken: {
        tokens: [
          {
            name: '--frame-broken',
            value: 'var(--_frame-default-broken)',
            description: 'Broken alias.',
            selector: '.broken',
            source: 'broken.css',
          },
        ],
      },
    })
  ).toThrow('Private CSS default leaked');
});

test('coverage rejects a newly undocumented selector context', () => {
  expect(() =>
    themeContractCoverage({
      control: {
        tokens: [
          {
            name: '--frame-new-token',
            value: '',
            description: '',
            selector: '.control',
            source: 'control.css',
          },
        ],
      },
    })
  ).toThrow('Missing CSS token documentation');
});
