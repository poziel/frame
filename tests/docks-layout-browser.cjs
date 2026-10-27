const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}}),failures=[];
 await page.goto('http://127.0.0.1:1476');await page.waitForFunction(()=>!!window.dockFixture);
 const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const box=selector=>page.locator(selector).boundingBox();
 const originalSidebar=await box('#side-panel .side-content');
 await page.evaluate(()=>window.dockFixture.add('inside','primarySidebar','right','inside',{width:80}));await page.waitForTimeout(150);
 try{const content=await box('#side-panel .side-content'),dock=await box('[data-dock-id=inside]');assert(content.x+content.width<=dock.x+1,'inside dock must reserve space beside sidebar content');}catch(e){failures.push(e.message);}
 try{assert(Math.abs((await box('#side-panel .side-content')).width-originalSidebar.width)<2,'sidebar preferred content width must survive an inside dock');}catch(e){failures.push(e.message);}
 for(const anchor of ['workspace','primarySidebar','secondarySidebar','panel','primaryViewBar','secondaryViewBar','panelViewBar','navigationBar','statusBar'])for(const edge of ['left','right','top','bottom']){
  await page.evaluate(({anchor,edge})=>{const f=window.dockFixture.frame;f.primarySidebar.open();f.secondarySidebar.open();f.panel.open();f.docks.update('inside',{anchor,edge,width:edge==='left'||edge==='right'?80:undefined,height:edge==='top'||edge==='bottom'?40:undefined});},{anchor,edge});
  await page.waitForTimeout(100);
  try{const content=await box(`[data-dock-content-region="${anchor}"]`),dock=await box('[data-dock-id=inside]');assert(content.width>2&&content.height>2,`${anchor} ${edge} must leave usable content`);
   if(edge==='left')assert(dock.x+dock.width<=content.x+1,`${anchor} left overlaps content`);
   if(edge==='right')assert(content.x+content.width<=dock.x+1,`${anchor} right overlaps content`);
   if(edge==='top')assert(dock.y+dock.height<=content.y+1,`${anchor} top overlaps content`);
   if(edge==='bottom')assert(content.y+content.height<=dock.y+1,`${anchor} bottom overlaps content`);
  }catch(e){failures.push(anchor+' '+edge+': '+e.message);}
 }
 await page.evaluate(()=>{const f=window.dockFixture;f.frame.docks.remove('inside');f.add('left','workspace','left','outside',{width:80});f.add('bottom','workspace','bottom','outside',{height:40});});await settle();
 try{const left=await box('[data-dock-id=left]'),bottom=await box('[data-dock-id=bottom]');assert(Math.abs(left.x-bottom.x)<2,'bottom dock must span the corner beneath the left dock');assert(Math.abs(left.y+left.height+4-bottom.y)<2,'side dock must end above bottom dock');}catch(e){failures.push(e.message);}
 await page.evaluate(()=>{window.dockFixture.frame.docks.remove('left');window.dockFixture.frame.docks.remove('bottom');});
 for(const density of ['default','compact'])for(const placement of ['inside','outside'])for(const vertical of ['left','right'])for(const horizontal of ['top','bottom']){
  await page.evaluate(({density,placement,vertical,horizontal})=>{const f=window.dockFixture;f.frame.layout.density=density;f.add('side','workspace',vertical,placement,{width:80});f.add('horizontal','workspace',horizontal,placement,{height:40});},{density,placement,vertical,horizontal});await page.waitForTimeout(100);
  try{const side=await box('[data-dock-id=side]'),h=await box('[data-dock-id=horizontal]'),gap=density==='compact'?0:4;
   assert(Math.abs((vertical==='left'?side.x:side.x+side.width)-(vertical==='left'?h.x:h.x+h.width))<2,`${density} ${placement} ${vertical}/${horizontal} leaves a corner gap`);
   assert(Math.abs(horizontal==='bottom'?side.y+side.height+gap-h.y:h.y+h.height+gap-side.y)<2,'perpendicular docks must not overlap');
  }catch(e){failures.push(e.message);}
  await page.evaluate(()=>{window.dockFixture.frame.docks.remove('side');window.dockFixture.frame.docks.remove('horizontal');});
 }
 if(failures.length)throw new Error(failures.join('\n'));
 console.log('PASS inside docks reserve content space and perpendicular docks share corners');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

