import {expect,test} from 'bun:test';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
import {typeDocs} from '../packages/docs/src/examples/typeDocs';
import {createDemoState,serializeUsage} from '../packages/docs/src/examples/documentation/demoState';

test('searched quick input and custom quick panel have distinct public contracts',()=>{
 const input=componentDocumentation['quick-input']!.components[0]!;const panel=componentDocumentation['quick-panel']!.components[0]!;
 expect(input.name).toBe('FrameQuickPick');expect(panel.name).toBe('FrameQuickPanel');
 expect(input.props.map(p=>p.name)).toContain('searchable');expect(input.props.map(p=>p.name)).toContain('items');expect(panel.props.map(p=>p.name)).not.toContain('items');
 expect(input.emits.map(e=>e.name)).toContain('accept');expect(panel.emits.map(e=>e.name)).toEqual(['close']);
 expect(input.slots.find(slot=>slot.name==='item')?.parameters).toContain('QuickPickItem');expect(panel.slots.map(slot=>slot.name)).toEqual(expect.arrayContaining(['default','header-actions']));
 expect(typeDocs.QuickPickOptions!.properties.map(p=>p.name)).not.toContain('searchable');
});
test('both quick surfaces have explicit launch and close handling in generated usage',()=>{
 for(const id of ['quick-input','quick-panel'])for(const feature of componentDocumentation[id]!.features){
  expect(feature.code).toContain('const quickOpen = ref(false)');expect(feature.code).toContain('v-if="quickOpen"');expect(feature.code).toContain('@close="quickOpen = false"');expect(feature.code).not.toContain('CommandPalette');expect(feature.code).not.toMatch(/\bQuickInput\b/);
 }
 const input=componentDocumentation['quick-input']!.components[0]!;const state=createDemoState(input);const code=serializeUsage(input,state.props,{});
 expect(code).toContain('@accept="acceptQuick"');expect(code).toContain('selected.value = id');
 const panel=componentDocumentation['quick-panel']!.components[0]!;const panelCode=serializeUsage(panel,{title:'Review'}, {default:'All files saved.','header-actions':'Done <now>'});
 expect(panelCode).toContain('#header-actions');expect(panelCode).toContain('@click="quickOpen = false"');expect(panelCode).toContain('&lt;now>');
});
