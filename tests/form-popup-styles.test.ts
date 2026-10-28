import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {compileStyleSource} from '../packages/core/scripts/compile-style-source';

test('standalone combobox imports its shared popup and option styles', () => {
  const root = 'packages/core/src/components/forms/';
  const source = readFileSync(`${root}FrameCombobox.vue`, 'utf8');
  expect(source).toContain("import './styles/controls.scss'");
  expect(source).not.toContain('FrameSelect.vue');
  const css = compileStyleSource(`${root}styles/controls.scss`);
  expect(css).toContain('.frame-select-popup {');
  expect(css).toContain(
    'var(--frame-select-popup-font, 12px system-ui, sans-serif)'
  );
  expect(css).toContain('.frame-select-options {');
  expect(css).toContain('var(--frame-select-options-min-height, 0)');
  expect(css).toContain('.frame-select-options > div {');
  expect(css).toContain('.frame-select-options small {');
  expect(css).toContain('.frame-select-options > .frame-select-separator {');
  expect(css).toContain(
    'var(--frame-select-options-frame-select-separator-padding, 0)'
  );
});
