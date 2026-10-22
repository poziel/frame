import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
const component={template:'<div>retained</div>'};
const view=(id:string)=>({kind:'view' as const,id});
const action=(id:string)=>({kind:'action' as const,id});
test('activity visibility retains views, falls back, and command opening reveals hidden items',()=>{
 const frame=createFrame();frame.registerSidePanel({id:'one',label:'One',component});frame.registerSidePanel({id:'two',label:'Two',component});
 frame.openSidePanel('one');frame.viewState.collapsed.one=true;
 expect(frame.activity.setVisible(view('one'),false)).toBe(true);
 expect(frame.state.activeSidePanel).toBe('two');expect(frame.layout.primarySidebarVisible).toBe(true);
 expect(frame.sidePanels.value.map(item=>item.id)).toEqual(['one','two']);expect(frame.viewState.collapsed.one).toBe(true);
 frame.activity.setVisible(view('two'),false);expect(frame.state.activeSidePanel).toBe('');expect(frame.layout.primarySidebarVisible).toBe(false);
 expect(()=>frame.openSidePanel()).not.toThrow();expect(frame.activity.isVisible(view('one'))).toBe(true);expect(frame.state.activeSidePanel).toBe('one');expect(frame.viewState.collapsed.one).toBe(true);
 frame.dispose();
});
test('configuration, colliding contribution ids, badges, disposal and instances remain isolated',()=>{
 const frame=createFrame({activity:{hidden:[view('same')],hiddenBadges:[action('same')]}}),other=createFrame();
 const removeView=frame.registerSidePanel({id:'same',label:'View',component,badge:0});
 const removeAction=frame.registerActivityAction({id:'same',label:'Action',badge:4,run(){}});
 other.registerSidePanel({id:'same',label:'Other',component});
 expect(frame.activity.isVisible(view('same'))).toBe(false);expect(frame.activity.isVisible(action('same'))).toBe(true);expect(other.activity.isVisible(view('same'))).toBe(true);
 expect(frame.activity.isBadgeVisible(action('same'))).toBe(false);expect(frame.activity.isBadgeVisible(view('same'))).toBe(true);
 frame.activity.setBadge(view('same'),7);expect(frame.activity.items.value.find(item=>item.kind==='view')?.badge).toBe(7);
 frame.activity.setVisible(action('same'),false);expect(frame.activity.isVisible(view('same'))).toBe(false);
 removeAction();frame.registerActivityAction({id:'same',label:'New action',run(){}});expect(frame.activity.isVisible(action('same'))).toBe(true);expect(frame.activity.isBadgeVisible(action('same'))).toBe(true);
 removeView();frame.registerSidePanel({id:'same',label:'New view',component});expect(frame.activity.isVisible(view('same'))).toBe(true);
 frame.dispose();expect(frame.activity.items.value).toEqual([]);expect(frame.activity.setVisible(action('same'),true)).toBe(false);other.dispose();
});
test('all primary registrations are discoverable, hidden defaults override and moves clean presentation state',()=>{
 const frame=createFrame();frame.registerSidePanel({id:'hidden',label:'Hidden',component,showInRail:false});
 expect(frame.activity.items.value.map(item=>item.id)).toEqual(['hidden']);expect(frame.activity.isVisible(view('hidden'))).toBe(false);
 frame.activity.setVisible(view('hidden'),true);expect(frame.activity.isVisible(view('hidden'))).toBe(true);
 frame.activity.setBadgeVisible(view('hidden'),false);frame.moveView('hidden','secondary');expect(frame.activity.items.value).toEqual([]);
 frame.moveView('hidden','primary');expect(frame.activity.isVisible(view('hidden'))).toBe(true);expect(frame.activity.isBadgeVisible(view('hidden'))).toBe(true);
 expect(frame.activity.setVisible(view('missing'),false)).toBe(false);frame.dispose();
});
