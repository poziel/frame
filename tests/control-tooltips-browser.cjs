const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-proxy-server']});try{
const page=await browser.newPage({viewport:{width:1000,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:1485');
assert.equal(await page.locator('#plain').evaluate(el=>el.parentElement.tagName),'MAIN','no tooltip must add no wrapper');
await page.locator('#plain').hover();await page.waitForTimeout(450);assert.equal(await page.locator('.frame-tooltip:visible').count(),0);
for(const [selector,text] of [['#button','Button description'],['#rich','Rich heading'],['#legacy','Migrated title'],['#icon-button','Rich icon description'],['#icon','Icon description'],['#input','Input description'],['#textarea','Textarea description'],['input[aria-label="Number"]','Number description'],['[aria-label="Select"]','Select description'],['[role="checkbox"]','Checkbox description'],['[role="switch"]','Switch description']]){
 const target=page.locator(selector);assert.equal(await target.getAttribute('title'),null);await target.hover();await page.locator('.frame-tooltip:visible').filter({hasText:text}).waitFor();await page.mouse.move(900,900);await page.waitForTimeout(100);
}
await page.locator('#input').fill('Typed');assert.equal(await page.locator('#value').textContent(),'Typed');
await page.getByRole('button',{name:'Increase',exact:true}).click();assert.equal(await page.locator('#number').textContent(),'3');
await page.getByRole('combobox',{name:'Select',exact:true}).click();await page.getByRole('option',{name:'Beta',exact:true}).click();assert.equal(await page.locator('#choice').textContent(),'b');
await page.getByRole('checkbox').click();assert.equal(await page.getByRole('checkbox').getAttribute('aria-checked'),'true');
await page.getByRole('switch').click();assert.equal(await page.getByRole('switch').getAttribute('aria-checked'),'true');
await page.locator('.frame-editable .frame-form-input').dblclick();const input=page.getByRole('textbox',{name:'Editable',exact:true});await input.fill('Changed');await input.press('Enter');assert.equal(await page.locator('#name').textContent(),'Changed');
assert.deepEqual(errors,[]);console.log('PASS: optional/rich tooltips, native-title migration, wrapper-free buttons, input/number/select/checkbox/switch/Editable interactions.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
