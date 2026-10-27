const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1600,height:1100}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto((process.env.FRAME_DOCS_URL||'http://127.0.0.1:1475')+'/#/docks');
  const playground=page.locator('.dock-playground');
  await playground.getByRole('heading',{name:'Docks playground',exact:true}).waitFor();
  const navigation=page.getByRole('navigation',{name:'Navigation bar',exact:true});
  const navBounds=await navigation.boundingBox(),navContainer=await page.locator('.navigation-bar-container').boundingBox();
  assert(Math.abs(navBounds.width-(navContainer.width-8))<2,'Top navigation bar must stretch across its container, not collapse into overflow');
  assert.equal(await navigation.getByRole('button',{name:'More Navigation Items',exact:true}).count(),0);
  for(const position of ['bottom','left','right','top']){
   await playground.getByLabel(/^Navigation/).selectOption(position);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const b=await navigation.boundingBox(),parent=await page.locator('.navigation-bar-container').boundingBox();
   const axis=position==='top'||position==='bottom'?'width':'height';
   assert(Math.abs(b[axis]-(parent[axis]-8))<2,`${position} navigation must fill its container along ${axis}`);
  }
  fs.mkdirSync('.tmp/docks',{recursive:true});
  await page.screenshot({path:'.tmp/docks/navigation-restored.png'});
  const form=playground.locator('form');
  await form.getByLabel('Label').fill('First dock');
  await form.getByRole('button',{name:'Create dock',exact:true}).click();
  const first=page.locator('[data-dock-id="docs.dock.1"]');
  await first.getByLabel('Persistent draft').fill('Retained through movement');
  await first.getByRole('button',{name:'Count: 0',exact:true}).click();
  await form.getByLabel('Label').fill('Second dock');
  await form.getByLabel('Edge').selectOption('top');
  await form.getByRole('button',{name:'Create dock',exact:true}).click();
  const second=page.locator('[data-dock-id="docs.dock.2"]');
  await second.waitFor();
  assert.equal(await playground.locator('.dock-entry').count(),2);
  const entry=playground.locator('.dock-entry').filter({has:page.getByText('docs.dock.1')});
  await entry.getByLabel('Anchor').selectOption('primarySidebar');
  await entry.getByLabel('Placement').selectOption('inside');
  await entry.getByLabel('Edge').selectOption('right');
  await page.waitForTimeout(150);
  const sidebarContent=await page.locator('#side-panel .side-content').boundingBox(),insideDock=await first.boundingBox();
  assert(sidebarContent.x+sidebarContent.width<=insideDock.x+1,'inside dock must sit beside the real documentation sidebar content');
  fs.mkdirSync('.tmp/docks',{recursive:true});
  await page.screenshot({path:'.tmp/docks/inside-content-reserved.png'});
  await playground.getByLabel('Primary side').selectOption('right');
  await playground.getByLabel('Primary view bar').selectOption('bottom');
  await playground.getByLabel(/^Panel/).selectOption('left');
  await playground.getByLabel(/^Navigation/).selectOption('bottom');
  assert.equal(await first.getByLabel('Persistent draft').inputValue(),'Retained through movement');
  await first.getByRole('button',{name:'Count: 1',exact:true}).waitFor();
  await entry.getByRole('button',{name:'Hide',exact:true}).click();
  await first.waitFor({state:'hidden'});
  assert(await second.isVisible());
  await entry.getByRole('button',{name:'Show',exact:true}).click();
  await first.waitFor();
  assert.equal(await first.getByLabel('Persistent draft').inputValue(),'Retained through movement');
  await first.getByRole('button',{name:'Count: 1',exact:true}).waitFor();
  await entry.getByRole('button',{name:'Delete',exact:true}).click();
  await first.waitFor({state:'detached'});
  assert.equal(await playground.locator('.dock-entry').count(),1);
  assert(await second.isVisible());
  fs.mkdirSync('.tmp/docks',{recursive:true});
  await page.screenshot({path:'.tmp/docks/docs-playground.png',fullPage:true});
  // Navigating away unmounts the page and unregisters its remaining dock.
  await page.evaluate(()=>{location.hash='#/guide/overview';});
  await playground.waitFor({state:'detached'});
  await second.waitFor({state:'detached'});
  assert.deepEqual(errors,[]);
  console.log('PASS docs docks: multiple registration, placement and shell movement, retained input/counter, independent visibility, deletion, unmount cleanup, no console errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});


