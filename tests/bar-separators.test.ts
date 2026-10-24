import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';

test('collapse is independent of display and only affects vertical icons and text',()=>{
 const f=createFrame({navigationBar:{position:'left',display:'both'}}),b=f.navigationBar;
 expect(b.collapsed.value).toBe(false);expect(b.setCollapsed(true)).toBe(true);
 expect(b.display.value).toBe('both');expect(b.effectiveDisplay.value).toBe('icons');
 b.setPosition('top');expect(b.effectiveDisplay.value).toBe('both');expect(b.collapsed.value).toBe(true);
 b.setPosition('right');b.setDisplay('text');expect(b.effectiveDisplay.value).toBe('text');
 b.setDisplay('both');expect(b.effectiveDisplay.value).toBe('icons');
 f.resetLayout();expect(b.collapsed.value).toBe(false);f.dispose();expect(b.setCollapsed(true)).toBe(false);
});

test('separator edits require opt-in and keep bar and view state independent',()=>{
 const f=createFrame({navigationBar:true});
 for(const bar of [f.primaryViewBar,f.secondaryViewBar,f.panelViewBar,f.navigationBar])expect(bar.addSeparator()).toBeUndefined();
 f.dispose();
 const a=createFrame({primaryViewBar:{allowAddSeparator:true},secondaryViewBar:{allowAddSeparator:true},panelViewBar:{allowAddSeparator:true},navigationBar:{allowAddSeparator:true}}),other=createFrame();
 for(const bar of [a.primaryViewBar,a.secondaryViewBar,a.panelViewBar]){
  const id=bar.addSeparator();expect(id).toBeString();expect(bar.separators.value).toHaveLength(1);
  expect(bar.removeSeparator(id!)).toBe(true);expect(bar.separators.value).toHaveLength(0);
  const remove=bar.registerSeparator({id:'fixed'});expect(bar.removeSeparator('fixed')).toBe(false);remove();remove();
 }
 const id=a.navigationBar.addSeparator();expect(a.navigationBar.find(id!)?.type).toBe('separator');expect(a.navigationBar.removeSeparator(id!)).toBe(true);
 const remove=a.registerNavigationItem({id:'fixed',type:'separator'});expect(a.navigationBar.removeSeparator('fixed')).toBe(false);remove();
 expect(other.primaryViewBar.separators.value).toHaveLength(0);expect(a.views.value).toHaveLength(0);
 a.dispose();expect(a.primaryViewBar.addSeparator()).toBeUndefined();expect(a.navigationBar.addSeparator()).toBeUndefined();other.dispose();
});

test('host separator disposers survive reordering without removing a replacement registration',()=>{
 const f=createFrame();const b=f.primaryViewBar;
 const remove=b.registerSeparator({id:'divider',allowRemove:true});
 expect(b.moveSeparator('divider')).toBe(true);remove();expect(b.separators.value).toHaveLength(0);
 b.registerSeparator({id:'divider'});remove();expect(b.separators.value).toHaveLength(1);f.dispose();
});

test('view-bar separator movement follows the corresponding region permission', () => {
 const frame=createFrame();
 for(const [bar,region] of [[frame.primaryViewBar,'primary'],[frame.secondaryViewBar,'secondary'],[frame.panelViewBar,'bottom']] as const){
  bar.registerSeparator({id:'locked'});
  frame.interaction[region]=false;
  expect(bar.canMoveSeparators.value).toBe(false);
  expect(bar.moveSeparator('locked')).toBe(false);
  frame.interaction[region]=true;
  expect(bar.moveSeparator('locked')).toBe(true);
  frame.interaction.dragging=false;
  expect(bar.moveSeparator('locked')).toBe(false);
  frame.interaction.dragging=true;
 }
 frame.dispose();
});
