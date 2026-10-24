// Run with NODE_PATH pointing to a runtime containing Playwright.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch(process.env.FRAME_BROWSER_CHANNEL ? { channel: process.env.FRAME_BROWSER_CHANNEL } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    const fixture = path.join(__dirname, 'fixtures/manage-position/index.html').replaceAll('\\', '/');
    await page.goto(`${process.env.FRAME_TEST_URL || 'http://localhost:1448'}/@fs/${fixture}`);
    const button = name => page.getByRole('button', { name, exact: true });
    const manage = button('Manage');
    const inRegion = async region => {
      await page.locator(region).getByRole('button', { name: 'Manage', exact: true }).waitFor();
      assert.equal(await manage.count(), 1);
    };
    await inRegion('.status-bar');
    assert((await manage.boundingBox()).x > (await button('Notification history').boundingBox()).x);
    for (const position of ['default', 'top', 'bottom']) {
      await button(`Activity ${position}`).click();
      await inRegion('.status-bar');
      assert.equal(await page.locator('.view-bar').getByRole('button', { name: 'Manage', exact: true }).count(), 0);
    }
    const menu = page.getByRole('menu', { name: 'Manage', exact: true });
    await manage.click(); await menu.waitFor();
    assert((await menu.boundingBox()).y < (await manage.boundingBox()).y);
    await menu.getByRole('menuitem', { name: 'Settings', exact: false }).click();
    await page.locator('.frame-settings').waitFor();
    await page.keyboard.press('Escape');
    async function move(position, keyboard = false) {
      if (keyboard) { await manage.focus(); await page.keyboard.press('Shift+F10'); }
      else await manage.click({ button: 'right' });
      const popup = page.getByRole('menu', { name: 'Status bar actions', exact: true });
      await popup.waitFor();
      await popup.getByRole('menuitem', { name: position === 'Top' ? 'Move to Title Bar' : 'Move to Status Bar', exact: true }).click();
    }
    await move('Top'); await inRegion('.titlebar');
    await manage.click(); await menu.waitFor();
    assert((await menu.boundingBox()).y > (await manage.boundingBox()).y);
    await page.keyboard.press('Escape');
    await move('Bottom', true); await inRegion('.status-bar');
    await button('API top').click(); await button('Hide layout controls').click();
    await inRegion('.titlebar');
    await button('API bottom').click(); await inRegion('.status-bar');
    await button('Toggle settings').click(); await manage.waitFor({ state: 'detached' });
    await button('Toggle settings').click(); await inRegion('.status-bar');
    assert.deepEqual(errors, []);
    console.log('Manage placement, Settings dispatch, dropdown direction, pointer/keyboard position menu, API changes, and disabled settings passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
