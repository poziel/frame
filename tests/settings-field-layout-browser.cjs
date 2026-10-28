const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 try {
  const page = await browser.newPage({ viewport: { width: 1050, height: 800 } });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${process.env.FRAME_TEST_URL || 'http://127.0.0.1:1437'}/@fs/${path.join(__dirname,'fixtures/settings/index.html').replaceAll('\\','/')}`);
  await page.evaluate(() => {
   fixture.frame.settings.register({id:'layout-check',title:'Appearance',description:'Arrange Frame around the way you work.',settings:[
    {id:'layout.theme',label:'Theme',type:'select',default:'default',description:'Choose the colors and contrast used throughout the shell.',options:[{value:'default',label:'Frame default',description:'Default palette.'},{value:'dark',label:'Frame Monokai Dark',description:'A darker palette.'}]},
    {id:'layout.density',label:'Layout density',type:'text',default:'Default',description:'Choose how much space shell regions and their controls use.'},
    {id:'layout.long',label:'Long translated setting title that wraps within a narrow settings pane',type:'text',default:'Value',description:'This description deliberately wraps when the settings pane is narrow, without adding paragraph margins or pushing the settings action outside its field.'},
   ]}); fixture.frame.settings.selected.value='layout-check';fixture.frame.openSettings();
  });
  const row = page.locator('[data-setting-id="layout.theme"]'); await row.hover();
  assert.equal(await row.locator('.settings-modified-bar').count(),0);
  assert.equal(await row.evaluate(el=>['none','normal'].includes(getComputedStyle(el,'::before').content)),true);
  const check = async () => row.evaluate(el=>{
   const box=el.getBoundingClientRect(), title=el.querySelector('.setting-label').getBoundingClientRect(),button=el.querySelector('.settings-field-actions button').getBoundingClientRect(),heading=el.closest('.settings-content').querySelector('h2').getBoundingClientRect(),desc=el.querySelector('.setting-description'),css=getComputedStyle(desc);
   return {inside:button.left>=box.left&&button.right<=box.right&&button.top>=box.top&&button.bottom<=box.bottom,aligned:Math.abs(title.left-heading.left)<2,vertical:Math.abs((button.top+button.height/2)-(title.top+title.height/2))<2,margin:css.marginTop+'/'+css.marginBottom,text:desc.textContent,barLeft:parseFloat(getComputedStyle(el,'::before').insetInlineStart),gap:parseFloat(getComputedStyle(el.querySelector('.setting-field')).rowGap)};
  });
  let metrics=await check();assert.equal(metrics.inside,true);assert.equal(metrics.aligned,true);assert.equal(metrics.vertical,true);assert.equal(metrics.margin,'0px/0px');assert.match(metrics.text,/shell\. Default palette\./);assert.ok(metrics.gap<=6);
  await row.locator('.setting-description').click();assert.equal(await row.evaluate(el=>el.matches(':focus-within')),true);
  const select = row.getByRole('combobox', {name:'Theme',exact:true});
  await select.click();
  const option = page.getByRole('option',{name:'Frame Monokai Dark',exact:true});
  await option.focus();
  assert.equal(await row.evaluate(el=>el.classList.contains('owned-focus')),true);
  assert.equal(await row.evaluate(el=>{const s=getComputedStyle(el);return s.borderLeftColor===s.borderTopColor&&s.borderLeftColor!=='rgba(0, 0, 0, 0)';}),true);
  assert.equal(await row.locator('.settings-modified-bar').count(),0);
  await option.click();
  assert.equal(await row.locator('.settings-modified-bar').count(),1);
  await row.getByRole('button',{name:'More Actions for Theme',exact:true}).click();assert.equal(await row.evaluate(el=>el.classList.contains('menu-open')),true);await page.keyboard.press('Escape');
  await page.evaluate(()=>fixture.frame.settings.set('layout.theme','dark'));
  assert.equal(await row.locator('.settings-modified-bar').evaluate(bar=>{const a=bar.getBoundingClientRect(),b=bar.parentElement.getBoundingClientRect();return a.right<=b.left-2&&a.top>b.top&&a.bottom<b.bottom;}),true);
  await page.evaluate(()=>fixture.frame.settings.reset('layout.theme'));
  assert.equal(await row.locator('.settings-modified-bar').count(),0);
  await page.evaluate(()=>fixture.frame.settings.set('layout.theme','dark'));
  await page.locator('[data-setting-id="layout.density"]').click({position:{x:100,y:8}});assert.equal(await page.locator('[data-setting-id="layout.density"]').evaluate(el=>el.matches(':focus-within')),true);
  await page.screenshot({path:'.ai-workspace/playwright/settings-fields-refined.png'});
  await page.setViewportSize({width:720,height:720});await row.hover();metrics=await check();assert.equal(metrics.inside,true);assert.equal(metrics.aligned,true);
  const long=page.locator('[data-setting-id="layout.long"]');assert.equal(await long.locator('.setting-description').evaluate(el=>getComputedStyle(el).margin),'0px');
  await row.evaluate(el=>{el.dir='rtl';});await row.hover();
  assert.equal(await row.evaluate(el=>{const box=el.getBoundingClientRect(),button=el.querySelector('.settings-field-actions button').getBoundingClientRect(),bar=el.querySelector('.settings-modified-bar').getBoundingClientRect();return button.left>=box.left&&button.right<box.left+50&&bar.left>=box.right+2;}),true);
  assert.deepEqual(errors,[]);console.log('Settings field layout passed: modified-only external indicators, owned-popup focus, full-row focus, title alignment, compact descriptions, menu retention, and narrow layout.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
