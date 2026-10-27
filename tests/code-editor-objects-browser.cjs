// Start the Docs Vite server before running the real Monaco regression checks.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
  });
  try {
    const page = await browser.newPage({viewport: {width: 1180, height: 900}});
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const source = (file) =>
      '/@fs/' + path.resolve(__dirname, '..', file).replaceAll('\\', '/');
    await page.goto(
      (process.env.FRAME_TEST_URL || 'http://127.0.0.1:1450') +
        source('tests/fixtures/code-editor/index.html')
    );
    await page.waitForFunction(
      () => window.fixture?.editor.instance.value !== undefined,
      {timeout: 60000}
    );
    assert.equal(await page.locator('#editor [role="alert"]').count(), 0);
    const runtime = await page.evaluate(async (runtimeURL) => {
      const {CodeEditorRuntime, prepareCodeEditor} = await import(runtimeURL);
      const owner = new CodeEditorRuntime();
      const {load, prepare} = owner;
      const first = load(),
        second = load();
      const monaco = await first;
      const model = window.fixture.editor.instance.value.getModel();
      const worker = await monaco.typescript.getTypeScriptWorker();
      const client = await worker(model.uri);
      const diagnostics = await client.getSyntacticDiagnostics(
        model.uri.toString()
      );
      const before = monaco.editor.getModels().length;
      const selected = document.querySelector(
        '#editor .monaco-editor'
      ).className;
      await prepare('typescript', 'light-plus');
      const prepared = await prepareCodeEditor('ts', 'light-plus');
      return {
        sharedPromise: first === second,
        language: prepared.language,
        noModelsCreated: before === monaco.editor.getModels().length,
        notActivated:
          selected ===
          document.querySelector('#editor .monaco-editor').className,
        worker: Array.isArray(diagnostics),
        currentLanguage: model.getLanguageId(),
      };
    }, source('packages/core/src/modules/editor/services/monaco/codeEditorRuntime.ts'));
    assert.deepEqual(runtime, {
      sharedPromise: true,
      language: 'typescript',
      noModelsCreated: true,
      notActivated: true,
      worker: true,
      currentLanguage: 'typescript',
    });
    const expected = await page.evaluate(async () => {
      const {highlighter} = await window.fixture.loadCodeHighlight(
        'typescript',
        'dark-plus'
      );
      return highlighter.codeToTokens('const greeting = "Hello";', {
        lang: 'typescript',
        theme: 'dark-plus',
      }).tokens[0][0].color;
    });
    const rgb =
      'rgb(' +
      [1, 3, 5]
        .map((index) => parseInt(expected.slice(index, index + 2), 16))
        .join(', ') +
      ')';
    assert.equal(
      await page
        .locator('#editor .view-line')
        .first()
        .locator('[class*="mtk"]')
        .first()
        .evaluate((element) => getComputedStyle(element).color),
      rgb
    );
    await page.evaluate(() => window.fixture.editor.focus());
    await page.keyboard.press('Control+Home');
    await page.keyboard.type('edited');
    await page.waitForFunction(() =>
      window.fixture.code.value.includes('edited')
    );
    await page.evaluate(() => window.fixture.editor.undo());
    await page.waitForFunction(
      () => !window.fixture.code.value.includes('edited')
    );
    await page.evaluate(() => window.fixture.editor.redo());
    await page.waitForFunction(() =>
      window.fixture.code.value.includes('edited')
    );
    await page.evaluate(() => {
      window.fixture.readOnly.value = undefined;
    });
    await page.waitForFunction(
      () =>
        window.fixture.editor.instance.value.getRawOptions().readOnly === true
    );
    const before = await page.locator('#value').innerText();
    await page.keyboard.insertText('blocked');
    assert.equal(await page.locator('#value').innerText(), before);
    await page.evaluate(() => {
      window.fixture.code.value = 'const external = 42;';
    });
    await page.waitForFunction(
      () =>
        window.fixture.editor.instance.value.getValue() ===
        'const external = 42;'
    );
    await page.evaluate(() => {
      window.fixture.theme.value = 'light-plus';
    });
    await page.waitForFunction(
      () => document.querySelector('#editor .monaco-editor.vs') !== null
    );
    await page.evaluate(() => {
      window.fixture.language.value = 'not-a-language';
    });
    await page.waitForFunction(
      () =>
        window.fixture.editor.instance.value.getModel().getLanguageId() ===
        'plaintext'
    );
    await page.evaluate(() => {
      window.fixture.language.value = 'rust';
      window.fixture.theme.value = 'nord';
      queueMicrotask(() => {
        window.fixture.language.value = 'typescript';
        window.fixture.theme.value = 'github-dark';
      });
    });
    await page.waitForFunction(
      () =>
        window.fixture.editor.instance.value.getModel().getLanguageId() ===
          'typescript' &&
        document.querySelector('#editor').getAttribute('aria-busy') === 'false'
    );
    await page.evaluate(() => {
      window.fixture.width.value = 440;
    });
    await page.waitForFunction(
      () => window.fixture.editor.instance.value.getLayoutInfo().width === 440
    );
    await page.evaluate(() => window.fixture.editor.find());
    await page.locator('#editor .find-widget').waitFor({state: 'visible'});
    await page.keyboard.press('Escape');
    const uri = await page.evaluate(() =>
      window.fixture.editor.instance.value.getModel().uri.toString()
    );
    await page.evaluate(() => {
      window.fixture.shown.value = false;
    });
    await page.waitForFunction(
      () => window.fixture.editor.instance.value === undefined
    );
    const models = await page.evaluate(async () =>
      (await window.fixture.loadMonaco()).editor
        .getModels()
        .map((model) => model.uri.toString())
    );
    assert.equal(models.includes(uri), false);
    await page.evaluate(() => {
      window.fixture.shown.value = true;
    });
    await page.waitForFunction(
      () => window.fixture.editor.instance.value !== undefined
    );
    assert.equal(
      await page.evaluate(() =>
        window.fixture.editor.instance.value.getValue()
      ),
      'const external = 42;'
    );
    assert.deepEqual(errors, []);
    console.log(
      'Verified cached loading, preparation without activation, aliases, TypeScript worker, Shiki color, edits, undo/redo, read-only updates, themes, stale requests, resize, find, cleanup, and remount.'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
