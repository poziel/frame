const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{const page=await browser.newPage({viewport:{width:700,height:600}}),errors=[];page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:1480');
 const value=()=>page.locator('#value').textContent();const display=()=>page.getByRole('spinbutton',{name:'Size',exact:true});
 const root=page.locator('.frame-scrub-field').first();assert((await display().textContent()).includes('Size: 5 px'));
 let box=await display().boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width*.75,box.y+box.height/2,{steps:8});assert.equal(await value(),'7.5','drag preview follows the cursor');await page.mouse.up();assert.equal(await page.getByRole('textbox',{name:'Size value',exact:true}).count(),0,'drag does not open editing');
 await display().click();let input=page.getByRole('textbox',{name:'Size value',exact:true});assert.equal(await input.evaluate(el=>getComputedStyle(el).textAlign),'center');await input.fill('7.5');await input.press('Enter');assert.equal(await value(),'7.5');
 await display().click();input=page.getByRole('textbox',{name:'Size value',exact:true});await input.fill('1');await input.press('Escape');assert.equal(await value(),'7.5','escape cancels typing');
 await display().click();input=page.getByRole('textbox',{name:'Size value',exact:true});await input.fill('9');await page.locator('#outside').click();assert.equal(await value(),'9','blur commits');
 await display().hover();await page.mouse.wheel(0,-100);await page.waitForTimeout(60);assert.equal(await value(),'9.5');await page.mouse.wheel(0,-100);await page.waitForTimeout(60);assert.equal(await value(),'10');await page.mouse.wheel(0,-100);await page.waitForTimeout(60);assert.equal(await value(),'10','wheel clamps at maximum');
 await root.getByRole('button',{name:'Decrease',exact:true}).click();assert.equal(await value(),'9.5');
 await display().focus();await page.keyboard.press('Home');assert.equal(await value(),'0');await page.keyboard.press('End');assert.equal(await value(),'10');await page.keyboard.press('ArrowLeft');assert.equal(await value(),'9.5');
 await page.keyboard.press('Enter');input=page.getByRole('textbox',{name:'Size value',exact:true});await input.fill('999');await input.press('Enter');assert.equal(await value(),'10','typed input clamps at maximum');
 for(const width of [240,540]){
  await root.evaluate((el, width)=>el.style.width=width+'px',width);await display().focus();await page.keyboard.press('Home');
  box=await display().boundingBox();const y=box.y+box.height/2;await page.mouse.move(box.x+1,y);await page.mouse.down();
  for(const [ratio,expected] of [[.25,'2.5'],[.5,'5'],[.75,'7.5'],[1,'10']]){
   await page.mouse.move(box.x+box.width*ratio,y,{steps:6});assert.equal(await value(),expected);
   const fill=await root.locator('.frame-scrub-fill').boundingBox();assert(Math.abs(fill.x+fill.width-(box.x+box.width*ratio))<1,'fill stays aligned with the cursor');
  }
  await page.mouse.up();
 }
 const disabled=page.getByRole('spinbutton',{name:'Disabled',exact:true});assert(await disabled.isDisabled());await disabled.hover();await page.mouse.wheel(0,-100);assert.equal(await disabled.getAttribute('aria-valuenow'),'3');
 assert.equal(await page.locator('#other').textContent(),'2','instances stay isolated');await page.screenshot({path:'.tmp/scrub-field.png'});assert.deepEqual(errors,[]);console.log('PASS: live drag scrubbing, click-to-type, Enter/blur commit, Escape cancel, wheel and arrow steps, keyboard bounds, disabled state, and instance isolation.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1)});
