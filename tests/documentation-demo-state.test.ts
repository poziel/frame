import {expect,test} from 'bun:test';
import {createDemoState,serializeUsage} from '../packages/docs/src/examples/documentation/demoState';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
test('invalid structured props retain last valid preview and reset restores omissions',()=>{
 const state=createDemoState(componentDocumentation.select!.components[0]!);
 const original=state.props.options;
 expect(state.set('options','not JSON')).toBe(false);
 expect(state.props.options).toEqual(original);
 expect(state.set('options','[{"value":"new","label":"New"}]')).toBe(true);
 state.set('disabled',true);state.reset();
 expect(state.values.disabled).toBeUndefined();
 expect(state.props.options).toEqual(original);
});
test('numeric input and fixture validation do not coerce invalid values or evaluate source',()=>{
 const state=createDemoState(componentDocumentation.slider!.components[0]!);
 expect(state.set('min','')).toBe(false);expect(state.set('min','NaN')).toBe(false);
 const checkbox=createDemoState(componentDocumentation.checkbox!.components[0]!);
 expect(checkbox.set('label','globalThis.hacked=true')).toBe(true);
 expect(serializeUsage(checkbox.contract,checkbox.props,{})).toContain('globalThis.hacked=true');
 expect(checkbox.set('label','line 1\n"quoted"')).toBe(true);
 expect(serializeUsage(checkbox.contract,checkbox.props,{})).toContain('\\n');
});
test('runtime fixtures and slot text serialize into runnable literal examples',()=>{
 const indicator=componentDocumentation['notification-panel']!.components[1]!;
 const state=createDemoState(indicator);
 const code=serializeUsage(indicator,state.props,{});
 expect(code).toContain('const frame = createFrame()');
 const menu=componentDocumentation.menus!.components[0]!;
 const menuCode=serializeUsage(menu,createDemoState(menu).props,{});
 expect(menuCode).toContain('FrameDropdownMenu');expect(menuCode).toContain(':trigger-label=');
 const checkbox=componentDocumentation.checkbox!.components[0]!;
 expect(serializeUsage(checkbox,{}, {default:'{{ 1 + 1 }}'})).toContain('v-text=');
 expect(createDemoState(componentDocumentation['color-picker']!.components[0]!).props.modelValue).toBe('#0078d4');
 const iconButton=createDemoState(componentDocumentation['icon-buttons']!.components[0]!);
 expect(iconButton.set('tooltip',false)).toBe(true);expect(iconButton.set('tooltip','Helpful label')).toBe(true);
});

test('view service examples include their required region and runnable component',()=>{
 const contract=componentDocumentation.views!.components.find(item=>item.name==='frame.registerView')!;
 const state=createDemoState(contract);
 expect(state.props.component).toBe('@component');
 expect(state.props.region).toBe('secondary');
 expect(contract.methods[0]!.parameters).toContain('region: ViewRegion');
 const code=serializeUsage(contract,state.props,{});
 expect(code).toContain("h('p', 'Preview')");
 expect(code).toContain('}, "secondary")');
 expect(code).toContain('frame.openView(');
 expect(code).toContain('serviceCleanup?.()');
});

test('multiple selection examples retain array models through UI and editor updates',()=>{
 for(const id of ['listbox','toggle-group','tag-group']){
  const state=createDemoState(componentDocumentation[id]!.components[0]!,{modelValue:['first']});
  expect(state.set('modelValue',['first','second'])).toBe(true);
  expect(state.values.modelValue).toEqual(['first','second']);
  expect(state.set('modelValue','["second"]')).toBe(true);
  expect(state.values.modelValue).toEqual(['second']);
  expect(state.set('modelValue',[42])).toBe(false);
  expect(state.values.modelValue).toEqual(['second']);
 }
});
