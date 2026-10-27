const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-proxy-server']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:1481');
 const first=page.getByRole('group',{name:'First',exact:true}),second=page.getByRole('group',{name:'Second',exact:true});
 await first.getByRole('button',{name:'a',exact:true}).click();await first.getByRole('button',{name:'c',exact:true}).click({modifiers:['Shift']});
 assert.equal(await page.locator('#selected').textContent(),'a,b,c');
 await first.getByRole('button',{name:'c',exact:true}).press('Alt+ArrowDown');assert.equal(await page.locator('#order').textContent(),'d,a,b,c');
 // Simulate a host that suppresses HTML drag events (Tauri's Windows file-drop handler).
 await page.evaluate(()=>document.addEventListener('dragstart',event=>event.preventDefault(),true));
 const start=await first.locator('[data-reorder-id="a"]').boundingBox(),target=await first.locator('[data-reorder-id="d"]').boundingBox();
 await page.mouse.move(start.x+40,start.y+20);await page.mouse.down();await page.mouse.move(target.x+40,target.y+3,{steps:8});
 const indicator=first.locator('.frame-reorder-indicator');
 assert(await indicator.isVisible(),'pointer dragging must show an insertion bar when native drag events are blocked');
 assert.equal(await page.locator('[data-test-preview]').textContent(),'Moving 3: a,b,c');
 const line=await indicator.boundingBox();assert(Math.abs(line.y-target.y)<3);assert(line.width>200);assert(line.height>=2);
 await page.mouse.up();assert.equal(await page.locator('.frame-reorder-preview').count(),0);assert.equal(await page.locator('#order').textContent(),'a,b,c,d');
 // A different list is not a drop target.
 const from=await first.getByRole('button',{name:'a',exact:true}).boundingBox(),to=await second.getByRole('button',{name:'y',exact:true}).boundingBox();
 await page.mouse.move(from.x+20,from.y+10);await page.mouse.down();await page.mouse.move(to.x+10,to.y+10,{steps:5});await page.mouse.up();
 assert.equal(await second.getByRole('button').allTextContents().then(x=>x.join(',')),'x,y');
 assert.equal(await page.locator('#order').textContent(),'a,b,c,d');
 // Escape cancels an in-progress move and removes the bar.
 await page.mouse.move(from.x+20,from.y+10);await page.mouse.down();await page.mouse.move(from.x+20,from.y+70,{steps:4});await page.keyboard.press('Escape');await page.mouse.up();
 assert.equal(await page.locator('.frame-reorder-preview').count(),0);assert.equal(await indicator.count(),0);assert.equal(await page.locator('#order').textContent(),'a,b,c,d');
 await page.locator('#disable').click();await first.getByRole('button',{name:'a',exact:true}).press('Alt+ArrowUp');assert.equal(await page.locator('#order').textContent(),'a,b,c,d');
 await page.locator('#disable').click();await first.getByRole('button',{name:'c',exact:true}).click({modifiers:['Control']});assert.equal(await page.locator('#selected').textContent(),'a,b');
 assert.deepEqual(errors,[]);console.log('PASS: pointer drag with native events blocked, insertion bar position, Escape cancellation, range/toggle selection, keyboard movement, instance isolation, disabled interaction.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
