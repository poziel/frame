async (page) => {
  const check = (value, message) => {
    if (!value) throw new Error(message);
  };
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(
    `http://localhost:1420/@fs/${process.cwd().replaceAll('\\', '/')}/tests/fixtures/editor-objects/index.html`
  );
  await page.waitForFunction(
    () =>
      window.editorFixture?.ready.length === 1 &&
      editorFixture.occupied.instance.value
  );
  const initial = await page.evaluate(() => {
    const f = editorFixture;
    window.initialEditor = f.surface.value.controller.instance.value;
    window.initialModel = initialEditor.getModel();
    window.initialFallback = f.surface.value.controller;
    return initialModel.uri.toString();
  });
  await page.evaluate(() => {
    editorFixture.selected.value = editorFixture.first;
  });
  await page.waitForFunction(
    () =>
      editorFixture.first.instance.value === initialEditor &&
      initialFallback.instance.value === undefined
  );
  await page.evaluate(() => {
    editorFixture.selected.value = editorFixture.replacement;
  });
  await page.waitForFunction(
    () =>
      editorFixture.replacement.instance.value === initialEditor &&
      editorFixture.first.instance.value === undefined
  );
  check(
    await page.evaluate(
      () =>
        editorFixture.ready.length === 1 &&
        initialEditor.getModel() === initialModel
    ),
    'Handoff recreated the model or emitted ready again'
  );
  await page.evaluate(() => {
    editorFixture.selected.value = editorFixture.occupied;
  });
  await page.waitForFunction(() => editorFixture.errors.length === 1);
  check(
    await page.evaluate(
      () =>
        editorFixture.surface.value.controller === editorFixture.replacement &&
        editorFixture.replacement.instance.value === initialEditor &&
        editorFixture.occupied.instance.value !== initialEditor
    ),
    'Failed handoff changed the active controller'
  );
  await page.evaluate(() => {
    editorFixture.selected.value = undefined;
  });
  await page.waitForFunction(
    () =>
      initialFallback.instance.value === initialEditor &&
      editorFixture.replacement.instance.value === undefined
  );
  await page.evaluate(() => {
    initialFallback.replaceCode('const changed = 3;');
  });
  await page.waitForFunction(() => editorFixture.changes.length === 1);
  await page.evaluate(() => {
    editorFixture.language.value = 'ocaml';
    queueMicrotask(() => {
      editorFixture.shown.value = false;
    });
  });
  await page.waitForFunction(
    () => initialFallback.instance.value === undefined
  );
  check(
    await page.evaluate(
      async (uri) =>
        !(await editorFixture.loadMonaco()).editor
          .getModels()
          .some((model) => model.uri.toString() === uri),
      initial
    ),
    'Unmount retained the old model'
  );
  await page.evaluate(() => {
    editorFixture.language.value = 'typescript';
    editorFixture.shown.value = true;
  });
  await page.waitForFunction(
    () =>
      editorFixture.ready.length === 2 &&
      editorFixture.surface.value.controller.instance.value
  );
  check(
    await page.evaluate(
      () =>
        editorFixture.surface.value.controller.instance.value.getValue() ===
          'const primary = 1;' &&
        editorFixture.occupied.instance.value.getValue() ===
          'const secondary = 2;'
    ),
    'Remount or handoff changed the independent editor'
  );
  check(errors.length === 0, errors.join('\n'));
  console.log(
    'Editor lifecycle browser checks passed: fallback/explicit handoff, conflicting attachment, event count, independent surfaces, pending syntax disposal, and remount.'
  );
};
