import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';
const view=(id:string)=>({id,label:id,component:{render:()=>null}});

test('custom pane toolbars opt out of the header per view without affecting other instances or registrations',()=>{
 const frame=createFrame(),other=createFrame();
 frame.registerBottomTab({...view('matrix'),showHeader:false});
 frame.registerBottomTab(view('output'));other.registerBottomTab(view('matrix'));
 frame.openBottomPanel('matrix');
 expect(frame.bottomTabs.value.find(tab=>tab.id==='matrix')?.showHeader).toBe(false);
 expect(frame.bottomTabs.value.find(tab=>tab.id==='output')?.showHeader).toBeUndefined();
 expect(other.bottomTabs.value[0]?.showHeader).toBeUndefined();
 frame.moveView('matrix','secondary');frame.openView('matrix');
 expect(frame.secondaryTabs.value.find(tab=>tab.id==='matrix')?.showHeader).toBe(false);
 frame.closeSecondaryPanel();frame.openView('matrix');
 expect(frame.layout.secondarySidebarVisible).toBe(true);
 frame.dispose();other.dispose();
});
test('panel position and alignment state is isolated and alignment is suspended, not lost, for side docking',()=>{
 const first=createFrame({panel:{position:'top',alignment:'justify'},panelViewBar:{display:'icons'}}),second=createFrame();
 expect(first.panel.position.value).toBe('top');expect(first.panelViewBar.display.value).toBe('icons');expect(second.panel.position.value).toBe('bottom');
 expect(first.panel.setPosition('right')).toBe(true);expect(first.panel.canAlign.value).toBe(false);
 expect(first.panel.setAlignment('left')).toBe(false);expect(first.panel.alignment.value).toBe('justify');
 first.panel.setPosition('bottom');expect(first.panel.canAlign.value).toBe(true);expect(first.panel.alignment.value).toBe('justify');
 expect(first.panelViewBar.setDisplay('text')).toBe(true);first.resetLayout();expect(first.panel.position.value).toBe('top');expect(first.panelViewBar.display.value).toBe('icons');
 first.dispose();second.dispose();expect(first.panel.setPosition('left')).toBe(false);
});
test('panel hides views without unregistering, repairs selection, and explicitly opening reveals the same registration',()=>{
 const frame=createFrame();const remove=frame.registerBottomTab(view('terminal'));frame.registerBottomTab(view('problems'));frame.openBottomPanel('terminal');
 const original=frame.bottomTabs.value[0];frame.panelViewBar.setVisible('terminal',false);expect(frame.state.activeBottomTab).toBe('problems');expect(frame.bottomTabs.value).toHaveLength(2);
 frame.openBottomPanel('terminal');expect(frame.panelViewBar.isVisible('terminal')).toBe(true);expect(frame.bottomTabs.value[0]).toBe(original);
 frame.setViewVisible('terminal',false);expect(frame.panelViewBar.isVisible('terminal')).toBe(false);
 frame.panelViewBar.setVisible('problems',false);expect(frame.state.activeBottomTab).toBe('');expect(frame.state.panelVisible).toBe(true);
 frame.openBottomPanel();expect(frame.state.activeBottomTab).toBe('terminal');
 frame.panelViewBar.setBadge('terminal',0);expect(frame.panelViewBar.items.value.find(item=>item.id==='terminal')?.badge).toBe(0);
 frame.panelViewBar.setBadgeVisible('terminal',false);expect(frame.panelViewBar.isBadgeVisible('terminal')).toBe(false);
 frame.moveView('terminal','secondary');frame.moveView('terminal','bottom');expect(frame.panelViewBar.isBadgeVisible('terminal')).toBe(false);
 remove();frame.registerBottomTab(view('terminal'));expect(frame.panelViewBar.isBadgeVisible('terminal')).toBe(true);expect(frame.panelViewBar.items.value.find(item=>item.id==='terminal')?.badge).toBeUndefined();
 frame.panel.hide();expect(frame.layout.panelVisible).toBe(false);frame.dispose();expect(frame.panelViewBar.items.value).toEqual([]);
});
test('panel initial visibility and badges follow registered view ownership',()=>{
 const frame=createFrame({panelViewBar:{hidden:['hidden'],hiddenBadges:['hidden']}});
 frame.registerBottomTab({...view('hidden'),badge:4});frame.registerBottomTab(view('visible'));
 expect(frame.panelViewBar.isVisible('hidden')).toBe(false);expect(frame.state.activeBottomTab).toBe('visible');expect(frame.panelViewBar.isBadgeVisible('hidden')).toBe(false);
 expect(frame.panelViewBar.setVisible('missing',false)).toBe(false);expect(frame.panelViewBar.setBadge('missing',1)).toBe(false);
 frame.openBottomPanel('hidden');expect(frame.panelViewBar.isVisible('hidden')).toBe(true);frame.dispose();
});
