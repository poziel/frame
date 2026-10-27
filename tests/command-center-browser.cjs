const {chromium} = require('playwright');
const {expect} = require('playwright/test');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    const file = path
      .join(__dirname, 'fixtures/quick-input/index.html')
      .replaceAll('\\', '/');
    await page.goto(
      `${process.env.FRAME_TEST_URL || 'http://127.0.0.1:1437'}/@fs/${file}`
    );
    await page.waitForLoadState('networkidle');
    await page.getByLabel('first content', {exact: true}).waitFor();
    await page.evaluate(() => {
      const frame = fixture.first;
      fixture.permission = frame.permissions.register({
        id: 'fixture.edit',
        allowed: true,
      });
      const black = frame.commands.register({
        id: 'fixture.background.black',
        label: 'Black',
        commandCenter: false,
        requires: ['fixture.edit'],
        run: () => {
          fixture.calls.value = 'black';
        },
      });
      frame.commandCenter.register({
        id: 'fixture.background',
        label: 'Change background',
        searchable: false,
        items: [
          {id: 'heading', type: 'heading', label: 'Backgrounds'},
          black,
          {id: 'separator', type: 'separator', label: 'More options'},
          {
            id: 'custom',
            type: 'submenu',
            label: 'Custom',
            items: [
              {
                id: 'white',
                label: 'White',
                description: 'Solid background',
                sectionLabel: 'colors',
                selected: true,
                actions: [
                  {
                    id: 'configure',
                    label: 'Configure white',
                    run: () => {
                      fixture.calls.value = 'configure';
                    },
                  },
                ],
                run: () => {
                  fixture.calls.value = 'white';
                },
              },
            ],
          },
        ],
      });
      void frame.commandCenter.open('fixture.background');
    });
    await expect(
      page.getByRole('option', {name: 'Black', exact: true})
    ).toBeVisible();
    await expect(page.getByRole('combobox')).toBeHidden();
    await expect(page.getByRole('option')).toHaveCount(2);
    await page.evaluate(() => fixture.permission.disable('AI is editing'));
    await expect(
      page.getByRole('option', {name: 'Black', exact: true})
    ).toHaveAttribute('data-disabled', '');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('option', {name: 'Back', exact: true})
    ).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', {name: 'Configure white', exact: true})
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#calls')).toHaveText('configure');
    await expect(
      page.getByRole('option', {name: 'Back', exact: true})
    ).toBeVisible();
    await page.getByRole('option', {name: 'Back', exact: true}).click();
    await expect(page.getByRole('combobox')).toBeHidden();
    await page.evaluate(() => fixture.permission.enable());
    await page.getByRole('option', {name: 'Black', exact: true}).click();
    await expect(page.locator('#calls')).toHaveText('black');
    await expect(page.locator('.palette')).toHaveCount(0);
    assert.deepEqual(errors, []);
    console.log(
      'Command Center browser checks passed: keyboard, focus, nested Back, mixed rows, actions, live permissions.'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
