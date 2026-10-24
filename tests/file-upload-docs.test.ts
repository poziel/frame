import { expect, test } from 'bun:test';
import { fileUploadExamples } from '../packages/docs/src/examples/fileUploadCatalog';
import { readFileSync } from 'node:fs';
import { parse, compileTemplate } from 'vue/compiler-sfc';
test('upload pages have complete examples and live documentation routes', () => {
  const catalog = readFileSync('packages/docs/src/examples/componentCatalog.ts', 'utf8');
  expect(catalog).toContain('...fileUploadExamples');
  const registry = readFileSync('packages/docs/src/examples/documentation/contracts.json', 'utf8');
  for (const example of fileUploadExamples) {
    expect(registry).toContain(`"${example.id}"`);
    const { descriptor, errors } = parse(example.code);
    expect(errors).toEqual([]);
    expect(descriptor.scriptSetup).not.toBeNull();
    expect(compileTemplate({source:descriptor.template!.content,filename:example.id+'.vue',id:example.id}).errors).toEqual([]);
  }
});
