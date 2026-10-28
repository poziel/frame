import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {compileStyleSource} from '../packages/core/scripts/compile-style-source';
import {extractCssContracts} from '../packages/docs/scripts/theme-contracts/css-contracts';

test('standalone combobox imports its shared popup and option styles', () => {
  const root = 'packages/core/src/components/forms/';
  const source = readFileSync(`${root}FrameCombobox.vue`, 'utf8');
  expect(source).toContain("import './styles/controls.scss'");
  expect(source).not.toContain('FrameSelect.vue');
  const css = compileStyleSource(`${root}styles/controls.scss`);
  const tokens = extractCssContracts(
    css,
    `${root}styles/controls.scss`,
    [],
    {},
    true
  ).tokens;
  const fallback = (name: string) =>
    tokens.find((token) => token.name === name)?.value;
  expect(css).toContain('.frame-select-popup {');
  expect(fallback('--frame-select-popup-font')).toBe(
    '12px system-ui, sans-serif'
  );
  expect(css).toContain('.frame-select-options {');
  expect(fallback('--frame-select-options-min-height')).toBe('0');
  expect(css).toContain('.frame-select-options > div {');
  expect(css).toContain('.frame-select-options small {');
  expect(css).toContain('.frame-select-options > .frame-select-separator {');
  expect(
    fallback('--frame-select-options-frame-select-separator-padding')
  ).toBe('0');
});
