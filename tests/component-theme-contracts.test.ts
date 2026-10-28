import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';

test('documented theme variables are declared or consumed by production component CSS', () => {
  for (const doc of Object.values(componentDocumentation))
    for (const token of doc.tokens) {
      expect(token.source.startsWith('packages/core/')).toBe(true);
      expect(readFileSync(token.source, 'utf8')).toMatch(
        new RegExp(
          '(?:var\\(\\s*' +
            token.name +
            '(?:\\s*[,)]|\\s*$)|' +
            token.name +
            '\\s*:)'
        )
      );
      expect(typeof token.value).toBe('string');
    }
});
test('FrameIcon does not inherit FrameIconButton-only variables through a class prefix', () => {
  expect(
    componentDocumentation.icons!.tokens.some(
      (token) =>
        token.selector === '.frame-icon-button' ||
        token.selector.includes(':not(.frame-icon)')
    )
  ).toBe(false);
});
