import { expect, test } from 'bun:test';
import { parse, compileTemplate } from 'vue/compiler-sfc';
import { formExamples } from '../packages/docs/src/examples/formCatalog';

test('new form code examples are complete Vue components with declared bindings', () => {
  for (const example of formExamples) {
    const { descriptor, errors } = parse(example.code);
    expect(errors).toEqual([]);
    expect(descriptor.scriptSetup).not.toBeNull();
    expect(descriptor.template).not.toBeNull();
    expect(compileTemplate({ source: descriptor.template!.content, filename: `${example.id}.vue`, id: example.id }).errors).toEqual([]);
    if (example.code.includes('v-model="value"')) expect(example.code).toContain('const value =');
    if (example.group === 'Dates and times') expect(example.code).toContain('shallowRef<');
    if (['rating','tag-group','color-area','color-field','color-slider','color-swatch-picker'].includes(example.id)) {
      expect(example.code).toContain('aria-label=');
      expect(example.properties.some(property => property.name === 'label')).toBe(false);
    }
  }
});
