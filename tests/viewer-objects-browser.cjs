async (page) => {
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    const liveUrls = new Set();
    const liveWorkers = new Set();
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      liveUrls.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      liveUrls.delete(url);
      revoke(url);
    };
    const BrowserWorker = window.Worker;
    window.Worker = class extends BrowserWorker {

      constructor(...args) {
        super(...args);
        liveWorkers.add(this);
      }

      terminate() {
        liveWorkers.delete(this);
        super.terminate();
      }
    };
    window.viewerTracking = {liveUrls, liveWorkers};
  });
  await page.goto(
    `http://localhost:1420/@fs/${process.cwd().replaceAll('\\', '/')}/tests/fixtures/viewer-objects/index.html`
  );
  await page.waitForFunction(
    () => document.querySelector('#primary pre')?.textContent === 'Initial text'
  );
  check(
    await page.evaluate(() => viewerTracking.liveWorkers.size === 0),
    'Text viewing started a PDF worker'
  );
  await page.evaluate(() => viewerFixture.select('svg'));
  await page.waitForFunction(
    () => document.querySelector('#primary img')?.naturalWidth === 40
  );
  await page
    .locator('#primary')
    .getByRole('button', {name: 'Text mode', exact: true})
    .click();
  await page.waitForFunction(() =>
    document
      .querySelector('#primary .frame-viewer-code')
      ?.textContent.includes('<svg')
  );
  check(
    await page.evaluate(() => !window.viewerExecuted),
    'SVG source executed'
  );
  await page
    .locator('#primary')
    .getByRole('button', {name: 'Document mode', exact: true})
    .click();
  await page.evaluate(() => viewerFixture.select('html'));
  await page.waitForFunction(() =>
    document
      .querySelector('#primary .frame-viewer-code')
      ?.textContent.includes('<script>')
  );
  check(
    await page.evaluate(() => !window.viewerExecuted),
    'HTML source executed'
  );
  await page.evaluate(() => viewerFixture.select('binary'));
  await page.waitForFunction(() =>
    document
      .querySelector('#primary')
      ?.textContent.includes('Preview is unavailable')
  );
  await page.evaluate(() => viewerFixture.select('pdf'));
  await page.waitForFunction(
    () =>
      document
        .querySelector('#primary .frame-viewer-pdf')
        ?.getAttribute('aria-busy') === 'false' &&
      document.querySelector('#primary canvas')?.width > 0
  );
  check(
    await page.evaluate(() => viewerTracking.liveWorkers.size === 1),
    'PDF did not own a real worker'
  );
  check(
    await page.locator('#primary canvas').evaluate((canvas) => {
      const pixels = canvas
        .getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height).data;
      return pixels.some((value, index) => index % 4 !== 3 && value < 100);
    }),
    'PDF canvas contains no rendered text'
  );
  await page
    .locator('#primary')
    .getByRole('button', {name: 'Next', exact: true})
    .click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('#primary canvas')
        ?.getAttribute('aria-label')
        .startsWith('PDF page 2') &&
      document
        .querySelector('#primary .frame-viewer-pdf')
        ?.getAttribute('aria-busy') === 'false'
  );
  check(
    await page
      .locator('#primary')
      .getByRole('button', {name: 'Next', exact: true})
      .isDisabled(),
    'Last page navigation remained enabled'
  );
  await page
    .locator('#primary')
    .getByRole('button', {name: 'Zoom in', exact: true})
    .click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('#primary .frame-viewer-toolbar')
        ?.textContent.includes('125%') &&
      document
        .querySelector('#primary .frame-viewer-pdf')
        ?.getAttribute('aria-busy') === 'false'
  );
  check(
    await page
      .locator('#primary canvas')
      .evaluate((canvas) => canvas.style.width === '525px'),
    'PDF zoom did not resize the canvas'
  );
  await page.evaluate(() => viewerFixture.select('pdf'));
  await page.waitForFunction(
    () =>
      document
        .querySelector('#primary canvas')
        ?.getAttribute('aria-label')
        .startsWith('PDF page 1') &&
      document
        .querySelector('#primary .frame-viewer-toolbar')
        ?.textContent.includes('100%') &&
      document
        .querySelector('#primary .frame-viewer-pdf')
        ?.getAttribute('aria-busy') === 'false' &&
      viewerTracking.liveWorkers.size === 1
  );
  await page.evaluate(() => {
    viewerFixture.select('pdf');
    queueMicrotask(() => viewerFixture.select('text'));
  });
  await page.waitForFunction(
    () =>
      document.querySelector('#primary pre')?.textContent === 'Updated text' &&
      viewerTracking.liveWorkers.size === 0
  );
  await page.evaluate(() => viewerFixture.select('large'));
  await page.waitForFunction(
    () =>
      document.querySelector('#primary [role="alert"]')?.textContent ===
      'File exceeds the viewer size limit.'
  );
  await page.evaluate(() => {
    viewerFixture.select('text');
    viewerFixture.open.value = true;
  });
  await page.getByRole('dialog').waitFor({state: 'visible'});
  await page.getByRole('button', {name: 'Close document viewer'}).click();
  await page.waitForFunction(() => !viewerFixture.open.value);
  await page.evaluate(() => (viewerFixture.open.value = true));
  await page.getByRole('dialog').waitFor({state: 'visible'});
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !viewerFixture.open.value);
  await page.evaluate(() => (viewerFixture.shown.value = false));
  await page.waitForFunction(() => !document.querySelector('#primary'));
  await page.evaluate(() => (viewerFixture.shown.value = true));
  await page.waitForFunction(
    () => document.querySelector('#primary pre')?.textContent === 'Updated text'
  );
  check(
    (await page.locator('#independent pre').innerText()) ===
      'Independent viewer',
    'Another viewer changed during replacement'
  );
  check(
    await page.evaluate(() => viewerFixture.errors.length === 1),
    'Unexpected viewer errors'
  );
  await page.evaluate(() => viewerFixture.unmount());
  await page.waitForFunction(
    () =>
      viewerTracking.liveWorkers.size === 0 &&
      viewerTracking.liveUrls.size === 0
  );
  check(errors.length === 0, errors.join('\n'));
  console.log(
    'Viewer browser checks passed: text, inert SVG/HTML source, binary fallback, real PDF worker, pages, zoom, replacement, limits, dialog close/Escape, remount, independent instances, and URL/worker cleanup.'
  );
};
