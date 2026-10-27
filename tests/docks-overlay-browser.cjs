const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-proxy-server']});try{
 const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:1476');await page.waitForFunction(()=>!!window.dockFixture);
 const content=page.locator('[data-dock-content-region="workspace"]');
 const before=await content.boundingBox();
 await page.evaluate(()=>window.dockFixture.add('overlay','workspace','bottom','overlay',{appearance:'none'}));
 const dock=page.locator('[data-dock-id="overlay"]');await dock.waitFor();await page.waitForTimeout(100);
 const after=await content.boundingBox(),box=await dock.boundingBox();
 assert.deepEqual(after,before,'overlay must not reserve canvas space');
 assert(Math.abs(box.x+box.width/2-after.x-after.width/2)<2);assert(box.y>=after.y && box.y+box.height<=after.y+after.height);
 const style=await dock.evaluate(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,border:s.borderTopWidth,padding:s.padding,shadow:s.boxShadow};});
 assert.deepEqual(style,{background:'rgba(0, 0, 0, 0)',border:'0px',padding:'0px',shadow:'none'});
 const hit=await page.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('.frame-dock-slot,.frame-dock'),{x:after.x+2,y:box.y+box.height/2});assert.equal(hit,false,'blank overlay lane must pass pointer input through');
 await dock.getByLabel('Dock draft').fill('Retained');await dock.getByRole('button').click();
 for(const edge of ['top','right','bottom','left']){await page.evaluate(edge=>window.dockFixture.frame.docks.update('overlay',{edge}),edge);await page.waitForTimeout(50);const d=await dock.boundingBox();assert(d.x>=after.x-1&&d.y>=after.y-1&&d.x+d.width<=after.x+after.width+1&&d.y+d.height<=after.y+after.height+1);}
 for(const appearance of ['basic','padded','none']){await page.evaluate(appearance=>window.dockFixture.frame.docks.update('overlay',{appearance}),appearance);assert.equal(await dock.getByLabel('Dock draft').inputValue(),'Retained');}
 await page.evaluate(()=>window.dockFixture.frame.docks.update('overlay',{placement:'inside'}));assert.equal(await dock.getByRole('button').innerText(),'Count 1');
 assert.deepEqual(errors,[]);console.log('PASS: overlay bounds, centered bottom content, no canvas reservation, transparent appearance, click-through lanes, all edges, retained state.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
