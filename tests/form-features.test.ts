import {expect,test} from 'bun:test';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
import {formFamilies} from '../packages/docs/src/examples/formCatalog';
import {createDemoState,serializeUsage} from '../packages/docs/src/examples/documentation/demoState';

test('form guides cite Reka, explain anatomy, and demonstrate supported Frame behavior',()=>{
 for(const [id]of formFamilies){
  const doc=componentDocumentation[id]!;
  if(id==='input-group')expect(doc.guide?.source).toBe('https://reka-ui.com/docs/utilities/primitive');
  else expect(doc.guide?.source).toBe('https://reka-ui.com/docs/components/'+(id==='scrub-field'?'number-field':id==='checkbox-group'?'checkbox':['color-hsv-rectangle','color-hsv-wheel','color-vhs-circle'].includes(id)?'color-area':id));
  expect(doc.guide!.description.length).toBeGreaterThan(20);
  expect(doc.guide!.capabilities.length).toBeGreaterThan(0);
  expect(doc.guide!.anatomy.length).toBeGreaterThan(0);
  expect(doc.features.length).toBeGreaterThan(0);
  for(const feature of doc.features){
   expect(feature.code).toBe(serializeUsage(doc.components[0]!,feature.values??{},feature.slots??{}));
   const state=createDemoState(doc.components[0]!,feature.values??{},{includeModel:false});
   for(const [name,value] of Object.entries(feature.values??{})){
    expect(doc.components[0]!.props.some(prop=>prop.name===name)).toBe(true);
    expect(state.set(name,value)).toBe(true);
   }
  }
 }
});
test('uncontrolled examples preserve optional model omissions',()=>{
 const contract=componentDocumentation.autocomplete!.components[0]!;
 const state=createDemoState(contract,{defaultValue:'Vue',options:['Vue','Rust']},{includeModel:false});
 expect(state.props.modelValue).toBeUndefined();
 expect(state.props.defaultValue).toBe('Vue');
});
test('form captions remain escaped in generated usage',()=>{
 const doc=componentDocumentation.form!;
 const code=serializeUsage(doc.components[0]!,{}, {default:'Save <draft> "now"'});
 expect(code).toContain('&lt;draft>');expect(code).toContain('&quot;');
});
