import { expect, test } from 'bun:test';
import { defaultLayout, layoutGeometry, maximizedRegionBounds } from '../packages/core/src/frame/layout';
test('intrinsic activity sizes drive both sidebar tracks and horizontal reservations',()=>{
 const layout=defaultLayout();layout.primarySidebarVisible=true;layout.secondarySidebarVisible=true;layout.secondaryViewBarPosition='default';
 const measurements={primary:{width:54,height:48},secondary:{width:46,height:42}};
 let g=layoutGeometry(layout,1400,900,measurements);
 expect(g.rail).toBe(54);expect(g.secondaryRail).toBe(46);
 layout.maximizedRegion='secondary';expect(maximizedRegionBounds(layout,1400,900,measurements)?.left).toBe(60);
 layout.primaryViewBarPosition='top';layout.secondaryViewBarPosition='bottom';
 g=layoutGeometry(layout,1400,900,measurements);
 expect(g.rail).toBe(0);expect(g.secondaryRail).toBe(0);
 expect(g.viewBarHeight).toBe(48);expect(g.secondaryViewBarHeight).toBe(42);
 layout.primarySidebarVisible=false;expect(layoutGeometry(layout,1400,900,measurements).viewBarHeight).toBe(0);
});
