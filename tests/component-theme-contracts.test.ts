import {expect, test} from 'bun:test';
import {compileStyleSource} from '../packages/core/scripts/compile-style-source';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';

test('documented theme variables are declared or consumed by production component CSS', () => {
  const styles = new Map<string, string>();
  for (const doc of Object.values(componentDocumentation))
    for (const token of doc.tokens) {
      expect(token.source.startsWith('packages/core/')).toBe(true);
      if (!styles.has(token.source))
        styles.set(token.source, compileStyleSource(token.source));
      expect(styles.get(token.source)).toMatch(
        new RegExp(
          '(?:var\\(\\s*' + token.name + '(?=[,\\s)])|' + token.name + '\\s*:)'
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

test('quick surfaces document the tokens consumed by their shared overlay', () => {
  for (const id of ['quick-input', 'quick-panel']) {
    const width = componentDocumentation[id]!.tokens.find(
      (token) => token.name === '--frame-palette-width'
    );
    expect(width?.value).toBe('600px');
    expect(width?.source).toBe(
      'packages/core/src/components/framework/QuickOverlay.vue'
    );
  }
});

test('theme contracts retain styles consumed across component boundaries', () => {
  for (const [id, name, owner] of [
    [
      'settings',
      '--frame-settings-settings-tree-margin',
      'components/framework/SettingsNavigation.vue',
    ],
    [
      'setting-controls',
      '--frame-setting-field-gap',
      'components/framework/SettingControl.vue',
    ],
    [
      'combobox',
      '--frame-select-popup-font',
      'components/forms/styles/controls.scss',
    ],
  ]) {
    const token = componentDocumentation[id!]!.tokens.find(
      (entry) => entry.name === name
    );
    expect(token?.source).toBe('packages/core/src/' + owner);
  }
});
