// Run against the docs dev server, or set FRAME_DOCS_URL.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}}), errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(process.env.FRAME_DOCS_URL || 'http://127.0.0.1:1420');
    if (!await page.getByRole('navigation',{name:'Components catalog',exact:true}).isVisible()) await page.getByRole('button',{name:'Components',exact:true}).click();
    for (const title of ['File upload', 'File drop zone']) {
      await page.getByRole('navigation',{name:'Components catalog',exact:true}).getByRole('button', {name:title,exact:true}).click();
      assert.equal(await page.locator('.documentation-page h1').textContent(),title);
      assert.ok(await page.locator('[data-upload-example]').count());
      await page.getByRole('tab',{name:'API',exact:true}).click();
      assert.match(await page.locator('.documentation-api').textContent(),/maxSize/);
      await page.getByRole('tab',{name:'Theming',exact:true}).click();
      assert.match(await page.getByRole('tabpanel').textContent(),/--frame-/);
      await page.getByRole('tab',{name:'Interactive demo',exact:true}).click();
      const demo = page.locator('[data-upload-example]');
      await demo.locator('input[type=file]').setInputFiles({name:'sample.txt',mimeType:'text/plain',buffer:Buffer.from('sample')});
      assert.match(await demo.textContent(),/Accepted 1: sample.txt/);
      await demo.getByRole('textbox',{name:'Accepted file types',exact:true}).fill('.png');
      await demo.locator('input[type=file]').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('bad')});
      assert.match(await demo.textContent(),/Rejected \(type\): bad.txt/);
      if (title === 'File drop zone') {
        await demo.getByRole('combobox',{name:'Appearance',exact:true}).click();
        await page.getByRole('option',{name:'Invisible until dragging',exact:true}).click();
        const notes = demo.getByRole('textbox',{name:'Workspace notes'});
        await notes.fill('Keep my edits');
        const zone = demo.locator('.frame-file-drop-zone');
        await zone.evaluate(el => {const dt=new DataTransfer();dt.items.add(new File(['a'],'art.png',{type:'image/png'}));el.dispatchEvent(new DragEvent('dragenter',{bubbles:true,cancelable:true,dataTransfer:dt}));});
        assert.equal(await demo.locator('.frame-file-overlay').count(),1);
        await zone.evaluate(el => {const dt=new DataTransfer();dt.items.add(new File(['a'],'art.png',{type:'image/png'}));el.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));});
        assert.equal(await notes.inputValue(),'Keep my edits');
        assert.equal(await demo.locator('.frame-file-overlay').count(),0);
        assert.match(await demo.textContent(),/Accepted 1: art.png/);
      }
    }
    assert.deepEqual(errors,[]);
    console.log('Documentation upload pages and live demos passed');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
