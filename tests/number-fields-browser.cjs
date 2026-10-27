const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:1478');
 for(const controls of ['buttons','none','stacked'])for(const size of ['default','compact']){
  const root=page.locator('[data-example="'+controls+'-'+size+'"] .frame-number-field');
  const field=root.getByRole('spinbutton');await field.fill('2');await field.press('Tab');
  await field.focus();assert.equal(await root.evaluate(el=>getComputedStyle(el).outlineColor),'rgb(255, 93, 87)');
  assert.equal(await field.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await field.press('ArrowUp');assert.equal(await page.locator('#value').textContent(),'2.5');
  await field.press('ArrowDown');assert.equal(await page.locator('#value').textContent(),'2');
  assert.equal(await root.locator('button').count(),controls==='buttons'?2:0);
  if(controls==='buttons'){
   assert.equal(await root.locator('button svg').count(),2);
   await root.getByRole('button',{name:'Increase',exact:true}).click();assert.equal(await page.locator('#value').textContent(),'2.5');
   await root.getByRole('button',{name:'Increase',exact:true}).click();assert.equal(await page.locator('#value').textContent(),'3');
   assert(await root.getByRole('button',{name:'Increase',exact:true}).isDisabled());
   await field.fill('0');await field.press('Tab');assert(await root.getByRole('button',{name:'Decrease',exact:true}).isDisabled());
  }
  const box=await root.boundingBox();assert.equal(box.height,size==='compact'?24:30);
  if(controls==='stacked'){
   assert.equal(await field.getAttribute('type'),'number');
   await field.fill('3');await field.press('ArrowUp');assert.equal(await page.locator('#value').textContent(),'3');
  }
 }
 assert(await page.getByRole('spinbutton',{name:'Disabled',exact:true}).isDisabled());
 const surfaces=page.locator('main > .frame-text-input,main > .frame-text-area,.frame-select,.frame-date-field,[data-example="buttons-default"] .frame-number-field');
 await page.evaluate(()=>document.activeElement?.blur());await page.mouse.move(1200,700);
 const samples=await surfaces.evaluateAll(nodes=>nodes.map(el=>{const css=getComputedStyle(el);return [css.borderColor,css.borderRadius,css.borderWidth];}));
 assert(samples.length>=5);for(const sample of samples)assert.deepEqual(sample,samples[0],'input defaults match');
 await page.locator('main').evaluate(el=>{el.style.setProperty('--frame-input-radius','9px');el.style.setProperty('--frame-input-border','2px solid rgb(10,20,30)');el.style.setProperty('--frame-input-hover-border','2px solid rgb(40,50,60)');el.style.setProperty('--frame-input-hover-outline','1px solid rgb(70,80,90)');});
 for(const element of await surfaces.all()){
  await page.mouse.move(1200,700);await page.locator('#value').click();
  const css=await element.evaluate(el=>{const s=getComputedStyle(el);return [s.borderColor,s.borderRadius,s.borderWidth];});
  assert.deepEqual(css,['rgb(10, 20, 30)','9px','2px']);
  await element.hover();assert.equal(await element.evaluate(el=>getComputedStyle(el).borderColor),'rgb(40, 50, 60)');
 }
 const number=page.locator('[data-example="buttons-default"] .frame-number-field');
 await number.evaluate(el=>{el.style.setProperty('--frame-number-field-border-radius','3px');el.style.setProperty('--frame-number-field-focus-outline','2px solid rgb(100,110,120)');});
 await number.getByRole('spinbutton').focus();assert.equal(await number.evaluate(el=>getComputedStyle(el).borderRadius),'3px');assert.equal(await number.evaluate(el=>getComputedStyle(el).outlineColor),'rgb(100, 110, 120)');
 assert.equal(await page.locator('main > .frame-text-input').evaluate(el=>getComputedStyle(el).borderRadius),'9px','component override stays isolated');
 await page.screenshot({path:'.tmp/number-fields.png'});assert.deepEqual(errors,[]);
 console.log('PASS: icon steppers, attached compact/default geometry, plain and stacked variants, accent focus, keyboard stepping, bounds, and disabled state.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1)});
