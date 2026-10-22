import {test,expect} from 'bun:test';
import {generalFamilies} from '../packages/docs/src/examples/generalCatalog';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
import {readFileSync} from 'node:fs';
test('General catalog covers every new Reka family with truthful task examples and complete contracts',()=>{
 expect(generalFamilies.length).toBe(23);
 for(const [id,name] of generalFamilies){
  const doc=componentDocumentation['general-'+id]!;
  expect(doc.components[0]!.name).toBe('Frame'+name);
  expect(readFileSync(doc.components[0]!.source,'utf8')).toContain("from 'reka-ui'");
  expect(doc.features.length).toBe(2);
  for(const feature of doc.features)for(const prop of Object.keys(feature.values??{}))expect(doc.components[0]!.props.some(p=>p.name===prop)).toBe(true);
 }
 expect(readFileSync(componentDocumentation.tooltips!.components[0]!.source,'utf8')).toContain('TooltipRoot');
});

import {createDemoState} from '../packages/docs/src/examples/documentation/demoState';
test('General structured editors retain last valid values and accept each control model',()=>{
 const accordion=createDemoState(componentDocumentation['general-accordion']!.components[0]!);
 expect(accordion.set('items','[{"value":"help","title":"Help"}]')).toBe(true);
 expect(accordion.set('items','[{"value":"bad"}]')).toBe(false);
 expect(accordion.values.items).toEqual([{value:'help',title:'Help'}]);
 expect(accordion.set('defaultValue','["help"]')).toBe(true);
 const stepper=createDemoState(componentDocumentation['general-stepper']!.components[0]!);
 expect(stepper.set('items','[{"step":1,"label":"Review"}]')).toBe(true);
 const tree=createDemoState(componentDocumentation['general-tree']!.components[0]!);
 expect(tree.set('modelValue',{id:'one',label:'One'})).toBe(true);
 expect(tree.set('modelValue',[{id:'one',label:'One'}])).toBe(true);
 expect(tree.set('modelValue',[{id:'missing-label'}])).toBe(false);
 const progress=createDemoState(componentDocumentation['general-progress']!.components[0]!);
 expect(progress.set('modelValue',null)).toBe(true);
});
