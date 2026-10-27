const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    page.setDefaultTimeout(15000);
    await page.goto(
      `${process.env.FRAME_TEST_URL || 'http://localhost:1421'}/@fs/${path.join(__dirname, 'fixtures/settings/index.html').replaceAll('\\', '/')}`
    );
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => fixture.frame.openSettings());
    const modal = page.getByRole('dialog', {name: 'Settings', exact: true});
    await modal.waitFor();
    assert.equal(
      (await modal.locator('.frame-modal-header svg').count()) > 0,
      true
    );
    await page.getByRole('button', {name: 'Test setting', exact: true}).click();
    await page.waitForFunction(
      () => fixture.frame.settings.read('editor.custom') === 'tested'
    );
    const custom = page.locator('[data-setting-id="editor.custom"]');
    assert.equal(await custom.locator('.frame-input-group').count(), 1);
    assert.equal(await custom.locator('.settings-modified-bar').count(), 1);
    assert.equal(await custom.getByText('Modified', {exact: true}).count(), 0);
    assert.equal(
      await custom.evaluate(
        (row) =>
          row
            .querySelector('.setting-description')
            .compareDocumentPosition(row.querySelector('.frame-input-group')) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ),
      4
    );
    // Empty, unowned panes can host settings without an artwork tab.
    assert.equal(
      await modal
        .getByRole('button', {name: 'Open Settings in Editor Tab', exact: true})
        .count(),
      1
    );
    assert.equal(
      await modal
        .getByRole('button', {name: 'Open Settings (JSON)', exact: true})
        .count(),
      0
    );
    const checkbox = page.getByRole('checkbox', {
      name: 'Editor: Format On Save',
      exact: true,
    });
    assert.equal(
      await checkbox.evaluate((e) => getComputedStyle(e).borderTopWidth),
      '1px'
    );
    await checkbox.click();
    await page.waitForFunction(
      () => JSON.parse(fixture.saved())['editor.formatOnSave'] === true
    );
    const row = page.locator('[data-setting-id="editor.fontSize"]');
    const size = page.getByRole('spinbutton', {
      name: 'Editor: Font Size',
      exact: true,
    });
    await size.fill('20');
    await size.press('Tab');
    await page.waitForFunction(
      () => JSON.parse(fixture.saved())['editor.fontSize'] === 20
    );
    assert.equal(
      await row.evaluate((e) => e.classList.contains('modified')),
      true
    );
    await row.hover();
    const more = page.getByRole('button', {
      name: 'More Actions for Editor: Font Size',
      exact: true,
    });
    await more.click();
    await page
      .getByRole('menuitem', {name: 'Copy Setting ID', exact: true})
      .click();
    assert.equal(
      await page.evaluate(() => fixture.copied.at(-1)),
      'editor.fontSize'
    );
    await more.click();
    await page
      .getByRole('menuitem', {name: 'Copy Setting as JSON', exact: true})
      .click();
    assert.deepEqual(
      JSON.parse(await page.evaluate(() => fixture.copied.at(-1))),
      {'editor.fontSize': 20}
    );
    await more.click();
    await page
      .getByRole('menuitem', {name: 'Copy Setting as URL', exact: true})
      .click();
    assert.match(
      await page.evaluate(() => fixture.copied.at(-1)),
      /#frame-setting=editor.fontSize$/
    );
    await more.click();
    await page
      .getByRole('menuitem', {name: 'Reset Setting', exact: true})
      .click();
    await page.waitForFunction(
      () => !('editor.fontSize' in JSON.parse(fixture.saved()))
    );
    assert.equal(
      await row.evaluate((e) => e.classList.contains('modified')),
      false
    );
    await more.focus();
    assert.equal(
      await row.evaluate((e) => {
        const s = getComputedStyle(e);
        return (
          s.borderLeftColor === s.borderTopColor &&
          s.borderLeftColor === s.borderRightColor &&
          s.borderLeftColor === s.borderBottomColor
        );
      }),
      true
    );
    await page.evaluate(() =>
      fixture.frame.workspace.setPaneMode(
        fixture.frame.workspace.initialPaneId,
        'tabs'
      )
    );
    await modal
      .getByRole('button', {name: 'Open Settings in Editor Tab', exact: true})
      .click();
    await modal.waitFor({state: 'hidden'});
    assert.equal(
      await page.evaluate(
        () =>
          fixture.frame.workspace.tabs.value.filter(
            (t) => t.id === 'frame.settings'
          ).length
      ),
      1
    );
    await page.evaluate(() => fixture.frame.openSettingsInTab());
    assert.equal(
      await page.evaluate(
        () =>
          fixture.frame.workspace.tabs.value.filter(
            (t) => t.id === 'frame.settings'
          ).length
      ),
      1
    );
    await page.evaluate(() => fixture.installEditor());
    await page
      .getByRole('button', {name: 'Open Settings (JSON)', exact: true})
      .click();
    const editor = page.locator('.monaco-editor');
    await editor.waitFor();
    await page.waitForFunction(
      () =>
        !document
          .querySelector('.frame-code-editor')
          ?.getAttribute('aria-busy') ||
        document
          .querySelector('.frame-code-editor')
          ?.getAttribute('aria-busy') === 'false'
    );
    await editor.locator('[role="textbox"]').focus();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('{"editor.fontSize":24}', {delay: 20});
    await page.getByRole('button', {name: 'Save', exact: true}).click();
    await page
      .waitForFunction(
        () => fixture.frame.settings.read('editor.fontSize') === 24
      )
      .catch(async (error) => {
        console.error(await page.locator('.frame-settings-json').innerText());
        throw error;
      });
    await page.evaluate(() =>
      fixture.frame.features.setAvailable('settings', false)
    );
    assert.equal(
      await page.evaluate(
        () =>
          fixture.frame.workspace.tabs.value.filter((t) =>
            t.id.startsWith('frame.settings')
          ).length
      ),
      0
    );
    await page.evaluate(() =>
      fixture.frame.features.setAvailable('settings', true)
    );
    await page
      .getByRole('main')
      .first()
      .click()
      .catch(() => {});
    await page.keyboard.press('Control+Shift+,');
    await page
      .getByRole('dialog', {name: 'Keyboard Shortcuts', exact: true})
      .waitFor();
    assert.deepEqual(errors, []);
    console.log(
      'Settings browser checks passed: modified rows, clipboard actions, reset, tab gating, single tab, optional JSON editor/save, availability, and Ctrl+Shift+comma.'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
