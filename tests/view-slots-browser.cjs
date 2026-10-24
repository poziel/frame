const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-proxy-server']});try{const page=await browser.newPage({viewport:{width:1100,height:650}});let errors=[];page.on('pageerror',e=>{errors.push(String(e));console.error(e.stack);});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
await page.goto((process.env.FRAME_TEST_URL || 'http://127.0.0.1:1452') + '/tests/fixtures/view-slots/index.html');await page.getByRole('button',{name:'Fixed bottom',exact:true}).waitFor();await page.getByRole('textbox',{name:'Top draft'}).fill('retained');
for(const region of ['primary','secondary','bottom']){await page.evaluate(region=>{window.fixtureFrame.moveView('slots',region);window.fixtureFrame.openView('slots');},region);await page.waitForTimeout(150);const before=await page.getByRole('button',{name:'Fixed bottom',exact:true}).boundingBox();const top=await page.getByRole('textbox',{name:'Top draft'}).boundingBox();const info=await page.locator('.frame-view-middle').evaluate(e=>{e.scrollTop=500;return {height:e.clientHeight,total:e.scrollHeight,scroll:e.scrollTop,overflow:getComputedStyle(e.parentElement).overflow}});assert(info.scroll>0);assert(info.total>info.height);const after=await page.getByRole('button',{name:'Fixed bottom',exact:true}).boundingBox();assert.equal(before.y,after.y);assert.equal(top.y,(await page.getByRole('textbox',{name:'Top draft'}).boundingBox()).y);assert.equal(await page.getByRole('textbox',{name:'Top draft'}).inputValue(),'retained');assert.equal(await page.locator('.frame-view-top').evaluate(e=>getComputedStyle(e).paddingTop),'0px');assert(parseFloat(await page.locator('.frame-view-bottom').evaluate(e=>getComputedStyle(e).paddingTop))>0);}
assert.deepEqual(errors,[]);console.log('PASS: fixed top/bottom, middle scrolling, independent padding and retained content across primary/secondary/bottom regions.');

}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});




