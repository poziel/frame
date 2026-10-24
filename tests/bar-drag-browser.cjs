const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${process.env.FRAME_TEST_URL||'http://localhost:1448'}/@fs/${path.join(__dirname,'fixtures/navigation-bar/index.html').replaceAll('\\','/')}`);
 const nav=page.getByRole('navigation',{name:'Navigation bar',exact:true});await nav.locator('[data-nav-id=Alpha]').waitFor();
 const labels=async name=>page.getByRole('menu',{name,exact:true}).locator('[role^=menuitem],[role=separator]').evaluateAll(els=>els.map(el=>el.getAttribute('role')==='separator'?'---':el.textContent.trim()));
 const navMenu='Navigation bar';await nav.dispatchEvent('contextmenu',{clientX:800,clientY:80});
 assert.deepEqual((await labels(navMenu)).slice(0,2),['Add Separator','---']);await page.keyboard.press('Escape');
 await nav.locator('[data-nav-id=Beta]').click({button:'right'});assert.deepEqual((await labels(navMenu)).slice(0,7),['Add Separator','---',"Hide 'Beta'",'Hide Badge','Move Earlier','Move Later','---']);
 assert(!(await labels(navMenu)).includes('Divider'));await page.keyboard.press('Escape');
 await page.evaluate(()=>window.__navFrame.registerNavigationItem({id:'editable-divider',type:'separator',label:'Navigation divider',allowRemove:true}));
 const sep=nav.locator('[data-nav-wrapper=editable-divider]');await sep.click({button:'right'});
 assert.deepEqual((await labels(navMenu)).slice(0,6),['Add Separator','Delete Separator','---','Move Earlier','Move Later','---']);assert(!(await labels(navMenu)).includes('Navigation divider'));await page.keyboard.press('Escape');
 assert.equal(await sep.locator('.navigation-separator').evaluate(el=>getComputedStyle(el).cursor),'default');
 const a=await nav.locator('[data-nav-id=Alpha]').boundingBox(),b=await nav.locator('[data-nav-id=Beta]').boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});
 assert.equal(await page.locator('.view-drag-preview').textContent(),'Alpha');assert.equal(await page.locator('.view-drag-preview svg[data-test-icon=alpha]').count(),1);assert.equal(await page.locator('.view-drop-marker').count(),1);
 assert.equal(await nav.evaluate(el=>getComputedStyle(el).cursor),'grabbing');await page.keyboard.press('Escape');await page.mouse.up();assert.equal(await page.locator('.view-drag-preview').count(),0);assert.equal(await page.locator('.frame-item-dragging').count(),0);
 const callsBefore=await page.locator('output').textContent();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.move(a.x+a.width/2,a.y+a.height/2,{steps:8});await page.keyboard.press('Escape');await page.mouse.up();assert.equal(await page.locator('output').textContent(),callsBefore);
 // Nav separators use the same marker, with no item preview.
 const s=await sep.boundingBox();await page.mouse.move(s.x+s.width/2,s.y+s.height/2);await page.mouse.down();await page.mouse.move(b.x,b.y+b.height/2,{steps:8});assert.equal(await page.locator('.view-drop-marker').count(),1);assert.equal(await page.locator('.view-drag-preview').count(),0);await page.keyboard.press('Escape');await page.mouse.up();
 for(const [id,region,name,controller]of [['view','primary','Primary view bar','primaryViewBar'],['secondary','secondary','Secondary view bar','secondaryViewBar'],['panel','bottom','Panel View Bar','panelViewBar']]){
  await page.evaluate(({id,region,controller})=>{window.__navFrame.registerView({id:id+'-next',label:'Next',component:{render:()=>null}},region);window.__navFrame[controller].registerSeparator({id:'editable',before:id+'-next',allowRemove:true});},{id,region,controller});
  const view=page.locator(`[data-view-id="${id}"]`).first();await view.click({button:'right'});assert.deepEqual((await labels(name)).slice(0,7),['Add Separator','---',`Hide '${await view.getAttribute('aria-label')}'`,'Hide Badge','Move Earlier','Move Later','---']);await page.keyboard.press('Escape');
  const viewBox=await view.boundingBox(),nextBox=await page.locator(`[data-view-id="${id}-next"]`).first().boundingBox();
  await page.mouse.move(viewBox.x+viewBox.width/2,viewBox.y+viewBox.height/2);await page.mouse.down();await page.mouse.move(nextBox.x+nextBox.width/2,nextBox.y+nextBox.height/2,{steps:8});
  assert.equal(await view.evaluate(el=>getComputedStyle(el).cursor),'grabbing');assert.equal(await page.locator('.view-drag-preview').count(),1);await page.keyboard.press('Escape');await page.mouse.up();
  const list=page.locator('.bar-drop-list').filter({has:page.locator(`[data-view-id="${id}"]`)}),separator=list.locator('[data-bar-separator=editable]');
  await separator.click({button:'right'});assert.deepEqual((await labels(name)).slice(0,6),['Add Separator','Delete Separator','---','Move Earlier','Move Later','---']);await page.keyboard.press('Escape');
  assert.equal(await separator.evaluate(el=>getComputedStyle(el).cursor),'default');
  const source=await separator.boundingBox(),destination=await view.boundingBox();await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(destination.x+destination.width/2,destination.y+destination.height/2,{steps:8});
  assert.equal(await page.locator('.view-drop-marker').count(),1);assert.equal(await page.locator('.view-drag-preview').count(),0);assert.equal(await separator.evaluate(el=>getComputedStyle(el).cursor),'grabbing');
  await page.mouse.up();assert.equal(await page.locator('.view-drop-marker').count(),0);assert.equal(await separator.evaluate(el=>getComputedStyle(el).cursor),'default');
 }
 assert.deepEqual(errors,[]);console.log('Shared drag previews, separator markers, active-only grabbing cursors, and all context-menu variants passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
