const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 850 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:1460');
    const first = page.locator('#first'), second = page.locator('#second');
    const toggle = first.getByRole('button', { name: 'Toggle primary sidebar', exact: true });
    await toggle.waitFor();
    await toggle.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Move to Status Bar — Left', exact: true }).click();
    assert.equal(await first.locator('.titlebar').getByRole('button', { name: 'Toggle primary sidebar', exact: true }).count(), 0);
    const statusToggle = first.locator('.status-left').getByRole('button', { name: 'Toggle primary sidebar', exact: true });
    await statusToggle.waitFor(); assert.equal(await statusToggle.getAttribute('aria-expanded'), 'true');
    assert.equal(await statusToggle.evaluate(element => document.activeElement === element), true);
    await statusToggle.click(); assert.equal(await statusToggle.getAttribute('aria-expanded'), 'false');
    await statusToggle.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Move to Title Bar', exact: true }).click();
    await first.locator('.titlebar').getByRole('button', { name: 'Toggle primary sidebar', exact: true }).waitFor();
    assert.equal(await first.locator('.titlebar').getByRole('button', { name: 'Toggle primary sidebar', exact: true }).evaluate(element => document.activeElement === element), true);
    await page.evaluate(() => window.placementFixture.frame.toolbar.setPlacement('action:refresh', { area: 'statusBar', side: 'right' }));
    const refresh = first.locator('.status-right').getByRole('button', { name: 'Refresh fixture', exact: true });
    await refresh.click(); assert.equal(await page.locator('#runs').textContent(), '1');
    await page.evaluate(() => window.placementFixture.frame.commands.disable('refresh'));
    assert.equal(await refresh.isDisabled(), true);
    assert.equal(await second.locator('.titlebar').getByRole('button', { name: 'Toggle primary sidebar', exact: true }).count(), 1);
    await page.evaluate(() => window.placementFixture.remount());
    await page.evaluate(() => window.placementFixture.remount());
    await first.locator('.status-right').getByRole('button', { name: 'Refresh fixture', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log('Verified title/status context-menu moves, expanded state, custom action, command gating, isolation and remount.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
