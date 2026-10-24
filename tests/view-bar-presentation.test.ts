import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
import type {ViewBarPosition,ViewBarSize} from '../packages/core/src/frame/primaryViewBar';
const Blank={render:()=>null};
test('activity placement, sizing and shell density remain independent per Frame',()=>{
 const first=createFrame({primaryViewBar:{position:'top',size:'compact'}}),second=createFrame();
 expect(first.primaryViewBar.position.value).toBe('top');expect(first.primaryViewBar.size.value).toBe('compact');
 expect(second.primaryViewBar.position.value).toBe('default');expect(second.primaryViewBar.size.value).toBe('default');
 first.layout.density='compact';
 expect(first.primaryViewBar.setSize('default')).toBe(true);expect(first.layout.density).toBe('compact');expect(first.primaryViewBar.position.value).toBe('top');
 expect(first.primaryViewBar.setPosition('bottom')).toBe(true);expect(first.primaryViewBar.size.value).toBe('default');
 expect(second.primaryViewBar.position.value).toBe('default');expect(second.primaryViewBar.size.value).toBe('default');
 first.dispose();second.dispose();
});
test('hidden shares Customize Layout visibility and preserves presentation and active view',()=>{
 const frame=createFrame({primaryViewBar:{position:'top',size:'compact'}});
 frame.registerView({id:'details',label:'Details',component:Blank},'primary');frame.openView('details');
 expect(frame.primaryViewBar.setPosition('hidden')).toBe(true);expect(frame.layout.primaryViewBarVisible).toBe(false);expect(frame.layout.primaryViewBarPosition).toBe('top');expect(frame.state.activeSidePanel).toBe('details');
 expect(frame.primaryViewBar.position.value).toBe('hidden');frame.layout.primaryViewBarVisible=true;expect(frame.primaryViewBar.position.value).toBe('top');
 frame.closeSidePanel();expect(frame.primaryViewBar.setPosition('bottom')).toBe(true);expect(frame.state.sidebarVisible).toBe(false);expect(frame.layout.primaryViewBarVisible).toBe(true);
 frame.primaryViewBar.setSize('default');frame.resetLayout();expect(frame.primaryViewBar.position.value).toBe('top');expect(frame.primaryViewBar.size.value).toBe('compact');
 frame.dispose();expect(frame.primaryViewBar.setPosition('default')).toBe(false);expect(frame.primaryViewBar.setSize('compact')).toBe(false);expect(frame.primaryViewBar.movePrimarySide('left')).toBe(false);
});
test('moving the primary side and moving one view use distinct public controls',()=>{
 const frame=createFrame();frame.registerView({id:'details',label:'Details',component:Blank},'primary');frame.registerView({id:'fixed',label:'Fixed',component:Blank,movable:false},'primary');
 expect(frame.primaryViewBar.movePrimarySide('right')).toBe(true);expect(frame.layout.primarySide).toBe('right');expect(frame.sidePanels.value.some(view=>view.id==='details')).toBe(true);
 expect(frame.canMoveView('details','secondary')).toBe(true);expect(frame.moveView('details','secondary')).toBe(true);expect(frame.secondaryTabs.value.some(view=>view.id==='details')).toBe(true);
 expect(frame.canMoveView('fixed','secondary')).toBe(false);expect(frame.moveView('fixed','secondary')).toBe(false);
 expect(frame.primaryViewBar.setPosition('floating' as ViewBarPosition)).toBe(false);expect(frame.primaryViewBar.setSize('large' as ViewBarSize)).toBe(false);frame.dispose();
});
