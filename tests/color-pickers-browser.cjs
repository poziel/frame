const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1400}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:1477');
  await page.locator('[data-picker="0"]').first().waitFor();
  for(const picker of [0,1,2]){
   const small=page.locator(`[data-picker="${picker}"][data-size="240"] .frame-hsv-area`);
   const large=page.locator(`[data-picker="${picker}"][data-size="400"] .frame-hsv-area`);
   assert(Math.abs((await small.boundingBox()).width-240)<1);
   assert(Math.abs((await large.boundingBox()).width-400)<1);
   const smallThumb=await small.locator('.frame-color-thumb').first().boundingBox(),largeThumb=await large.locator('.frame-color-thumb').first().boundingBox();
   assert(largeThumb.width>smallThumb.width);
   assert(Math.abs(largeThumb.width-largeThumb.height)<1);
   if(picker!==1){
    const a=await small.locator('.frame-color-slider').boundingBox(),b=await large.locator('.frame-color-slider').boundingBox();
    assert(b.width>a.width*1.5 && b.height>a.height*1.5);
    assert((await small.locator('.frame-color-track').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('to top'));
   }else{
    const disc=await large.locator('.frame-hsv-disc').boundingBox();assert(Math.abs(disc.width-disc.height)<1);
   }
  }
  for(const channel of ['hue','brightness','alpha','red'])for(const axis of ['vertical','horizontal'])for(const inverted of [false,true]){
   const slider=page.locator(`[data-channel="${channel}"][data-axis="${axis}"][data-inverted="${inverted}"]`);
   const background=await slider.locator('.frame-color-track').evaluate(el=>getComputedStyle(el).backgroundImage);
   const direction=axis==='vertical'?(inverted?'bottom':'top'):(inverted?'left':'right');
   assert(background.includes(`to ${direction}`)||(direction==='bottom'&&background.startsWith('linear-gradient(rgb')),background);
   if(channel==='alpha')assert(background.includes('45deg'),'alpha checks retain their own orientation');
  }
  const hueSlider=page.locator('[data-channel="hue"][data-axis="vertical"][data-inverted="false"]');
  const box=await hueSlider.locator('.frame-color-track').boundingBox();
  const before=await page.locator('#color').textContent();
  await page.mouse.click(box.x+box.width/2,box.y+box.height*.2);
  assert.notEqual(await page.locator('#color').textContent(),before);
  await page.screenshot({path:'.tmp/color-pickers.png'});
  // Actual catalog pages use a bounded demo and expose the separate public components.
  for(const name of ['HSV Rectangle','HSV Wheel','VHS Circle']){
   await page.goto('http://127.0.0.1:1475/');
   await page.getByRole('button',{name,exact:true}).click();
   await page.locator('.frame-hsv-area').first().waitFor();
   for(const area of await page.locator('.frame-hsv-area').all())assert((await area.boundingBox()).width<=400);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: picker components, proportional sizing, round thumbs, vertical/horizontal/inverted gradients, alpha checks, pointer editing, and bounded documentation previews.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
