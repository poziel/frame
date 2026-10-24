const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${process.env.FRAME_TEST_URL||'http://localhost:1448'}/@fs/${path.join(__dirname,'fixtures/navigation-bar/index.html').replaceAll('\\','/')}`);
 const nav=page.getByRole('navigation',{name:'Navigation bar',exact:true});await nav.getByRole('button',{name:'Alpha',exact:true}).waitFor();
 const widen=await page.addStyleTag({content:'.navigation-bar:not(.bar-horizontal){width:220px}'});
 let previousX;
 for(const direction of ['ltr','rtl']){
 await page.locator('.workbench').evaluate((el,direction)=>el.dir=direction,direction);
 for(const position of ['left','right'])for(const display of ['icons','text','both'])for(const justification of ['left','center','right']){
  await page.evaluate(({position,display,justification})=>{const b=window.__navFrame.navigationBar;b.setPosition(position);b.setDisplay(display);b.setJustification(justification);},{position,display,justification});
  await page.waitForFunction(j=>document.querySelector('.navigation-bar').dataset.justification===j,justification);
  const content=nav.locator('[data-nav-id=Alpha] '+(display==='text'?'.bar-item-label':'.bar-icon-slot'));const box=await content.boundingBox();
  if(justification!=='left')assert(box.x>previousX+10);previousX=box.x;
  assert.equal(await nav.locator('[data-nav-id=Alpha]').evaluate(el=>getComputedStyle(el).justifyContent),{left:'left',center:'center',right:'right'}[justification]);
 }
 }
 await page.locator('.workbench').evaluate(el=>el.dir='ltr');
 await widen.evaluate(el=>el.remove());
 await page.evaluate(()=>{window.__navFrame.navigationBar.setPosition('top');window.__navFrame.navigationBar.setDisplay('both');});
 const separator=nav.locator('[data-nav-wrapper=separator]');const sep=await separator.boundingBox();assert(sep.width>=16);
 const alpha=await nav.locator('[data-nav-id=Alpha]').boundingBox();
 await page.mouse.move(sep.x+sep.width/2,sep.y+sep.height/2);await page.mouse.down();await page.mouse.move(alpha.x,alpha.y+alpha.height/2,{steps:10});await page.mouse.up();
 assert.equal(await page.evaluate(()=>window.__navFrame.navigationBar.items.value[0].id),'separator');
 await page.evaluate(()=>window.__navFrame.navigationBar.moveItem('separator','link'));
 const a=await nav.locator('[data-nav-id=Alpha]').boundingBox(),b=await nav.locator('[data-nav-id=Beta]').boundingBox(),source=await nav.locator('[data-nav-id=menu]').boundingBox();
 await page.mouse.move(source.x+5,source.y+5);await page.mouse.down();
 const centers=[];
 for(const x of [a.x+a.width-.5,b.x+.5]){
  await page.mouse.move(x,a.y+a.height/2,{steps:8});
  const active=nav.locator('.bar-drop-active');assert.equal(await active.getAttribute('data-bar-drop-before'),'Beta');
  const box=await active.boundingBox();centers.push(box.x+box.width/2);
 }
 assert.equal(centers[0],centers[1]);assert(Math.abs(centers[0]-(a.x+a.width+b.x)/2)<1);await page.mouse.up();
 // Three items per view bar let a third item hover over either neighbor's edge.
 await page.evaluate(()=>{const f=window.__navFrame;for(const [region,first]of [['primary','view'],['secondary','secondary'],['bottom','panel']]){
  for(let i=2;i<=3;i++)f.registerView({id:first+i,label:first+i,component:{render:()=>null}},region);
  f.openView(first);
 }});
 for(const [first,axis]of [['view','y'],['secondary','y'],['panel','x']]){
  const list=page.locator('.bar-drop-list').filter({has:page.locator(`[data-view-id="${first}"]`)});
  const firstBox=await list.locator(`[data-view-id="${first}"]`).boundingBox(),secondBox=await list.locator(`[data-view-id="${first}2"]`).boundingBox(),thirdBox=await list.locator(`[data-view-id="${first}3"]`).boundingBox();
  await page.mouse.move(thirdBox.x+5,thirdBox.y+5);await page.mouse.down();const markers=[];
  for(const point of axis==='x'?[[firstBox.x+firstBox.width-.5,firstBox.y+firstBox.height/2],[secondBox.x+.5,secondBox.y+secondBox.height/2]]:[[firstBox.x+firstBox.width/2,firstBox.y+firstBox.height-.5],[secondBox.x+secondBox.width/2,secondBox.y+.5]]){
   await page.mouse.move(...point,{steps:8});const drop=await page.evaluate(()=>JSON.parse(JSON.stringify(window.__navFrame.dragState.drop)));
   assert.equal(drop.before,first+'2');markers.push(drop.marker);
  }
  assert.deepEqual(markers[0],markers[1]);await page.keyboard.press('Escape');await page.mouse.up();
 }
 await page.evaluate(()=>window.__navFrame.navigationBar.setPosition('left'));
 await nav.locator('[data-nav-id=Alpha]').click({button:'right'});
 await page.getByRole('menu',{name:'Navigation bar',exact:true}).getByText('Navigation Item Justification',{exact:true}).hover();
 await page.getByRole('menuitemcheckbox',{name:'Right',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__navFrame.navigationBar.justification.value),'right');
 await page.evaluate(()=>window.__navFrame.executeCommand('frame.layout.customize'));
 const options=page.locator('.layout-options [data-option]');await options.first().waitFor();
 assert.deepEqual((await options.evaluateAll(els=>els.map(el=>el.dataset.option))).slice(0,11),['menu','navigation-bar','primary-view-bar','primary','secondary-view-bar','secondary','panel-view-bar','panel','banner','status','navigation']);
 const groups=await page.locator('.layout-options small').allTextContents();
 const before=(a,b)=>assert(groups.indexOf(a)>=0&&groups.indexOf(a)<groups.indexOf(b),`${a} before ${b}`);
 before('Navigation Bar Position','Primary View Bar Position');before('Primary View Bar Size','Primary Sidebar Position');before('Primary Sidebar Position','Secondary View Bar Position');before('Secondary View Bar Size','Panel View Bar Display');before('Panel View Bar Size','Panel Position');before('Panel Alignment','Banner Alignment');
 await page.locator('[data-option=nav-justify-center]').click();assert.equal(await page.evaluate(()=>window.__navFrame.navigationBar.justification.value),'center');
 assert.deepEqual(errors,[]);console.log('Side justification, separator dragging, centered gap targets in all bars, and Customize Layout ordering passed');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1);});
