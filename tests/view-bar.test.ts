import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
const component={template:'<div>retained</div>'};
const view=(id:string)=>id;
test('activity visibility retains views, falls back, and command opening reveals hidden items',()=>{
 const frame=createFrame();frame.registerSidePanel({id:'one',label:'One',component});frame.registerSidePanel({id:'two',label:'Two',component});
 frame.openSidePanel('one');frame.viewState.collapsed.one=true;
 expect(frame.primaryViewBar.setVisible(view('one'),false)).toBe(true);
 expect(frame.state.activeSidePanel).toBe('two');expect(frame.layout.primarySidebarVisible).toBe(true);
 expect(frame.sidePanels.value.map(item=>item.id)).toEqual(['one','two']);expect(frame.viewState.collapsed.one).toBe(true);
 frame.primaryViewBar.setVisible(view('two'),false);expect(frame.state.activeSidePanel).toBe('');expect(frame.layout.primarySidebarVisible).toBe(false);
 expect(()=>frame.openSidePanel()).not.toThrow();expect(frame.primaryViewBar.isVisible(view('one'))).toBe(true);expect(frame.state.activeSidePanel).toBe('one');expect(frame.viewState.collapsed.one).toBe(true);
 frame.dispose();
});
test('view and navigation ids, badges, disposal and instances remain isolated',()=>{
 const frame=createFrame({primaryViewBar:{hidden:['same']}}),other=createFrame();
 const remove=frame.registerView({id:'same',label:'View',component,badge:0},'primary');
 frame.registerNavigationItem({id:'same',type:'action',label:'Action',badge:4,run(){}});
 other.registerView({id:'same',label:'Other',component},'primary');
 expect(frame.primaryViewBar.isVisible('same')).toBe(false);expect(other.primaryViewBar.isVisible('same')).toBe(true);
 frame.primaryViewBar.setBadge('same',7);expect(frame.primaryViewBar.items.value[0]?.badge).toBe(7);expect(frame.navigationBar.getItemState('same')?.badge).toBe(4);
 remove();frame.registerView({id:'same',label:'Replacement',component},'primary');expect(frame.primaryViewBar.isVisible('same')).toBe(true);
 frame.dispose();expect(frame.primaryViewBar.items.value).toEqual([]);other.dispose();
});
test('all primary registrations are discoverable, hidden defaults override and moves clean presentation state',()=>{
 const frame=createFrame();frame.registerSidePanel({id:'hidden',label:'Hidden',component,showInRail:false});
 expect(frame.primaryViewBar.items.value.map(item=>item.id)).toEqual(['hidden']);expect(frame.primaryViewBar.isVisible(view('hidden'))).toBe(false);
 frame.primaryViewBar.setVisible(view('hidden'),true);expect(frame.primaryViewBar.isVisible(view('hidden'))).toBe(true);
 frame.primaryViewBar.setBadgeVisible(view('hidden'),false);frame.moveView('hidden','secondary');expect(frame.primaryViewBar.items.value).toEqual([]);
 frame.moveView('hidden','primary');expect(frame.primaryViewBar.isVisible(view('hidden'))).toBe(true);expect(frame.primaryViewBar.isBadgeVisible(view('hidden'))).toBe(true);
 expect(frame.primaryViewBar.setVisible(view('missing'),false)).toBe(false);frame.dispose();
});
