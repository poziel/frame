const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${process.env.FRAME_TEST_URL||'http://localhost:1448'}/@fs/${path.join(__dirname,'fixtures/navigation-bar/index.html').replaceAll('\\','/')}`);
 const nav=page.getByRole('navigation',{name:'Navigation bar',exact:true});await nav.locator('[data-nav-id=Alpha]').waitFor();
 const menu=()=>page.getByRole('menu',{name:'Navigation bar',exact:true});
 await nav.locator('[data-nav-id=Beta]').click({button:'right'});await menu().getByText('Add Separator',{exact:true}).click();
 await nav.locator('[data-nav-id=Alpha]').click({button:'right'});await menu().getByText('Add Separator',{exact:true}).click();
 assert.equal(await nav.locator('[data-nav-wrapper^=separator-]').count(),2);
 const firstId=await nav.locator('[data-nav-wrapper^=separator-]').first().getAttribute('data-nav-wrapper');
 await page.evaluate(id=>window.__navFrame.navigationBar.removeSeparator(id),firstId);
 const separator=nav.locator('[data-nav-wrapper^=separator-]');await separator.waitFor();
 await separator.click({button:'right'});await menu().getByText('Delete Separator',{exact:true}).click();assert.equal(await separator.count(),0);
 await nav.locator('[data-nav-wrapper=separator]').click({button:'right'});assert.equal(await menu().getByText('Delete Separator',{exact:true}).count(),0);
 assert(await menu().getByText('Collapse Navigation Bar',{exact:true}).isDisabled());await page.keyboard.press('Escape');
 await page.evaluate(()=>window.__navFrame.navigationBar.setPosition('left'));
 assert.equal(await nav.locator('[data-nav-collapse] .bar-item-label').textContent(),'Collapse');
 const item=nav.locator('[data-nav-id=Alpha]');
 assert(await item.evaluate(el=>parseFloat(getComputedStyle(el).gap)>=12));assert(await item.evaluate(el=>parseFloat(getComputedStyle(el).paddingInlineEnd)>=16));
 const before=await nav.boundingBox(),mounts=await page.evaluate(()=>window.__navMounts());
 await nav.getByRole('button',{name:'Collapse Navigation Bar',exact:true}).click();
 assert.equal(await nav.getByRole('button',{name:'Expand Navigation Bar',exact:true}).evaluate(el=>el===document.activeElement),true);
 assert.equal(await nav.locator('[data-nav-collapse] .bar-item-label').count(),0);
 assert.equal(await page.evaluate(()=>window.__navFrame.navigationBar.display.value),'both');assert.equal(await item.locator('.bar-item-label').count(),0);
 assert((await nav.boundingBox()).width<before.width);assert.equal(await page.evaluate(()=>window.__navMounts()),mounts);
 await nav.getByRole('button',{name:'Expand Navigation Bar',exact:true}).click();assert.equal(await item.locator('.bar-item-label').count(),1);
 await item.click({button:'right'});await menu().getByText('Collapse Navigation Bar',{exact:true}).click();assert.equal(await page.evaluate(()=>window.__navFrame.navigationBar.collapsed.value),true);
 await page.evaluate(()=>window.__navFrame.navigationBar.setCollapsed(false));
 for(const [id,name,controller]of [['view','Primary view bar','primaryViewBar'],['secondary','Secondary view bar','secondaryViewBar'],['panel','Panel View Bar','panelViewBar']]){
  const view=page.locator(`[data-view-id="${id}"]`).first();await view.click({button:'right'});
  await page.getByRole('menu',{name,exact:true}).getByText('Add Separator',{exact:true}).click();
  const selector=id==='panel'?'.panel-tabs:not(.view-bar-measure)':id==='view'?'.view-bar:not(.secondary-view-bar) .view-bar-items':'.secondary-view-bar .view-bar-items';
  const bar=page.locator(selector);const sep=bar.locator('[data-bar-separator]');await sep.waitFor();
  assert.equal(await sep.evaluate(el=>getComputedStyle(el).userSelect),'none');
  const box=await sep.boundingBox(),label=await item.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(label.x+label.width/2,label.y+label.height/2,{steps:10});await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.getSelection().toString()),'');
  await sep.click({button:'right'});await page.getByRole('menu',{name,exact:true}).getByText('Delete Separator',{exact:true}).click();
  assert.equal(await page.evaluate(key=>window.__navFrame[key].separators.value.length,controller),0);
  // Host-owned fixed separators remain non-removable.
  await page.evaluate(({controller,id})=>window.__navFrame[controller].registerSeparator({id:'fixed',before:id}),{controller,id});
  await bar.locator('[data-bar-separator=fixed]').click({button:'right'});assert.equal(await page.getByRole('menu',{name,exact:true}).getByText('Delete Separator',{exact:true}).count(),0);await page.keyboard.press('Escape');
 }
 assert.deepEqual(errors,[]);console.log('Separator menus and permissions, selection prevention, vertical spacing, and independent collapse passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
