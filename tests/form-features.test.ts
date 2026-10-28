import {expect, test} from 'bun:test';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
import {formFamilies} from '../packages/docs/src/examples/formCatalog';
import {
  createDemoState,
  serializeUsage,
} from '../packages/docs/src/examples/documentation/demoState';
import {readFileSync} from 'node:fs';
import pagePaths from '../packages/docs/src/markdown/componentPages.json';
import {parseDocument} from '../packages/docs/src/markdown/document';

test('form guides cite Reka, explain anatomy, and demonstrate supported Frame behavior', () => {
  for (const [id] of formFamilies) {
    const doc = componentDocumentation[id]!;
    const markdown = readFileSync(
      'docs/' + pagePaths[id as keyof typeof pagePaths],
      'utf8'
    );
    const page = parseDocument(markdown);
    if (id === 'input-group')
      expect(markdown).toContain(
        'https://reka-ui.com/docs/utilities/primitive'
      );
    else
      expect(markdown).toContain(
        'https://reka-ui.com/docs/components/' +
          (id === 'scrub-field'
            ? 'number-field'
            : id === 'checkbox-group'
              ? 'checkbox'
              : [
                    'color-hsv-rectangle',
                    'color-hsv-wheel',
                    'color-vhs-circle',
                  ].includes(id)
                ? 'color-area'
                : id)
      );
    expect(page.introduction.length).toBeGreaterThan(0);
    expect(markdown).toContain('### Anatomy');
    expect(doc.features.length).toBeGreaterThan(0);
    for (const feature of doc.features) {
      expect(markdown.replaceAll('\r\n', '\n')).toContain(feature.code);
      const state = createDemoState(doc.components[0]!, feature.values ?? {}, {
        includeModel: false,
      });
      for (const [name, value] of Object.entries(feature.values ?? {})) {
        expect(
          doc.components[0]!.props.some((prop) => prop.name === name)
        ).toBe(true);
        expect(state.set(name, value)).toBe(true);
      }
    }
  }
});
test('uncontrolled examples preserve optional model omissions', () => {
  const contract = componentDocumentation.autocomplete!.components[0]!;
  const state = createDemoState(
    contract,
    {defaultValue: 'Vue', options: ['Vue', 'Rust']},
    {includeModel: false}
  );
  expect(state.props.modelValue).toBeUndefined();
  expect(state.props.defaultValue).toBe('Vue');
});
test('form captions remain escaped in generated usage', () => {
  const doc = componentDocumentation.form!;
  const code = serializeUsage(
    doc.components[0]!,
    {},
    {default: 'Save <draft> "now"'}
  );
  expect(code).toContain('&lt;draft>');
  expect(code).toContain('&quot;');
});
