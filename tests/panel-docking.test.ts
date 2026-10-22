import {test,expect} from 'bun:test';
import {defaultLayout,layoutGeometry,maximizedRegionBounds,panelCoverage} from '../packages/core/src/frame/layout';
test('all panel positions keep preferred dimensions separate and horizontal coverage mirrors top/bottom',()=>{
 for(const primarySide of ['left','right'] as const)for(const panelPosition of ['top','bottom','left','right'] as const)for(const panelAlignment of ['left','right','center','justify'] as const){
  const layout={...defaultLayout(),primarySide,panelPosition,panelAlignment,panelVisible:true,primarySidebarVisible:true,secondarySidebarVisible:true};
  const g=layoutGeometry(layout,1400,800);
  expect(layout.panelHeight).toBe(240);expect(layout.panelWidth).toBe(320);
  if(panelPosition==='left'||panelPosition==='right'){
   expect(g.panel).toBe(0);expect(g.panelWidth).toBeGreaterThan(0);expect(g.center).toBeGreaterThanOrEqual(120);
   expect(g.underPrimary).toBe(false);expect(g.underSecondary).toBe(false);expect(g.panelAbovePrimary).toBe(false);expect(g.panelAboveSecondary).toBe(false);
   const max=maximizedRegionBounds({...layout,maximizedRegion:'bottom'},1400,800)!;
   expect(max.primary).toBe(false);expect(max.secondary).toBe(false);expect(max.width).toBe(g.centerAvailable);
  }else{
   expect(g.panelWidth).toBe(0);expect(g.panel).toBe(240);
   expect(panelPosition==='top'?g.panelAbovePrimary:g.underPrimary).toBe(panelCoverage(panelAlignment)[primarySide]);
   expect(panelPosition==='top'?g.panelAboveSecondary:g.underSecondary).toBe(panelCoverage(panelAlignment)[primarySide==='left'?'right':'left']);
  }
 }
});
test('narrow vertical layouts retain workspace room without mutating preferences',()=>{
 const layout={...defaultLayout(),panelPosition:'right' as const,panelVisible:true,panelWidth:900,primarySidebarVisible:true,secondarySidebarVisible:true};
 const g=layoutGeometry(layout,420,600);expect(g.center).toBeGreaterThanOrEqual(120);expect(layout.panelWidth).toBe(900);
});
