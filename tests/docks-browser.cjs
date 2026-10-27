const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{const page=await browser.newPage({viewport:{width:1400,height:950}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});page.setDefaultTimeout(10000);await page.addInitScript(()=>{window.fixtureWindowErrors=[];window.addEventListener('error',e=>window.fixtureWindowErrors.push(e.message));});await page.goto('http://127.0.0.1:1476');await page.waitForFunction(()=>!!window.dockFixture);
 const api=async fn=>page.evaluate(fn);const dock=id=>page.locator(`[data-dock-id="${id}"]`);const box=selector=>page.locator(selector).boundingBox();
 await api(()=>window.dockFixture.add('collapse','panel','bottom','outside',{height:25}));await dock('collapse').waitFor();
 await api(()=>window.dockFixture.frame.panel.close());await page.waitForTimeout(200);
 let collapsed=await box('.bottom-region');assert(Math.abs(collapsed.height-29)<2,`hidden panel retained ${collapsed.height}px`);
 await api(()=>{window.dockFixture.frame.docks.remove('collapse');window.dockFixture.frame.panel.open();});
 await api(()=>window.dockFixture.add('test'));await dock('test').waitFor();
 await dock('test').getByLabel('Dock draft').fill('keep my state');await dock('test').getByRole('button',{name:'Count 0'}).click();
 await api(()=>window.dockFixture.frame.docks.update('test',{anchor:'panel',edge:'bottom'}));await page.waitForTimeout(180);
 assert.equal(await dock('test').getByLabel('Dock draft').inputValue(),'keep my state');assert.equal(await dock('test').getByRole('button').innerText(),'Count 1');
 let d=await dock('test').boundingBox(),p=await box('.bottom-panel');assert(Math.abs(d.width-p.width)<3);assert(Math.abs(d.y-p.y-p.height-4)<2);
 await api(()=>window.dockFixture.frame.docks.update('test',{anchor:'workspace',placement:'inside'}));await page.waitForTimeout(120);
 const padding=await dock('test').evaluate(el=>({padding:getComputedStyle(el).padding,radius:getComputedStyle(el).borderRadius}));assert.notEqual(padding.radius,'0px');
 await api(()=>window.dockFixture.frame.docks.hide('test'));await dock('test').waitFor({state:'hidden'});await api(()=>window.dockFixture.frame.docks.show('test'));await dock('test').waitFor();assert.equal(await dock('test').getByLabel('Dock draft').inputValue(),'keep my state');
 await api(()=>window.dockFixture.frame.docks.update('test',{anchor:'secondarySidebar',edge:'right',placement:'outside'}));await page.waitForTimeout(200);
 d=await dock('test').boundingBox();let sidebar=await box('#secondary-panel'),bar=await box('.secondary-view-bar');assert(d.x>=Math.max(sidebar.x+sidebar.width,bar.x+bar.width)-1);assert(Math.abs(d.height-sidebar.height)<2);
 await api(()=>{window.dockFixture.frame.layout.primarySide='right'});await page.waitForTimeout(150);d=await dock('test').boundingBox();sidebar=await box('#secondary-panel');assert(d.x>=sidebar.x+sidebar.width-1);
 await api(()=>window.dockFixture.frame.secondarySidebar.close());await page.waitForTimeout(150);assert(await dock('test').isVisible());
 await api(()=>window.dockFixture.frame.secondarySidebar.disable());await dock('test').waitFor({state:'hidden'});await api(()=>window.dockFixture.frame.secondarySidebar.enable());await dock('test').waitFor();
 await api(()=>{const f=window.dockFixture.frame;f.primaryViewBar.setPosition('top');f.docks.update('test',{anchor:'primarySidebar',placement:'inside',edge:'bottom'});f.primarySidebar.close();});await dock('test').waitFor();assert((await dock('test').boundingBox()).width>100);
 await api(()=>{const f=window.dockFixture.frame;f.docks.update('test',{anchor:'workspace',edge:'bottom',placement:'inside'});f.layout.density='compact'});await page.waitForTimeout(120);assert.equal(await dock('test').evaluate(el=>getComputedStyle(el).borderRadius),'0px');
 for(const anchor of ['workspace','primarySidebar','secondarySidebar','panel','primaryViewBar','secondaryViewBar','panelViewBar','navigationBar','statusBar'])for(const placement of ['inside','outside'])for(const edge of ['top','right','bottom','left']){await page.evaluate((
   {anchor,placement,edge}
 )=>{const f=window.dockFixture.frame;f.primarySidebar.open();f.secondarySidebar.open();f.panel.open();f.docks.update('test',{anchor,placement,edge});},{anchor,placement,edge});await page.evaluate(()=>new Promise(requestAnimationFrame));await dock('test').waitFor();}
 await api(()=>{window.dockFixture.frame.docks.update('test',{anchor:'panelViewBar',placement:'inside'});window.dockFixture.frame.panel.close();});await dock('test').waitFor();
 await api(()=>{window.dockFixture.frame.docks.update('test',{anchor:'statusBar',placement:'outside',edge:'left'});window.dockFixture.frame.status.setBarVisible(false);});await dock('test').waitFor();
 await api(()=>window.dockFixture.frame.docks.remove('test'));await dock('test').waitFor({state:'detached'});assert.deepEqual(errors,[]);assert.deepEqual(await page.evaluate(()=>window.fixtureWindowErrors),[]);
 fs.mkdirSync('.tmp/docks',{recursive:true});await page.screenshot({path:'.tmp/docks/fixture.png'});console.log('PASS dock lifecycle, movement, geometry, all anchors/placements, hidden/disabled state, compact styling and component retention');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});




