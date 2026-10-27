// Start Docs Vite before running the notification history presentation checks.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
  });
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const base = process.env.FRAME_TEST_URL || 'http://127.0.0.1:1451';
    const fixture = (name) =>
      base +
      '/@fs/' +
      path
        .resolve(__dirname, 'fixtures', name, 'index.html')
        .replaceAll('\\', '/');
    await page.goto(fixture('status-bar'));
    const item = page.locator('[data-status-id="notification-history"]');
    await item.waitFor();
    await page.getByRole('button', {name: 'Notify', exact: true}).click();
    await item.locator('.status-item-badge').waitFor();
    assert.equal(await item.locator('.status-item-badge').textContent(), '1');
    await item
      .getByRole('button', {name: 'Notification history', exact: true})
      .click();
    const panel = page.getByRole('region', {
      name: 'Notifications',
      exact: true,
    });
    await panel.waitFor();
    assert.equal(await panel.locator('.notification-item').count(), 1);
    await panel
      .getByRole('button', {name: 'Hide notifications', exact: true})
      .click();
    await page.getByRole('button', {name: 'Toggle shell', exact: true}).click();
    await item.waitFor({state: 'detached'});
    await page.getByRole('button', {name: 'Notify', exact: true}).click();
    await page.getByRole('button', {name: 'Toggle shell', exact: true}).click();
    await item.waitFor();
    assert.equal(await item.locator('.status-item-badge').textContent(), '2');
    assert.equal(
      await page
        .locator('#other-shell [data-status-id="notification-history"]')
        .count(),
      0
    );
    await item.click({button: 'right'});
    await page
      .getByRole('menu', {name: 'Status bar actions', exact: true})
      .getByRole('menuitem', {name: 'Move to Left', exact: true})
      .click();
    assert.equal(
      await page
        .locator('.status-left [data-status-id="notification-history"]')
        .count(),
      1
    );
    await item
      .getByRole('button', {name: 'Notification history', exact: true})
      .click();
    await panel
      .getByRole('button', {name: 'Clear all notifications', exact: true})
      .click();
    await panel
      .getByRole('heading', {name: 'No new notification.', exact: true})
      .waitFor();
    assert.equal(await item.locator('.status-item-badge').count(), 0);

    await page.goto(fixture('notification-panel'));
    await page
      .getByRole('button', {name: 'Notification history (0)', exact: true})
      .click();
    const standalone = page.locator('.notification-center');
    await standalone
      .getByRole('heading', {name: 'No new notification.', exact: true})
      .waitFor();
    for (const name of ['Bottom Left', 'Top Right', 'Bottom Right']) {
      await standalone
        .getByRole('button', {
          name: 'Change notification position',
          exact: true,
        })
        .click();
      await page
        .getByRole('menu', {name: 'Notification position', exact: true})
        .getByRole('menuitemcheckbox', {name, exact: true})
        .click();
      if (name === 'Top Right') {
        await page
          .locator('.titlebar-layout')
          .getByRole('button', {name: 'Notifications', exact: true})
          .waitFor();
        assert.equal(
          await page.locator('.status-bar .notification-toggle').count(),
          0
        );
      } else {
        await page.locator('.status-bar .notification-toggle').waitFor();
      }
    }
    await page.locator('#notify').click();
    await standalone.locator('.notification-item').hover();
    await standalone
      .getByRole('button', {
        name: 'Expand notification: Build complete',
        exact: true,
      })
      .click();
    await standalone
      .getByText('Your project is ready.', {exact: true})
      .waitFor();
    await standalone
      .getByRole('button', {
        name: 'Clear notification: Build complete',
        exact: true,
      })
      .click();
    await standalone
      .getByRole('heading', {name: 'No new notification.', exact: true})
      .waitFor();
    assert.deepEqual(errors, []);
    console.log(
      'Verified badges, mutable expansion, shell remount retention, placement, instance isolation, clearing, standalone indicators, and titlebar transitions.'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
