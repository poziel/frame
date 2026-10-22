import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
import type {ActivityBarPosition,ActivityBarSize} from '../packages/core/src/frame/activity';
const Blank={render:()=>null};
test('activity placement, sizing and shell density remain independent per Frame',()=>{
 const first=createFrame({activity:{position:'top',size:'compact'}}),second=createFrame();
 expect(first.activity.position.value).toBe('top');expect(first.activity.size.value).toBe('compact');
 expect(second.activity.position.value).toBe('default');expect(second.activity.size.value).toBe('default');
 first.layout.density='compact';
 expect(first.activity.setSize('default')).toBe(true);expect(first.layout.density).toBe('compact');expect(first.activity.position.value).toBe('top');
 expect(first.activity.setPosition('bottom')).toBe(true);expect(first.activity.size.value).toBe('default');
 expect(second.activity.position.value).toBe('default');expect(second.activity.size.value).toBe('default');
 first.dispose();second.dispose();
});
test('hidden shares Customize Layout visibility and preserves presentation and active view',()=>{
 const frame=createFrame({activity:{position:'top',size:'compact'}});
 frame.registerView({id:'details',label:'Details',component:Blank},'primary');frame.openView('details');
 expect(frame.activity.setPosition('hidden')).toBe(true);expect(frame.layout.activityBarVisible).toBe(false);expect(frame.layout.activityBarPosition).toBe('top');expect(frame.state.activeSidePanel).toBe('details');
 expect(frame.activity.position.value).toBe('hidden');frame.layout.activityBarVisible=true;expect(frame.activity.position.value).toBe('top');
 frame.closeSidePanel();expect(frame.activity.setPosition('bottom')).toBe(true);expect(frame.state.sidebarVisible).toBe(false);expect(frame.layout.activityBarVisible).toBe(true);
 frame.activity.setSize('default');frame.resetLayout();expect(frame.activity.position.value).toBe('top');expect(frame.activity.size.value).toBe('compact');
 frame.dispose();expect(frame.activity.setPosition('default')).toBe(false);expect(frame.activity.setSize('compact')).toBe(false);expect(frame.activity.movePrimarySide('left')).toBe(false);
});
test('moving the primary side and moving one view use distinct public controls',()=>{
 const frame=createFrame();frame.registerView({id:'details',label:'Details',component:Blank},'primary');frame.registerView({id:'fixed',label:'Fixed',component:Blank,movable:false},'primary');
 expect(frame.activity.movePrimarySide('right')).toBe(true);expect(frame.layout.primarySide).toBe('right');expect(frame.sidePanels.value.some(view=>view.id==='details')).toBe(true);
 expect(frame.canMoveView('details','secondary')).toBe(true);expect(frame.moveView('details','secondary')).toBe(true);expect(frame.secondaryTabs.value.some(view=>view.id==='details')).toBe(true);
 expect(frame.canMoveView('fixed','secondary')).toBe(false);expect(frame.moveView('fixed','secondary')).toBe(false);
 expect(frame.activity.setPosition('floating' as ActivityBarPosition)).toBe(false);expect(frame.activity.setSize('large' as ActivityBarSize)).toBe(false);frame.dispose();
});
