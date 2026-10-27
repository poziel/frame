const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
const page=await browser.newPage({viewport:{width:1500,height:900}});page.setDefaultTimeout(7000);const errors=[];page.on('pageerror',e=>errors.push(String(e)));const base=process.env.FRAME_TEST_URL||'http://localhost:1448';
const fixture=name=>`${base}/@fs/${path.join(__dirname,'fixtures',name,'index.html').replaceAll('\\','/')}`;
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const near=(a, b)=>assert(Math.abs(a-b)<2,`${a} != ${b}`);
await page.goto(fixture('panel-controls'));await page.locator('.bottom-region').waitFor();const panel=page.locator('.bottom-region'),workspace=page.locator('.workspace-region');
await panel.getByRole('textbox',{name:'Panel draft',exact:true}).fill('Retained through docking');
for(const side of ['left','right'])for(const position of ['top','bottom','left','right'])for(const alignment of ['center','left','right','justify']){
 await page.evaluate(({side,position,alignment})=>Object.assign(window.panelFixture.layout,{primarySide:side,panelPosition:position,panelAlignment:alignment,panelVisible:false,maximizedRegion:null}),{side,position,alignment});await settle();const full=await workspace.boundingBox();
 await page.evaluate(()=>window.panelFixture.layout.panelVisible=true);await settle();const b=await panel.boundingBox(),w=await workspace.boundingBox();assert(Math.min(b.width,b.height,w.width,w.height)>0);
 if(position==='left'||position==='right'){near(b.y,w.y);near(b.height,w.height);if(position==='left'){near(b.x,full.x);near(b.x+b.width+6,w.x);}else{near(b.x+b.width,full.x+full.width);near(w.x+w.width+6,b.x);}}
 else if(position==='top')near(b.y+b.height+6,w.y);else near(w.y+w.height+6,b.y);
 if((position==='top'||position==='bottom')&&alignment==='center'){near(b.x,w.x);near(b.width,w.width);}
 assert.equal(await panel.getByRole('textbox',{name:'Panel draft',exact:true}).inputValue(),'Retained through docking');
 await panel.getByRole('button',{name:'Maximize panel',exact:true}).click();await panel.getByRole('button',{name:'Restore panel',exact:true}).click();await settle();const restored=await panel.boundingBox();for(const k of ['x','y','width','height'])near(restored[k],b[k]);
}
console.log('Panel fixture: 4 docking positions × 4 alignments × 2 sidebar sides; retained content and maximize/restore passed');
await page.goto(fixture('sidebar-parity'));const root=page.locator('#sidebar-instance-0');await root.waitFor();
const bar=region=>root.getByRole('navigation',{name:region==='primary'?'Primary view bar':'Secondary view bar',exact:true});
const api=async fn=>{await page.evaluate(fn);await settle();};
for(const position of ['default','top','bottom']){
 await page.evaluate(position=>{const f=window.sidebarFrames[0];f.primaryViewBar.setPosition(position);f.secondaryViewBar.setPosition(position);f.openSidePanel('p1');f.openSecondaryPanel('s1');},position);await settle();
 for(const region of ['primary','secondary']){const label=region==='primary'?'Primary view 1':'Secondary view 1';await bar(region).getByRole('button',{name:label,exact:true}).click();const content=root.locator(region==='primary'?'#side-panel':'#secondary-panel');assert.equal(await content.isVisible(),position!=='default');await page.evaluate(()=>{window.sidebarFrames[0].openSidePanel('p1');window.sidebarFrames[0].openSecondaryPanel('s1');});}
}
await page.evaluate(()=>{window.sidebarFrames[0].primaryViewBar.setPosition('default');window.sidebarFrames[0].secondaryViewBar.setPosition('default');});
await root.getByRole('textbox',{name:'Primary 1 draft',exact:true}).fill('Retained primary');await root.getByRole('textbox',{name:'Secondary 1 draft',exact:true}).fill('Retained secondary');
await api(()=>{const f=window.sidebarFrames[0];f.closeSidePanel();f.closeSecondaryPanel();f.openSidePanel('p1');f.openSecondaryPanel('s1');f.layout.primarySide='right';});
assert.equal(await root.getByRole('textbox',{name:'Primary 1 draft',exact:true}).inputValue(),'Retained primary');assert.equal(await root.getByRole('textbox',{name:'Secondary 1 draft',exact:true}).inputValue(),'Retained secondary');
assert.deepEqual(errors,[]);console.log('Sidebar fixture: primary/secondary selection, horizontal/vertical visibility, swapping, and retained input passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
