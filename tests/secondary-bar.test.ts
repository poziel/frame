import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
const content={render:()=>null};

test('secondary view-bar configuration and runtime presentation are isolated and resettable',()=>{
 const first=createFrame({secondaryViewBar:{display:'icons',size:'compact'}}),second=createFrame();
 expect(first.secondaryViewBar.display.value).toBe('icons');expect(first.secondaryViewBar.size.value).toBe('compact');
 expect(second.secondaryViewBar.display.value).toBe('both');expect(second.secondaryViewBar.size.value).toBe('default');
 expect(first.secondaryViewBar.moveSide('left')).toBe(true);expect(first.layout.primarySide).toBe('right');expect(first.secondaryViewBar.side.value).toBe('left');expect(second.layout.primarySide).toBe('left');
 expect(first.secondaryViewBar.setDisplay('text')).toBe(true);expect(first.secondaryViewBar.setSize('default')).toBe(true);
 first.resetLayout();expect(first.secondaryViewBar.display.value).toBe('icons');expect(first.secondaryViewBar.size.value).toBe('compact');expect(first.secondaryViewBar.side.value).toBe('right');
 expect(first.secondaryViewBar.setDisplay('invalid' as never)).toBe(false);expect(first.secondaryViewBar.setSize('large' as never)).toBe(false);expect(first.secondaryViewBar.moveSide('center' as never)).toBe(false);
 first.dispose();expect(first.secondaryViewBar.setDisplay('both')).toBe(false);expect(first.secondaryViewBar.moveSide('left')).toBe(false);second.dispose();
});

test('hiding root secondary views repairs selection and explicit reopening retains registration and content',()=>{
 const frame=createFrame({secondaryViewBar:{hidden:['hidden']}});
 const removeFirst=frame.registerSecondaryTab({id:'first',label:'First',component:content,props:{draft:'keep me'}});
 frame.registerSecondaryTab({id:'second',label:'Second',component:content});
 frame.registerSecondaryTab({id:'hidden',label:'Hidden initially',component:content});
 const first=frame.secondaryTabs.value[0]!;
 frame.openSecondaryPanel('first');
 expect(frame.secondaryViewBar.setVisible('first',false)).toBe(true);expect(frame.state.activeSecondaryTab).toBe('second');
 expect(frame.isViewVisible('first')).toBe(false);expect(frame.secondaryTabs.value).toHaveLength(3);expect(frame.secondaryTabs.value[0]).toBe(first);expect(first.props?.draft).toBe('keep me');
 expect(frame.secondaryViewBar.isVisible('hidden')).toBe(false);expect(frame.secondaryViewBar.setVisible('missing',false)).toBe(false);
 frame.setViewVisible('second',false);expect(frame.state.activeSecondaryTab).toBe('');expect(frame.layout.secondarySidebarVisible).toBe(false);
 frame.openSecondaryPanel('first');expect(frame.secondaryViewBar.isVisible('first')).toBe(true);expect(frame.state.activeSecondaryTab).toBe('first');expect(frame.secondaryTabs.value[0]).toBe(first);
 removeFirst();expect(frame.secondaryViewBar.items.value.map(item=>item.id)).toEqual(['second','hidden']);
 expect(frame.secondaryViewBar.setVisible('first',true)).toBe(false);
 frame.openSecondaryPanel();expect(frame.state.activeSecondaryTab).toBe('second');expect(frame.secondaryViewBar.isVisible('second')).toBe(true);
 frame.dispose();expect(frame.secondaryViewBar.items.value).toHaveLength(0);expect(frame.secondaryViewBar.isVisible('second')).toBe(false);
});

test('secondary badges can be hidden or updated without changing availability and clean up on unregister',()=>{
 const frame=createFrame({secondaryViewBar:{hiddenBadges:['one']}}),other=createFrame();
 const remove=frame.registerSecondaryTab({id:'one',label:'One',component:content,badge:4});
 other.registerSecondaryTab({id:'one',label:'Other',component:content,badge:9});
 expect(frame.secondaryViewBar.items.value[0]!.badge).toBe(4);expect(frame.secondaryViewBar.isBadgeVisible('one')).toBe(false);expect(other.secondaryViewBar.isBadgeVisible('one')).toBe(true);
 expect(frame.secondaryViewBar.setBadgeVisible('one',true)).toBe(true);expect(frame.secondaryViewBar.setBadge('one',0)).toBe(true);expect(frame.secondaryViewBar.items.value[0]!.badge).toBe(0);expect(other.secondaryViewBar.items.value[0]!.badge).toBe(9);
 frame.secondaryViewBar.setBadgeVisible('one',false);expect(frame.secondaryViewBar.isVisible('one')).toBe(true);
 frame.moveView('one','bottom');expect(frame.secondaryViewBar.items.value).toHaveLength(0);expect(frame.viewRegion('one')).toBe('bottom');
 frame.moveView('one','secondary');expect(frame.secondaryViewBar.items.value[0]!.badge).toBe(0);expect(frame.secondaryViewBar.isBadgeVisible('one')).toBe(false);
 frame.secondaryViewBar.setBadge('one',undefined);expect(frame.secondaryViewBar.items.value[0]!.badge).toBeUndefined();
 remove();frame.registerSecondaryTab({id:'one',label:'Replacement',component:content,badge:2});expect(frame.secondaryViewBar.items.value[0]!.badge).toBe(2);expect(frame.secondaryViewBar.isBadgeVisible('one')).toBe(false);
 expect(frame.secondaryViewBar.setBadge('unknown',1)).toBe(false);expect(frame.secondaryViewBar.setBadgeVisible('unknown',true)).toBe(false);
 frame.dispose();expect(frame.secondaryViewBar.setBadge('one',1)).toBe(false);other.dispose();
});

test('moving a hidden view into the secondary bar does not select an invisible tab',()=>{
 const frame=createFrame();
 frame.registerSecondaryTab({id:'visible',label:'Visible',component:content});
 frame.registerBottomTab({id:'hidden',label:'Hidden',component:content,visible:false});
 expect(frame.moveView('hidden','secondary')).toBe(true);
 expect(frame.secondaryViewBar.isVisible('hidden')).toBe(false);
 expect(frame.state.activeSecondaryTab).toBe('visible');
 frame.dispose();
});
