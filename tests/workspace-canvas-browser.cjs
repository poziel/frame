// Run build:library first: verify the distributed legacy canvas cascade.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({channel: 'chrome'});
  try {
    const page = await browser.newPage();
    const css = fs.readFileSync(
      path.join(__dirname, '../packages/core/dist/frame.css'),
      'utf8'
    );
    await page.setContent(
      `<style>${css}</style><main class="workspace frame-workspace-surface"><section class="empty-workspace"><div class="canvas-shortcuts"><button><span>Commands</span><span><kbd>Ctrl</kbd></span></button></div></section></main>`
    );
    const values = () =>
      page.locator('.empty-workspace').evaluate((element) => {
        const button = element.querySelector('button');
        const style = getComputedStyle(button);
        return [getComputedStyle(element).padding, style.fontSize, style.gap];
      });
    for (const width of [1280, 700, 540, 520]) {
      await page.setViewportSize({width, height: 800});
      assert.deepEqual(
        await values(),
        width <= 540
          ? ['24px 16px', '10px', '8px']
          : ['35px 24px', '12px', '15px'],
        `canvas layout at ${width}px`
      );
    }
    await page.locator('main').evaluate((element) => {
      element.style.setProperty(
        '--frame-empty-workspace-padding-2',
        '11px 12px'
      );
      element.style.setProperty(
        '--frame-canvas-shortcuts-button-font-size-2',
        '13px'
      );
      element.style.setProperty('--frame-canvas-shortcuts-button-gap-2', '4px');
    });
    assert.deepEqual(await values(), ['11px 12px', '13px', '4px']);
    console.log(
      'Legacy canvas desktop/mobile cascade and runtime tokens passed'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
