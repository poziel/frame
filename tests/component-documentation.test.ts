import { expect, test } from 'bun:test';
import { componentDocumentation } from '../packages/docs/src/examples/documentation/registry';
import { componentExamples } from '../packages/docs/src/examples/componentCatalog';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import { existsSync } from 'node:fs';
test('every catalog page has audited source contracts and distinct working features', () => {
  expect(Object.keys(componentDocumentation).sort()).toEqual(componentExamples.map(item => item.id).sort());
  for (const doc of Object.values(componentDocumentation)) {
    expect(doc.features.length).toBeGreaterThan(0);
    expect(new Set(doc.features.map(item => item.id)).size).toBe(doc.features.length);
    for (const component of doc.components) expect(existsSync(component.source)).toBe(true);
  }
});
test('checkbox API distinguishes real defaults and exposes its model event and default slot', () => {
  const checkbox = componentDocumentation.checkbox!.components[0]!;
  expect(checkbox.props.find(item => item.name === 'modelValue')?.default).toEqual({kind:'literal',value:'false'});
  expect(checkbox.props.find(item => item.name === 'disabled')?.default).toEqual({kind:'literal',value:'false'});
  expect(checkbox.props.find(item => item.name === 'label')?.default.kind).toBe('omitted');
  expect(checkbox.emits.map(item => item.name)).toContain('update:modelValue');
  expect(checkbox.slots.map(item => item.name)).toContain('default');
});

test('component snapshots match their actual source declarations',()=>{
 for(const doc of Object.values(componentDocumentation))for(const component of doc.components)if(component.sourceHash)
  expect(createHash('sha256').update(readFileSync(component.source)).digest('hex')).toBe(component.sourceHash);
});
