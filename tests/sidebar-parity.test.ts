import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
import {defaultLayout,layoutGeometry,maximizedRegionBounds} from '../packages/core/src/frame/layout';
const component={render:()=>null};

test('both sidebars toggle active selections only for vertical bars',()=>{
 const frame=createFrame();
 frame.registerSidePanel({id:'p',label:'Primary',component});frame.registerSecondaryTab({id:'s',label:'Secondary',component});
 for(const position of ['default','top','bottom'] as const){
  frame.primaryViewBar.setPosition(position);frame.secondaryViewBar.setPosition(position);
  frame.selectSideView('p');frame.selectSecondaryView('s');
  expect(frame.layout.primarySidebarVisible).toBe(true);expect(frame.layout.secondarySidebarVisible).toBe(true);
  frame.selectSideView('p');frame.selectSecondaryView('s');
  expect(frame.layout.primarySidebarVisible).toBe(position!=='default');expect(frame.layout.secondarySidebarVisible).toBe(position!=='default');
  expect(frame.layout.primaryViewBarVisible).toBe(true);expect(frame.layout.secondaryViewBarVisible).toBe(true);
  frame.closeSidePanel();frame.closeSecondaryPanel();
 }
 frame.dispose();
});

test('hiding bar preferences leaves content visible; hidden horizontal sidebars reserve no bar',()=>{
 const frame=createFrame();frame.registerSidePanel({id:'p',label:'Primary',component});frame.registerSecondaryTab({id:'s',label:'Secondary',component});
 frame.primaryViewBar.setPosition('top');frame.secondaryViewBar.setPosition('bottom');frame.openSidePanel('p');frame.openSecondaryPanel('s');
 frame.primaryViewBar.setPosition('hidden');frame.secondaryViewBar.setPosition('hidden');
 expect(frame.layout.primarySidebarVisible).toBe(true);expect(frame.layout.secondarySidebarVisible).toBe(true);
 frame.closeSidePanel();frame.closeSecondaryPanel();frame.openSidePanel('p');frame.openSecondaryPanel('s');
 expect(frame.primaryViewBar.position.value).toBe('hidden');expect(frame.secondaryViewBar.position.value).toBe('hidden');
 frame.primaryViewBar.setPosition('top');frame.secondaryViewBar.setPosition('bottom');frame.closeSidePanel();frame.closeSecondaryPanel();
 const hidden=layoutGeometry(frame.layout,1200,800);expect(hidden.viewBarHeight).toBe(0);expect(hidden.secondaryViewBarHeight).toBe(0);expect(hidden.rail).toBe(0);expect(hidden.secondaryRail).toBe(0);
 frame.primaryViewBar.setPosition('default');frame.secondaryViewBar.setPosition('default');const vertical=layoutGeometry(frame.layout,1200,800);
 expect(vertical.rail).toBe(40);expect(vertical.secondaryRail).toBe(40);expect(vertical.left).toBe(40);expect(vertical.right).toBe(40);
 frame.dispose();
});

test('vertical view bars support all three display modes and retain preferences',()=>{
 const frame=createFrame();
 for(const bar of [frame.primaryViewBar,frame.secondaryViewBar]){
  bar.setPosition('default');expect(bar.setDisplay('both')).toBe(true);expect(bar.effectiveDisplay.value).toBe('both');
  expect(bar.setDisplay('text')).toBe(true);expect(bar.effectiveDisplay.value).toBe('text');bar.setPosition('top');expect(bar.display.value).toBe('text');
 }
 frame.dispose();
});
