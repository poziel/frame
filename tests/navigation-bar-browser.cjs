const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});page.setDefaultTimeout(8000);const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${process.env.FRAME_TEST_URL||'http://localhost:1448'}/@fs/${path.join(__dirname,'fixtures/navigation-bar/index.html').replaceAll('\\','/')}`);
 const rail=page.getByRole('navigation',{name:'Navigation bar',exact:true}), button=name=>rail.getByRole('button',{name,exact:true});await button('Alpha').waitFor();
 await page.getByLabel('Retained input').first().fill('keep this');const mounts=await page.evaluate(()=>window.__navMounts());
 await button('Beta').click();assert.equal(await button('Beta').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('output').textContent(),'Calls 1');
 assert(await button('Disabled').isDisabled());await button('Disabled').dispatchEvent('click');assert.equal(await page.locator('output').textContent(),'Calls 1');
 assert.equal(await rail.getByRole('link',{name:'Go home',exact:true}).getAttribute('href'),'#home');
 await rail.getByRole('link',{name:'Go home',exact:true}).click();assert.equal(await page.locator('output').textContent(),'Calls 2');
 await rail.getByRole('link',{name:'Native link',exact:true}).click();assert(page.url().endsWith('#native'));
 await button('Options').click();await page.getByRole('menuitem',{name:'Nested',exact:true}).hover();await page.getByRole('menuitem',{name:'Run nested',exact:true}).press('Enter');assert.equal(await page.locator('output').textContent(),'Calls 3');
 for(const dock of ['top','bottom','left','right']){
  await page.getByRole('button',{name:`Dock ${dock}`,exact:true}).click();
  await page.waitForFunction(d=>document.querySelector('.workbench-layout').dataset.navPosition===d,dock);
  const b=await rail.boundingBox(),body=await page.locator('.workbench-body').boundingBox();
  if(dock==='top')assert(b.y+b.height<=body.y+1);if(dock==='bottom')assert(b.y>=body.y+body.height-1);if(dock==='left')assert(b.x+b.width<=body.x+1);if(dock==='right')assert(b.x>=body.x+body.width-1);
  assert.equal(await page.evaluate(()=>window.__navMounts()),mounts);assert.equal(await page.getByLabel('Retained input').first().inputValue(),'keep this');
 }
 // Every view bar supports text/both even in vertical placement, with independent size.
 for(const size of ['default','compact'])for(const display of ['icons','text','both']){
  await page.evaluate(({size,display})=>{for(const bar of [window.__navFrame.primaryViewBar,window.__navFrame.secondaryViewBar,window.__navFrame.panelViewBar]){bar.setSize(size);bar.setDisplay(display);}}, {size,display});
  for(const id of ['view','secondary','panel']){
   const item=page.locator(`[data-view-id="${id}"]`).first();await item.waitFor();
   assert.equal(await item.locator('.bar-item-label').count(),display==='icons'?0:1);
   assert.equal(await item.locator('.bar-icon-slot').count(),display==='text'?0:1);
   if(display!=='icons')assert.equal(await item.locator('.bar-item-label').evaluate(el=>getComputedStyle(el).fontSize),size==='default'?'14px':'11px');
  }
 }
 await page.evaluate(()=>{window.__navFrame.panelViewBar.setBarVisible(false);});
 assert.equal(await page.locator('[data-view-id="panel"]').first().isVisible(),false);
 assert.equal(await page.getByLabel('Retained input').count(),4);
 await page.evaluate(()=>{window.__navFrame.panelViewBar.setBarVisible(true);});
 await page.getByRole('button',{name:'Dock top',exact:true}).click();
 const geometry=await rail.evaluate(el=>{const s=getComputedStyle(el),p=getComputedStyle(el.parentElement);return{border:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth],radius:parseFloat(s.borderTopLeftRadius),padding:p.padding};});assert.deepEqual(geometry.border,['1px','1px','1px','1px']);assert(geometry.radius>0);assert.equal(geometry.padding,'4px');
 await page.evaluate(()=>document.documentElement.style.setProperty('--frame-spacing-small','8px'));assert.equal(await rail.evaluate(el=>getComputedStyle(el.parentElement).paddingLeft),'8px');await page.evaluate(()=>document.documentElement.style.removeProperty('--frame-spacing-small'));
 const aBox=await button('Alpha').boundingBox(),bBox=await button('Beta').boundingBox();
 await page.mouse.move(aBox.x+aBox.width/2,aBox.y+aBox.height/2);await page.mouse.down();await page.mouse.move(bBox.x+bBox.width-1,bBox.y+bBox.height/2,{steps:8});await page.mouse.up();
 assert.deepEqual((await page.evaluate(()=>window.__navFrame.navigationBar.items.value.map(i=>i.id))).slice(0,2),['Beta','Alpha']);
 await page.evaluate(()=>window.__navFrame.navigationBar.moveItem('Alpha','Beta'));
 await button('Alpha').click({button:'right'});const menu=page.getByRole('menu',{name:'Navigation bar',exact:true});await menu.getByText('Hide Badge',{exact:true}).click();assert.equal(await button('Alpha').locator('.bar-item-badge').count(),0);
 await button('Alpha').click({button:'right'});await menu.getByText('Move Later',{exact:true}).click();assert.deepEqual((await page.evaluate(()=>window.__navFrame.navigationBar.items.value.map(i=>i.id))).slice(0,2),['Beta','Alpha']);
 await button('Alpha').click({button:'right'});await menu.getByText("Hide 'Alpha'",{exact:true}).click();assert.equal(await button('Alpha').count(),0);
 await rail.click({button:'right',position:{x:800,y:10}});await menu.getByText('Alpha',{exact:true}).click();await button('Alpha').waitFor();
 await page.getByRole('button',{name:'Compact API',exact:true}).click();await page.getByRole('button',{name:'Text API',exact:true}).click();assert.equal(await button('Alpha').locator('.bar-icon-slot').count(),0);assert.equal(await button('Alpha').locator('.bar-item-label').evaluate(el=>getComputedStyle(el).fontSize),'11px');
 await page.getByRole('button',{name:'Toggle navigation',exact:true}).click();await rail.waitFor({state:'hidden'});await page.getByRole('button',{name:'Toggle navigation',exact:true}).click();await button('Beta').waitFor();assert.equal(await button('Beta').getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Add overflow',exact:true}).click();await button('More Navigation Items').click();await page.getByRole('menu',{name:'More Navigation Items',exact:true}).waitFor();assert.deepEqual(errors,[]);console.log('Navigation types, menus, four docks, content retention, ordering, themes, and overflow passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

