// Start Vite with tests/fixtures/theme-formats/vite.config.ts first.
// PLAYWRIGHT_MODULE can point to a shared installation; otherwise install playwright locally.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:1437/');
    const first = page.getByPlaceholder('First input');
    const second = page.getByPlaceholder('Second input');
    await first.waitFor();
    const padding = locator => locator.evaluate(element => getComputedStyle(element).padding);
    const defaultPadding = await padding(first);
    assert.equal(defaultPadding, '6px 8px');
    for (const format of ['json', 'jsonc', 'json5', 'yaml', 'toml', 'ini']) {
      await page.evaluate(format => window.themeFormatFixture.apply(format), format);
      assert.equal(await padding(first), '24px', format);
      assert.equal(await padding(second), defaultPadding, `${format} instance isolation`);
    }
    await page.getByRole('button', { name: 'Open popup', exact: true }).click();
    const popup = page.getByPlaceholder('Popup input');
    await popup.waitFor();
    assert.equal(await padding(popup), '24px', 'teleported input inherits theme');
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.themeFormatFixture.replace());
    assert.equal(await padding(first), defaultPadding, 'replacement clears component override');
    await page.evaluate(() => window.themeFormatFixture.file());
    assert.equal(await padding(first), '24px', 'file extension selects YAML parser');
    await page.evaluate(() => window.themeFormatFixture.reset());
    assert.equal(await padding(first), defaultPadding, 'reset restores default');
    assert.deepEqual(errors, []);
    console.log('Verified six formats, file imports, instance isolation, portals, replacement and reset.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
