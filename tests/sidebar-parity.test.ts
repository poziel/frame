import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
import {defaultLayout,layoutGeometry,maximizedRegionBounds} from '../packages/core/src/frame/layout';
const component={render:()=>null};

test('both sidebars toggle active selections only for vertical bars',()=>{
 const frame=createFrame();
 frame.registerSidePanel({id:'p',label:'Primary',component});frame.registerSecondaryTab({id:'s',label:'Secondary',component});
 for(const position of ['default','top','bottom'] as const){
  frame.activity.setPosition(position);frame.secondaryBar.setPosition(position);
  frame.selectSideView('p');frame.selectSecondaryView('s');
  expect(frame.layout.primarySidebarVisible).toBe(true);expect(frame.layout.secondarySidebarVisible).toBe(true);
  frame.selectSideView('p');frame.selectSecondaryView('s');
  expect(frame.layout.primarySidebarVisible).toBe(position!=='default');expect(frame.layout.secondarySidebarVisible).toBe(position!=='default');
  expect(frame.layout.activityBarVisible).toBe(true);expect(frame.layout.secondaryActivityBarVisible).toBe(true);
  frame.closeSidePanel();frame.closeSecondaryPanel();
 }
 frame.dispose();
});

test('hiding bar preferences leaves content visible; hidden horizontal sidebars reserve no bar',()=>{
 const frame=createFrame();frame.registerSidePanel({id:'p',label:'Primary',component});frame.registerSecondaryTab({id:'s',label:'Secondary',component});
 frame.activity.setPosition('top');frame.secondaryBar.setPosition('bottom');frame.openSidePanel('p');frame.openSecondaryPanel('s');
 frame.activity.setPosition('hidden');frame.secondaryBar.setPosition('hidden');
 expect(frame.layout.primarySidebarVisible).toBe(true);expect(frame.layout.secondarySidebarVisible).toBe(true);
 frame.closeSidePanel();frame.closeSecondaryPanel();frame.openSidePanel('p');frame.openSecondaryPanel('s');
 expect(frame.activity.position.value).toBe('hidden');expect(frame.secondaryBar.position.value).toBe('hidden');
 frame.activity.setPosition('top');frame.secondaryBar.setPosition('bottom');frame.closeSidePanel();frame.closeSecondaryPanel();
 const hidden=layoutGeometry(frame.layout,1200,800);expect(hidden.activityHeight).toBe(0);expect(hidden.secondaryActivityHeight).toBe(0);expect(hidden.rail).toBe(0);expect(hidden.secondaryRail).toBe(0);
 frame.activity.setPosition('default');frame.secondaryBar.setPosition('default');const vertical=layoutGeometry(frame.layout,1200,800);
 expect(vertical.rail).toBe(40);expect(vertical.secondaryRail).toBe(40);expect(vertical.left).toBe(40);expect(vertical.right).toBe(40);
 frame.dispose();
});

test('vertical bars render icons and reject unavailable display modes while retaining horizontal preferences',()=>{
 const first=createFrame({activity:{position:'top',display:'text'},secondaryBar:{position:'bottom',display:'both'}}),other=createFrame();
 expect(first.activity.effectiveDisplay.value).toBe('text');expect(first.secondaryBar.effectiveDisplay.value).toBe('both');
 for(const bar of [first.activity,first.secondaryBar]){
  const stored=bar.display.value;bar.setPosition('default');expect(bar.effectiveDisplay.value).toBe('icons');expect(bar.display.value).toBe(stored);
  expect(bar.setDisplay('text')).toBe(false);expect(bar.setDisplay('both')).toBe(false);bar.setPosition('top');expect(bar.effectiveDisplay.value).toBe(stored);
 }
 expect(other.layout.activityBarDisplay).toBe('icons');expect(other.secondaryBar.position.value).toBe('top');
 first.resetLayout();expect(first.activity.position.value).toBe('top');expect(first.activity.display.value).toBe('text');expect(first.secondaryBar.position.value).toBe('bottom');
 first.dispose();expect(first.secondaryBar.setPosition('default')).toBe(false);expect(first.activity.setDisplay('icons')).toBe(false);other.dispose();
});

test('swapped bars reserve both outer edges and Zen restores independent visibility preferences',()=>{
 const frame=createFrame();frame.secondaryBar.setPosition('default');frame.activity.setPosition('hidden');
 frame.setZenMode(true);expect(frame.layout.secondaryActivityBarVisible).toBe(false);frame.setZenMode(false);
 expect(frame.layout.activityBarVisible).toBe(false);expect(frame.layout.secondaryActivityBarVisible).toBe(true);
 const layout={...defaultLayout(),secondaryActivityBarPosition:'default' as const,primarySidebarVisible:true,secondarySidebarVisible:true,panelVisible:true,panelAlignment:'justify' as const};
 for(const primarySide of ['left','right'] as const){
  layout.primarySide=primarySide;const g=layoutGeometry(layout,1200,800);
  expect(g.rail).toBe(40);expect(g.secondaryRail).toBe(40);expect(g.panelLeftInset).toBe(46);expect(g.panelRightInset).toBe(46);
  layout.maximizedRegion='secondary';const max=maximizedRegionBounds(layout,1200,800)!;expect(max.left).toBe(46);expect(max.right).toBe(46);
 }
 frame.dispose();
});


test('hiding the last root item closes either sidebar without changing bar preference',()=>{
 const frame=createFrame();frame.registerSidePanel({id:'p',label:'Primary',component});frame.registerSecondaryTab({id:'s',label:'Secondary',component});
 for(const position of ['default','top'] as const){
  frame.activity.setPosition(position);frame.secondaryBar.setPosition(position);frame.openSidePanel('p');frame.openSecondaryPanel('s');
  frame.activity.setVisible({kind:'view',id:'p'},false);frame.secondaryBar.setVisible('s',false);
  expect(frame.layout.primarySidebarVisible).toBe(false);expect(frame.layout.secondarySidebarVisible).toBe(false);
  const g=layoutGeometry(frame.layout,1200,800);expect(g.rail).toBe(position==='default'?40:0);expect(g.secondaryRail).toBe(position==='default'?40:0);
  expect(frame.layout.activityBarVisible).toBe(true);expect(frame.layout.secondaryActivityBarVisible).toBe(true);
 }
 frame.dispose();
});
