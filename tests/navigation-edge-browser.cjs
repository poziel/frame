const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome'});const failures=[];try{
 const context=await browser.newContext({viewport:{width:1280,height:800}});const page=await context.newPage();page.setDefaultTimeout(5000);
 const url=`${process.env.FRAME_TEST_URL||'http://localhost:1448'}/@fs/${path.join(__dirname,'fixtures/navigation-bar/index.html').replaceAll('\\','/')}`;
 const load=async()=>{await page.goto(url);await page.locator('[data-nav-id="Alpha"]').waitFor();};
 const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 async function check(name, run){try{await load();await run();console.log('PASS '+name);}catch(error){failures.push(name+': '+error.message);console.log('FAIL '+name);}}
 await check('API hide and unregister preserve focus',async()=>{
  await page.locator('[data-nav-id="Alpha"]').focus();await page.evaluate(()=>window.__navFrame.navigationBar.setItemVisible('Alpha',false));await settle();
  assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY');
  await page.evaluate(()=>{window.__removeTempNav=window.__navFrame.registerNavigationItem({id:'temporary',type:'action',label:'Temporary',run(){}});});
  await page.locator('[data-nav-id="temporary"]').focus();await page.evaluate(()=>window.__removeTempNav());await settle();assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY');
  await page.locator('[data-nav-id="Beta"]').focus();await page.evaluate(()=>window.__navFrame.navigationBar.setVisible(false));await settle();
  assert.equal(await page.evaluate(()=>document.activeElement.closest('.workbench')!==null),true);
  assert.notEqual(await page.evaluate(()=>document.activeElement.closest('.navigation-bar')!==null),true);
 });
 await check('modified Enter on a menu link preserves native destination',async()=>{
  await page.getByRole('button',{name:'Options',exact:true}).click();const link=page.getByRole('menuitem',{name:'Menu link',exact:true});await link.focus();await link.press('Control+Enter');await settle();
  assert.equal(await page.locator('output').textContent(),'Calls 0');
  for(const popup of context.pages())if(popup!==page)await popup.close();
 });
 await check('host overflow id does not collide with internal overflow',async()=>{
  await page.evaluate(()=>{window.__navFrame.registerNavigationItem({id:'overflow',type:'dropdown',label:'Host overflow',items:[{id:'host-child',type:'action',label:'Host child',run(){}}]});window.__navFrame.navigationBar.moveItem('overflow','Alpha');for(let i=0;i<50;i++)window.__navFrame.registerNavigationItem({id:'extra'+i,type:'action',label:'Extra '+i,run(){}});});
  await page.getByRole('button',{name:'Host overflow',exact:true}).click();await page.getByRole('menu',{name:'Host overflow',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'More Navigation Items',exact:true}).getAttribute('aria-expanded'),'false');
 });
 await check('long vertical labels leave a usable workspace',async()=>{
  await page.evaluate(()=>{window.__navFrame.registerNavigationItem({id:'long',type:'action',label:'Very long navigation '.repeat(35),run(){}});window.__navFrame.navigationBar.setDisplay('text');window.__navFrame.navigationBar.setPosition('left');});await settle();
  const nav=await page.locator('.navigation-bar').boundingBox(),body=await page.locator('.workbench-body').boundingBox();assert(nav.width<640);assert(body.width>600);
 });
 await check('disabled link auxiliary click is prevented',async()=>{
  const prevented=await page.evaluate(async()=>{window.__navFrame.registerNavigationItem({id:'disabled-link',type:'link',label:'Disabled link',href:'#disabled',disabled:true});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const e=new MouseEvent('auxclick',{button:1,bubbles:true,cancelable:true});document.querySelector('[data-nav-id="disabled-link"]').dispatchEvent(e);return e.defaultPrevented;});assert.equal(prevented,true);
 });
 if(failures.length)throw new Error(failures.join('\n'));
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1)});
