import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
const view=(id:string)=>({id,label:id,component:{render:()=>null}});
test('panel position and alignment state is isolated and alignment is suspended, not lost, for side docking',()=>{
 const first=createFrame({panel:{position:'top',alignment:'justify',display:'icons'}}),second=createFrame();
 expect(first.panel.position.value).toBe('top');expect(first.panel.display.value).toBe('icons');expect(second.panel.position.value).toBe('bottom');
 expect(first.panel.setPosition('right')).toBe(true);expect(first.panel.canAlign.value).toBe(false);
 expect(first.panel.setAlignment('left')).toBe(false);expect(first.panel.alignment.value).toBe('justify');
 first.panel.setPosition('bottom');expect(first.panel.canAlign.value).toBe(true);expect(first.panel.alignment.value).toBe('justify');
 expect(first.panel.setDisplay('text')).toBe(true);first.resetLayout();expect(first.panel.position.value).toBe('top');expect(first.panel.display.value).toBe('icons');
 first.dispose();second.dispose();expect(first.panel.setPosition('left')).toBe(false);
});
test('panel hides views without unregistering, repairs selection, and explicitly opening reveals the same registration',()=>{
 const frame=createFrame();const remove=frame.registerBottomTab(view('terminal'));frame.registerBottomTab(view('problems'));frame.openBottomPanel('terminal');
 const original=frame.bottomTabs.value[0];frame.panel.setVisible('terminal',false);expect(frame.state.activeBottomTab).toBe('problems');expect(frame.bottomTabs.value).toHaveLength(2);
 frame.openBottomPanel('terminal');expect(frame.panel.isVisible('terminal')).toBe(true);expect(frame.bottomTabs.value[0]).toBe(original);
 frame.setViewVisible('terminal',false);expect(frame.panel.isVisible('terminal')).toBe(false);
 frame.panel.setVisible('problems',false);expect(frame.state.activeBottomTab).toBe('');expect(frame.state.panelVisible).toBe(true);
 frame.openBottomPanel();expect(frame.state.activeBottomTab).toBe('terminal');
 frame.panel.setBadge('terminal',0);expect(frame.panel.items.value.find(item=>item.id==='terminal')?.badge).toBe(0);
 frame.panel.setBadgeVisible('terminal',false);expect(frame.panel.isBadgeVisible('terminal')).toBe(false);
 frame.moveView('terminal','secondary');frame.moveView('terminal','bottom');expect(frame.panel.isBadgeVisible('terminal')).toBe(false);
 remove();frame.registerBottomTab(view('terminal'));expect(frame.panel.isBadgeVisible('terminal')).toBe(true);expect(frame.panel.items.value.find(item=>item.id==='terminal')?.badge).toBeUndefined();
 frame.panel.hide();expect(frame.layout.panelVisible).toBe(false);frame.dispose();expect(frame.panel.items.value).toEqual([]);
});
test('panel initial visibility and badges follow registered view ownership',()=>{
 const frame=createFrame({panel:{hidden:['hidden'],hiddenBadges:['hidden']}});
 frame.registerBottomTab({...view('hidden'),badge:4});frame.registerBottomTab(view('visible'));
 expect(frame.panel.isVisible('hidden')).toBe(false);expect(frame.state.activeBottomTab).toBe('visible');expect(frame.panel.isBadgeVisible('hidden')).toBe(false);
 expect(frame.panel.setVisible('missing',false)).toBe(false);expect(frame.panel.setBadge('missing',1)).toBe(false);
 frame.openBottomPanel('hidden');expect(frame.panel.isVisible('hidden')).toBe(true);frame.dispose();
});
