const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-proxy-server']});try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:1484');
const auto=page.locator('.frame-editable').nth(0),manual=page.locator('.frame-editable').nth(1),outside=page.locator('#outside');
async function edit(root, label, value){await root.locator('.frame-form-input[data-placeholder-shown]').dblclick();const input=page.getByRole('textbox',{name:label,exact:true});await input.fill(value);return input;}
await edit(auto,'Auto rename','Click saved');await outside.click();assert.equal(await page.locator('#auto').textContent(),'Click saved');
let input=await edit(auto,'Auto rename','Tab saved');await input.press('Tab');assert.equal(await page.locator('#auto').textContent(),'Tab saved');
input=await edit(auto,'Auto rename','Discard');await input.press('Escape');await outside.click();assert.equal(await page.locator('#auto').textContent(),'Tab saved');assert.equal(await page.locator('#commits').textContent(),'2');
input=await edit(auto,'Auto rename','Enter saved');await input.press('Enter');assert.equal(await page.locator('#auto').textContent(),'Enter saved');assert.equal(await page.locator('#forms').textContent(),'0');
await edit(manual,'Manual rename','Discard click');await outside.click();assert.equal(await page.locator('#manual').textContent(),'Manual name');
input=await edit(manual,'Manual rename','Discard tab');await input.press('Tab');assert.equal(await page.locator('#manual').textContent(),'Manual name');
input=await edit(manual,'Manual rename','Manual saved');await input.press('Enter');assert.equal(await page.locator('#manual').textContent(),'Manual saved');
await edit(auto,'Auto rename','View change saved');await page.evaluate(()=>window.hideAuto());assert.equal(await page.locator('#auto').textContent(),'View change saved');
assert.deepEqual(errors,[]);console.log('PASS: default click-away/Tab/Enter commit, Escape cancellation, Enter-only cancellation on blur, and no enclosing-form submission.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
