// Start the Docs Vite server before running this retained-surface regression check.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
  });
  try {
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const source = (file) =>
      '/@fs/' + path.resolve(__dirname, '..', file).replaceAll('\\', '/');
    await page.goto(
      (process.env.FRAME_TEST_URL || 'http://127.0.0.1:1449') +
        source('tests/fixtures/terminal/index.html')
    );
    const view = page.locator('#fixture-terminal');
    await view.locator('.xterm-rows').waitFor();
    await page.waitForFunction(() =>
      document
        .querySelector('#fixture-terminal .xterm-rows')
        ?.textContent.includes('Frame terminal 1')
    );
    await page.waitForFunction(() => window.terminalFixture.sizes.length > 0);
    await view
      .getByRole('button', {name: 'Split terminal side by side', exact: true})
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll('#fixture-terminal .xterm').length === 2
    );
    await view.locator('textarea').last().focus();
    await page.keyboard.type('echo class-test');
    await page.waitForFunction(() =>
      window.terminalFixture.inputs.join('').includes('echo class-test')
    );
    await page.evaluate(() =>
      navigator.clipboard.writeText('pasted class input')
    );
    await page.keyboard.press('Control+Shift+v');
    await page.waitForFunction(() =>
      window.terminalFixture.inputs.join('').includes('pasted class input')
    );
    await page.keyboard.press('Control+f');
    const search = view.getByRole('searchbox', {name: 'Find in terminal'});
    await search.waitFor();
    await search.fill('Ready for commands');
    assert.equal(await view.getByText('No match', {exact: true}).count(), 0);
    await search.fill('missing-class-test-text');
    await view.getByText('No match', {exact: true}).waitFor();
    await search.press('Escape');
    await page
      .getByRole('button', {name: 'Toggle terminal', exact: true})
      .click();
    await view.waitFor({state: 'detached'});
    assert.deepEqual(
      await page.evaluate(() => window.terminalFixture.closed),
      []
    );
    await page.evaluate(() =>
      window.terminalFixture.output('2', '\r\nRetained class output\r\nPS> ')
    );
    await page
      .getByRole('button', {name: 'Toggle terminal', exact: true})
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll('#fixture-terminal .xterm').length === 2
    );
    await page.waitForFunction(() =>
      [...document.querySelectorAll('#fixture-terminal .xterm-rows')].some(
        (element) => element.textContent.includes('Retained class output')
      )
    );
    await page.evaluate(async () => {
      const terminal = window.terminalFixture.terminal;
      for (const session of [...terminal.sessions.value])
        await terminal.close(session.id);
    });
    await page.waitForFunction(
      () => document.querySelectorAll('#fixture-terminal .xterm').length === 0
    );
    assert.equal(
      (await page.evaluate(() => window.terminalFixture.closed)).length,
      2
    );
    const isolated = await page.evaluate(
      async ({controllerURL, surfaceURL}) => {
        const {createTerminal} = await import(controllerURL);
        const {terminalSurface, TerminalSurface} = await import(surfaceURL);
        const backend = {
          async profiles() {
            return [{id: 'shell', name: 'Shell', path: 'shell', default: true}];
          },
          async spawn(_options, receive) {
            receive({type: 'data', data: [65]});
            return 'shared-id';
          },
          async write() {},
          async resize() {},
          async close() {},
        };
        const first = createTerminal({backend}),
          second = createTerminal({backend});
        await first.create();
        await second.create();
        const one = terminalSurface(first, 'shared-id'),
          two = terminalSurface(second, 'shared-id');
        const stale = document.createElement('div'),
          host = document.createElement('div'),
          otherHost = document.createElement('div');
        document.body.append(host, otherHost);
        const results = [
          one instanceof TerminalSurface,
          one === terminalSurface(first, 'shared-id'),
          one !== two,
        ];
        const {attach, detach} = one;
        attach(host);
        detach(stale);
        results.push(host.querySelector('.xterm') !== null);
        two.attach(otherHost);
        await first.close('shared-id');
        results.push(
          host.querySelector('.xterm') === null,
          otherHost.querySelector('.xterm') !== null
        );
        await Promise.all([first.dispose(), second.dispose()]);
        host.remove();
        otherHost.remove();
        return results;
      },
      {
        controllerURL: source(
          'packages/core/src/modules/terminal/controllers/terminal.ts'
        ),
        surfaceURL: source(
          'packages/core/src/modules/terminal/services/xterm/terminalSurface.ts'
        ),
      }
    );
    assert.deepEqual(isolated, [true, true, true, true, true, true]);
    assert.deepEqual(errors, []);
    console.log(
      'Verified fitting, split renderers, input/paste, search, hidden output, close cleanup, surface identity, stale detach, and controller isolation.'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
