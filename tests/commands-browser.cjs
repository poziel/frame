const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', error => { errors.push(error.stack ?? String(error)); console.error(error.stack ?? String(error)); });
    page.setDefaultTimeout(10000);
    await page.goto(`${process.env.FRAME_TEST_URL || 'http://localhost:1420'}/@fs/${path.join(__dirname, 'fixtures/quick-input/index.html').replaceAll('\\', '/')}`);
    await page.getByLabel('first content', { exact: true }).waitFor();
    await page.evaluate(() => {
      const f = fixture.first;
      f.commands.prefixes.register({ prefix: '!', label: 'Artwork actions', placeholder: 'Find artwork actions…' });
      f.commands.register({ id: 'app.art', label: 'Inspect artwork', quickInput: '!', feature: 'artwork', run() { fixture.calls.value = 'art'; } });
      f.commands.disable('app.find');
    });
    await page.getByLabel('first content', { exact: true }).click(); await page.keyboard.press('Control+p');
    await page.locator('.command-result.disabled').filter({ hasText: 'Find document' }).waitFor().catch(async error => {
      console.error(await page.evaluate(() => ({ input: fixture.first.quickInput.value, enabled: fixture.first.commands.isEnabled('app.find'), items: fixture.first.quickInputItems.value, body: document.body.innerText.slice(-1200) })));
      throw error;
    });
    await page.getByRole('combobox').fill('!'); await page.keyboard.press('Tab');
    await page.getByRole('option', { name: 'Inspect artwork', exact: true }).waitFor();
    assert.equal(await page.locator('.quick-input-operator').textContent(), '!');
    assert.equal(await page.getByRole('option', { name: 'Find document', exact: false }).count(), 0);
    await page.keyboard.press('Enter'); await page.waitForFunction(() => fixture.calls.value === 'art');
    await page.keyboard.press('Control+p'); await page.getByRole('combobox').fill('! ');
    await page.locator('.quick-input-operator').waitFor(); await page.keyboard.press('Backspace');
    await page.waitForFunction(() => !document.querySelector('.quick-input-operator'));
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const f = fixture.first;
      f.secondarySidebar.disable(); f.secondaryViewBar.disable(); f.panel.disable(); f.panelViewBar.disable();
      f.menuBar.disable(); f.navigationBar.disable();
    });
    await page.keyboard.press('Control+Alt+b'); await page.keyboard.press('Control+j');
    await page.evaluate(async () => {
      const f = fixture.first;
      await f.commands.execute('frame.secondary.toggle'); f.openSecondaryPanel(); f.secondarySidebar.open();
      f.layout.secondarySidebarVisible = true; f.layout.panelVisible = true;
    });
    assert.deepEqual(await page.evaluate(() => [fixture.first.layout.secondarySidebarVisible, fixture.first.layout.panelVisible, fixture.first.layout.menuBarVisible]), [false, false, false]);
    await page.keyboard.press('Control+Shift+p'); await page.getByRole('combobox').waitFor();
    assert.equal(await page.getByRole('option', { name: 'Layout: Toggle secondary sidebar', exact: false }).count(), 0);
    assert.equal(await page.getByRole('option', { name: 'Layout: Toggle panel', exact: false }).count(), 0);
    await page.keyboard.press('Escape');
    await page.evaluate(() => fixture.first.commands.execute('frame.layout.customize'));
    await page.getByRole('menu', { name: 'Layout options', exact: true }).waitFor();
    assert.equal(await page.getByRole('menuitemcheckbox', { name: 'Secondary Sidebar', exact: false }).count(), 0);
    assert.equal(await page.getByRole('menuitemcheckbox', { name: 'Panel Ctrl+J', exact: true }).count(), 0);
    await page.keyboard.press('Escape');
    await page.evaluate(() => { fixture.first.secondarySidebar.enable(); fixture.first.secondaryViewBar.enable(); });
    assert.equal(await page.evaluate(() => fixture.first.layout.secondarySidebarVisible), false);
    await page.keyboard.press('Control+Alt+b');
    assert.equal(await page.evaluate(() => fixture.first.layout.secondarySidebarVisible), true);
    await page.getByRole('navigation', { name: 'Primary view bar', exact: true }).click({ button: 'right' });
    await page.getByRole('menu', { name: 'Primary view bar', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, []);
    console.log('Command browser checks passed: custom prefixes, disabled rows, unavailable shortcuts/APIs/menus, restoration, and command-backed context menus.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
