// Start: bunx vite --config tests/fixtures/file-upload/vite.config.ts
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(process.env.FILE_UPLOAD_TEST_URL || 'http://127.0.0.1:1447');
    const payload = { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('123') };
    const picker = page.locator('.frame-file-upload input[type=file]');
    let chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Choose file', exact: true }).first().click();
    await (await chooser).setFiles(payload);
    await picker.setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.from('12345') });
    assert.match(await page.locator('.frame-file-upload [role=status]').textContent(), /size/);
    assert.match(await page.locator('.frame-file-list').textContent(), /a.png/);
    await page.waitForFunction(() => document.querySelector('#count').textContent === '1');
    await picker.setInputFiles(payload);
    await page.waitForFunction(() => document.querySelector('#count').textContent === '2');
    await page.getByRole('button', { name: 'Remove a.png' }).click();
    assert.equal(await page.locator('.frame-file-list').count(), 0);
    await picker.setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('1') });
    assert.match(await page.locator('.frame-file-upload [role=status]').textContent(), /type/);
    chooser = page.waitForEvent('filechooser');
    await page.locator('#api-open').click();
    await (await chooser).setFiles(payload);
    await page.locator('#clear').click();
    assert.equal(await page.locator('.frame-file-list').count(), 0);
    async function drag(selector, kind, files = true) {
      await page.locator(selector).evaluate((el, args) => {
        const dt = new DataTransfer();
        if (args.files) dt.items.add(new File(['1'], 'drop.png', { type: 'image/png' }));
        else dt.setData('text/plain', 'hello');
        el.dispatchEvent(new DragEvent(args.kind, { bubbles: true, cancelable: true, dataTransfer: dt }));
      }, { kind, files });
    }
    const overlays = () => page.locator('#overlay .frame-file-overlay').count();
    await drag('#overlay', 'dragenter', false); assert.equal(await overlays(), 0);
    await drag('#overlay', 'dragenter'); assert.equal(await overlays(), 1);
    await page.locator('#canvas').evaluate(el => el.originalIdentity = true);
    await drag('#canvas', 'dragenter'); await drag('#canvas', 'dragleave'); assert.equal(await overlays(), 1);
    await drag('#overlay', 'drop'); assert.equal(await overlays(), 0);
    assert.equal(await page.locator('#accepted').textContent(), 'drop.png');
    assert.equal(await page.locator('#canvas').evaluate(el => el.originalIdentity), true);
    await page.locator('#canvas').fill('still usable');
    await drag('#overlay', 'dragenter'); await drag('#overlay', 'dragleave'); assert.equal(await overlays(), 0);
    await drag('#overlay', 'dragenter'); await page.locator('#canvas').press('Escape'); assert.equal(await overlays(), 0);
    await page.locator('#disable').click(); await drag('#overlay', 'dragenter'); assert.equal(await overlays(), 0);
    await drag('#outer', 'dragenter'); await drag('#inner', 'dragenter'); await drag('#inner', 'drop');
    assert.equal(await page.locator('#accepted').textContent(), 'inner');
    assert.equal(await page.locator('#outer .frame-file-overlay').count(), 0);
    await page.locator('#visible input[type=file]').setInputFiles([payload, { ...payload, name: 'b.png' }, { ...payload, name: 'c.png' }]);
    assert.equal(await page.locator('#accepted').textContent(), 'a.png,b.png');
    assert.match(await page.locator('#visible [role=status]').textContent(), /count/);
    assert.deepEqual(errors, []);
    console.log('File upload browser checks passed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
