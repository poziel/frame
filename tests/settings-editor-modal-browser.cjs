const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(String(error)));
    await page.goto(`${process.env.FRAME_TEST_URL || 'http://127.0.0.1:1421'}/@fs/${path.join(__dirname, 'fixtures/settings/index.html').replaceAll('\\', '/')}`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => { fixture.installEditor(); fixture.frame.workspace.setPaneMode(fixture.frame.workspace.initialPaneId, 'tabs'); fixture.frame.openSettings(); });
    const modal = page.locator('.frame-modal');
    await page.getByRole('dialog', { name: 'Settings', exact: true }).waitFor();
    await page.evaluate(() => { window.originalSettingsModal = document.querySelector('.frame-modal'); });
    await modal.getByRole('button', { name: 'Maximize modal', exact: true }).click();
    await modal.getByRole('button', { name: 'Open Settings (JSON)', exact: true }).click();
    await page.getByRole('dialog', { name: 'settings.json', exact: true }).waitFor();
    assert.equal(await modal.count(), 1);
    assert.equal(await page.evaluate(() => originalSettingsModal === document.querySelector('.frame-modal')), true);
    assert.equal(await modal.evaluate(el => el.classList.contains('maximized')), true);
    assert.equal(await page.locator('.settings-json-toolbar').count(), 0);
    assert.equal(await page.evaluate(() => fixture.frame.workspace.tabs.value.filter(tab => tab.id.startsWith('frame.settings')).length), 0);
    assert.equal(await modal.getByRole('button', { name: 'Save', exact: true }).isDisabled(), true);
    assert.equal(await modal.locator('header').evaluate(header => {
      const separator = header.querySelector('[role="separator"]');
      const buttons = [...header.querySelectorAll('button')];
      const save = buttons.find(button => button.getAttribute('aria-label') === 'Save');
      const back = buttons.find(button => button.getAttribute('aria-label') === 'Open Settings (UI)');
      const maximize = buttons.find(button => button.getAttribute('aria-label') === 'Restore modal');
      return !!separator && !!(save.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(back.compareDocumentPosition(separator) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(separator.compareDocumentPosition(maximize) & Node.DOCUMENT_POSITION_FOLLOWING);
    }), true);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    async function edit(text) {
      await modal.locator('.monaco-editor').waitFor();
      await page.waitForFunction(() => document.querySelector('.frame-code-editor')?.getAttribute('aria-busy') === 'false');
      await modal.locator('.monaco-editor .view-lines').click({ position: { x: 50, y: 10 } });
      await page.keyboard.press('Control+a');
      await page.evaluate(text => navigator.clipboard.writeText(text), text);
      await page.keyboard.press('Control+v');
      await page.waitForFunction(() => fixture.frame.settings.json.dirty.value);
    }
    await edit('{"editor.fontSize":20}');
    assert.equal(await page.evaluate(() => fixture.frame.settings.read('editor.fontSize')), 14);
    assert.equal(await modal.getByRole('button', { name: 'Save', exact: true }).isEnabled(), true);
    await modal.getByRole('button', { name: 'Open Settings (UI)', exact: true }).click();
    await page.getByRole('dialog', { name: 'Settings', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => fixture.frame.settings.read('editor.fontSize')), 14);
    await modal.getByRole('button', { name: 'Open Settings (JSON)', exact: true }).click();
    assert.equal(await modal.getByRole('button', { name: 'Save', exact: true }).isDisabled(), true);
    await edit('{"editor.fontSize":22}');
    await modal.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForFunction(() => JSON.parse(fixture.saved())['editor.fontSize'] === 22 && !fixture.frame.settings.json.dirty.value, null, { timeout: 5000 }).catch(async error => { console.error(await page.evaluate(() => ({draft: fixture.frame.settings.json.draft.value, error: fixture.frame.settings.json.error.value, saved: fixture.saved(), effective: fixture.frame.settings.toJSON(), mode: fixture.frame.settings.mode.value}))); throw error; });
    await page.evaluate(() => { window.hostSaves = 0; fixture.frame.commands.register({ id: 'host.save', label: 'Host Save', shortcut: 'Ctrl+S', run() { window.hostSaves++; } }); });
    await edit('{"editor.fontSize":24}'); await page.keyboard.press('Control+s');
    await page.waitForFunction(() => JSON.parse(fixture.saved())['editor.fontSize'] === 24 && !fixture.frame.settings.json.dirty.value);
    await edit('{"editor.fontSize":26}'); await modal.locator('header').focus(); await page.keyboard.press('Control+s');
    await page.waitForFunction(() => JSON.parse(fixture.saved())['editor.fontSize'] === 26 && !fixture.frame.settings.json.dirty.value);
    assert.equal(await page.evaluate(() => window.hostSaves), 0);
    assert.equal(await modal.getByRole('button', { name: 'Save', exact: true }).isDisabled(), true);
    await page.screenshot({ path: 'output/playwright/settings-json-modal.png' });
    assert.deepEqual(errors, []);
    console.log('Settings modal checks passed: same dialog and maximized state, header separator/order, discard, dirty Save, Ctrl+S, file title, and no editor toolbar.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
