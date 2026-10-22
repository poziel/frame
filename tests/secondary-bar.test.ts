import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
const content={render:()=>null};

test('secondary view-bar configuration and runtime presentation are isolated and resettable',()=>{
 const first=createFrame({secondaryBar:{display:'icons',size:'compact'}}),second=createFrame();
 expect(first.secondaryBar.display.value).toBe('icons');expect(first.secondaryBar.size.value).toBe('compact');
 expect(second.secondaryBar.display.value).toBe('both');expect(second.secondaryBar.size.value).toBe('default');
 expect(first.secondaryBar.moveSide('left')).toBe(true);expect(first.layout.primarySide).toBe('right');expect(first.secondaryBar.side.value).toBe('left');expect(second.layout.primarySide).toBe('left');
 expect(first.secondaryBar.setDisplay('text')).toBe(true);expect(first.secondaryBar.setSize('default')).toBe(true);
 first.resetLayout();expect(first.secondaryBar.display.value).toBe('icons');expect(first.secondaryBar.size.value).toBe('compact');expect(first.secondaryBar.side.value).toBe('right');
 expect(first.secondaryBar.setDisplay('invalid' as never)).toBe(false);expect(first.secondaryBar.setSize('large' as never)).toBe(false);expect(first.secondaryBar.moveSide('center' as never)).toBe(false);
 first.dispose();expect(first.secondaryBar.setDisplay('both')).toBe(false);expect(first.secondaryBar.moveSide('left')).toBe(false);second.dispose();
});

test('hiding root secondary views repairs selection and explicit reopening retains registration and content',()=>{
 const frame=createFrame({secondaryBar:{hidden:['hidden']}});
 const removeFirst=frame.registerSecondaryTab({id:'first',label:'First',component:content,props:{draft:'keep me'}});
 frame.registerSecondaryTab({id:'second',label:'Second',component:content});
 frame.registerSecondaryTab({id:'hidden',label:'Hidden initially',component:content});
 const first=frame.secondaryTabs.value[0]!;
 frame.openSecondaryPanel('first');
 expect(frame.secondaryBar.setVisible('first',false)).toBe(true);expect(frame.state.activeSecondaryTab).toBe('second');
 expect(frame.isViewVisible('first')).toBe(false);expect(frame.secondaryTabs.value).toHaveLength(3);expect(frame.secondaryTabs.value[0]).toBe(first);expect(first.props?.draft).toBe('keep me');
 expect(frame.secondaryBar.isVisible('hidden')).toBe(false);expect(frame.secondaryBar.setVisible('missing',false)).toBe(false);
 frame.setViewVisible('second',false);expect(frame.state.activeSecondaryTab).toBe('');expect(frame.layout.secondarySidebarVisible).toBe(false);
 frame.openSecondaryPanel('first');expect(frame.secondaryBar.isVisible('first')).toBe(true);expect(frame.state.activeSecondaryTab).toBe('first');expect(frame.secondaryTabs.value[0]).toBe(first);
 removeFirst();expect(frame.secondaryBar.items.value.map(item=>item.id)).toEqual(['second','hidden']);
 expect(frame.secondaryBar.setVisible('first',true)).toBe(false);
 frame.openSecondaryPanel();expect(frame.state.activeSecondaryTab).toBe('second');expect(frame.secondaryBar.isVisible('second')).toBe(true);
 frame.dispose();expect(frame.secondaryBar.items.value).toHaveLength(0);expect(frame.secondaryBar.isVisible('second')).toBe(false);
});

test('secondary badges can be hidden or updated without changing availability and clean up on unregister',()=>{
 const frame=createFrame({secondaryBar:{hiddenBadges:['one']}}),other=createFrame();
 const remove=frame.registerSecondaryTab({id:'one',label:'One',component:content,badge:4});
 other.registerSecondaryTab({id:'one',label:'Other',component:content,badge:9});
 expect(frame.secondaryBar.items.value[0]!.badge).toBe(4);expect(frame.secondaryBar.isBadgeVisible('one')).toBe(false);expect(other.secondaryBar.isBadgeVisible('one')).toBe(true);
 expect(frame.secondaryBar.setBadgeVisible('one',true)).toBe(true);expect(frame.secondaryBar.setBadge('one',0)).toBe(true);expect(frame.secondaryBar.items.value[0]!.badge).toBe(0);expect(other.secondaryBar.items.value[0]!.badge).toBe(9);
 frame.secondaryBar.setBadgeVisible('one',false);expect(frame.secondaryBar.isVisible('one')).toBe(true);
 frame.moveView('one','bottom');expect(frame.secondaryBar.items.value).toHaveLength(0);expect(frame.viewRegion('one')).toBe('bottom');
 frame.moveView('one','secondary');expect(frame.secondaryBar.items.value[0]!.badge).toBe(0);expect(frame.secondaryBar.isBadgeVisible('one')).toBe(false);
 frame.secondaryBar.setBadge('one',undefined);expect(frame.secondaryBar.items.value[0]!.badge).toBeUndefined();
 remove();frame.registerSecondaryTab({id:'one',label:'Replacement',component:content,badge:2});expect(frame.secondaryBar.items.value[0]!.badge).toBe(2);expect(frame.secondaryBar.isBadgeVisible('one')).toBe(false);
 expect(frame.secondaryBar.setBadge('unknown',1)).toBe(false);expect(frame.secondaryBar.setBadgeVisible('unknown',true)).toBe(false);
 frame.dispose();expect(frame.secondaryBar.setBadge('one',1)).toBe(false);other.dispose();
});

test('moving a hidden view into the secondary bar does not select an invisible tab',()=>{
 const frame=createFrame();
 frame.registerSecondaryTab({id:'visible',label:'Visible',component:content});
 frame.registerBottomTab({id:'hidden',label:'Hidden',component:content,visible:false});
 expect(frame.moveView('hidden','secondary')).toBe(true);
 expect(frame.secondaryBar.isVisible('hidden')).toBe(false);
 expect(frame.state.activeSecondaryTab).toBe('visible');
 frame.dispose();
});
