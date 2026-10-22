import {expect,test} from 'bun:test';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
import {createDemoState,serializeUsage} from '../packages/docs/src/examples/documentation/demoState';
import {hydrateDemoValue,serializeDemoValue} from '../packages/docs/src/examples/documentation/formsDemo';

test('all form families retain their inherited root props, emits, and actual defaults',()=>{
 const calendar=componentDocumentation.calendar!.components[0]!;
 expect(calendar.props.map(p=>p.name)).toContain('isDateUnavailable');
 expect(calendar.props.find(p=>p.name==='numberOfMonths')?.default).toEqual({kind:'literal',value:'1'});
 expect(calendar.props.find(p=>p.name==='as')?.default).toEqual({kind:'literal',value:'"div"'});
 expect(calendar.emits.find(event=>event.name==='update:modelValue')?.parameters).toContain('DateValue');
 const field=componentDocumentation.field!.components[0]!;
 expect(field.props.map(p=>p.name)).toContain('validationMode');
 expect(field.props.find(p=>p.name==='validate')?.control).toBe('fixture');
 expect(componentDocumentation.form!.components[0]!.emits.map(event=>event.name)).toContain('formSubmit');
 expect(componentDocumentation['date-picker']!.components[0]!.props.map(p=>p.name)).toContain('open');
});

test('date demo state validates and hydrates ISO models while retaining the last valid value',()=>{
 const state=createDemoState(componentDocumentation['date-field']!.components[0]!);
 expect(state.props.modelValue).toBe('2026-10-21');
 expect(state.set('modelValue','"2027-02-03"')).toBe(true);
 expect(hydrateDemoValue(state.contract.name,'modelValue',state.props.modelValue)).toHaveProperty('year',2027);
 expect(state.set('modelValue','"not-a-date"')).toBe(false);
 expect(state.props.modelValue).toBe('2027-02-03');
 expect(state.set('modelValue','2027-02-04')).toBe(true);
 expect(state.set('minValue','2027-02-01')).toBe(true);
 expect(serializeDemoValue(hydrateDemoValue(state.contract.name,'modelValue',state.props.modelValue))).toBe('2027-02-04');
 const snippet=serializeUsage(state.contract,state.props,{});
 expect(snippet).toContain('shallowRef<DateValue | null>');
 expect(snippet).toContain('parseDate("2027-02-04")');
 state.reset();expect(state.props.modelValue).toBe('2026-10-21');
});

test('time/range/collection models and new option shapes are usable from demo editors',()=>{
 for(const id of ['time-field','time-range-field','date-range-field']){
  const state=createDemoState(componentDocumentation[id]!.components[0]!);
  expect(()=>hydrateDemoValue(state.contract.name,'modelValue',state.props.modelValue)).not.toThrow();
 }
 const autocomplete=createDemoState(componentDocumentation.autocomplete!.components[0]!);
 expect(autocomplete.set('options','["Vue","Rust"]')).toBe(true);
 const tags=createDemoState(componentDocumentation['tag-group']!.components[0]!);
 expect(tags.set('items','[{"value":"vue","label":"Vue"}]')).toBe(true);
 const pin=createDemoState(componentDocumentation['pin-input']!.components[0]!);
 expect(pin.props.modelValue).toEqual([]);
 expect(pin.set('modelValue','["1","2"]')).toBe(true);
 expect(pin.set('modelValue','{"invalid":true}')).toBe(false);
});
