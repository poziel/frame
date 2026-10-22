import {expect,test} from 'bun:test';
import {catalogGroups} from '../packages/docs/src/examples/catalogNavigation';
import {componentExamples} from '../packages/docs/src/examples/componentCatalog';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
const legacy=['buttons','icon-buttons','text-input','checkbox','select','slider','text-area','color-picker','setting-controls','icons','code-block','loader','loading','navigation','modals','settings','notifications','quick-input'];
test('all original Core pages remain discoverable beside the Reka forms',()=>{
 const groups=catalogGroups();expect(groups[0]!.title).toBe('Actions');
 const entries=groups.flatMap(group=>group.items);
 expect(entries.length).toBe(componentExamples.filter(item=>item.group!=='Features').length);
 for(const id of legacy){expect(entries.some(item=>item.id===id)).toBe(true);expect(componentDocumentation[id]!.features.length).toBeGreaterThan(1);}
 const forms=groups.find(group=>group.title==='Form controls')!.items.map(item=>item.id);
 expect(forms.slice(0,6)).toEqual(['text-input','text-area','checkbox','select','slider','setting-controls']);expect(forms).toContain('autocomplete');
 expect(catalogGroups(false,'FrameTextArea').flatMap(group=>group.items).map(item=>item.id)).toEqual(['text-area']);
 expect(catalogGroups(false,'','Display').flatMap(group=>group.items).map(item=>item.id)).toContain('icons');
 expect(catalogGroups(true).flatMap(group=>group.items).every(item=>item.group==='Features')).toBe(true);
});
test('original Select scenarios remain alongside task-oriented native controls',()=>{
 const examples=componentDocumentation.select!.features;
 expect(examples.length).toBeGreaterThanOrEqual(4);
 const options=examples.flatMap(feature=>feature.values?.options as Record<string,unknown>[]??[]);
 expect(options.some(option=>option.type==='separator')).toBe(true);
 expect(options.some(option=>option.disabled===true)).toBe(true);
 expect(options.some(option=>typeof option.description==='string')).toBe(true);
 for(const id of ['buttons','icon-buttons','text-input','checkbox','slider','text-area','icons','code-block','loader','loading'])expect(componentDocumentation[id]!.features[0]!.title).not.toBe('Basic usage');
});
