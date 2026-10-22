"""Run with uv run --with playwright python tests/code-editor-browser.py; docs server on 1420."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1180, "height": 900})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    fixture = (Path(__file__).parent / 'fixtures/code-editor/index.html').resolve().as_posix()
    page.goto(f'http://localhost:1420/@fs/{fixture}')
    page.wait_for_load_state('networkidle')
    expect(page.locator('#editor')).to_have_attribute('aria-busy', 'false', timeout=60000)
    expect(page.locator('#editor [role="alert"]')).to_have_count(0)
    page.wait_for_function('window.fixture.editor.instance.value !== undefined')
    assert page.evaluate('fixture.editor.instance.value.getModel().getLanguageId()') == 'typescript'
    # Require real language workers and Shiki scope names, beyond merely rendering text.
    assert page.evaluate('''async () => {
        const monaco = await fixture.loadMonaco();
        const worker = await monaco.typescript.getTypeScriptWorker();
        const model = fixture.editor.instance.value.getModel();
        const client = await worker(model.uri);
        return Array.isArray(await client.getSyntacticDiagnostics(model.uri.toString()));
    }''')
    expected_color = page.evaluate('''async () => {
        const { highlighter } = await fixture.loadCodeHighlight('typescript', 'dark-plus');
        return highlighter.codeToTokens('const greeting = "Hello";', { lang: 'typescript', theme: 'dark-plus' }).tokens[0][0].color;
    }''')
    expected_rgb = 'rgb(' + ', '.join(str(int(expected_color[i:i+2], 16)) for i in (1, 3, 5)) + ')'
    keyword = page.locator('#editor .view-line').first.locator('[class*="mtk"]').first
    assert keyword.evaluate('el => getComputedStyle(el).color') == expected_rgb
    textbox = page.locator('#editor .view-lines')
    expect(page.get_by_role('textbox', name='Test source')).to_have_count(1)
    textbox.click()
    page.evaluate('fixture.editor.focus()')
    page.keyboard.press('Control+Home')
    page.keyboard.type('edited', delay=30)
    expect(page.locator('#value')).to_contain_text('edited')
    page.evaluate('fixture.editor.undo()')
    expect(page.locator('#value')).not_to_contain_text('edited')
    page.evaluate('fixture.editor.redo()')
    expect(page.locator('#value')).to_contain_text('edited')
    page.evaluate('fixture.readOnly.value = undefined')
    page.wait_for_function('fixture.editor.instance.value.getRawOptions().readOnly === true')
    before = page.locator('#value').inner_text()
    textbox.click()
    page.keyboard.insert_text('blocked')
    assert page.locator('#value').inner_text() == before
    page.evaluate('fixture.code.value = "const external = 42;"')
    page.wait_for_function('fixture.editor.instance.value.getValue() === "const external = 42;"')
    page.evaluate('fixture.theme.value = "light-plus"')
    page.wait_for_function('document.querySelector("#editor .monaco-editor.vs") !== null')
    page.evaluate('fixture.language.value = "ts"')
    expect(page.locator('#editor')).to_have_attribute('aria-busy', 'false')
    page.wait_for_function('fixture.editor.instance.value.getModel().getLanguageId() === "typescript"')
    page.evaluate('fixture.language.value = "not-a-language"')
    page.wait_for_function('fixture.editor.instance.value.getModel().getLanguageId() === "plaintext"')
    page.evaluate('''() => {
        fixture.language.value = 'rust'; fixture.theme.value = 'nord';
        queueMicrotask(() => { fixture.language.value = 'typescript'; fixture.theme.value = 'github-dark'; });
    }''')
    page.wait_for_function('fixture.editor.instance.value.getModel().getLanguageId() === "typescript"')
    expect(page.locator('#editor')).to_have_attribute('aria-busy', 'false')
    page.evaluate('fixture.width.value = 440')
    page.wait_for_function('fixture.editor.instance.value.getLayoutInfo().width === 440')
    page.evaluate('fixture.editor.find()')
    expect(page.locator('#editor .find-widget')).to_be_visible()
    page.keyboard.press('Escape')
    model_uri = page.evaluate('fixture.editor.instance.value.getModel().uri.toString()')
    page.evaluate('fixture.shown.value = false')
    page.wait_for_function('fixture.editor.instance.value === undefined')
    # Monaco's TypeScript service may keep its own library declaration models.
    remaining_models = page.evaluate('async () => (await fixture.loadMonaco()).editor.getModels().map(model => model.uri.toString())')
    assert model_uri not in remaining_models, remaining_models
    page.evaluate('fixture.shown.value = true')
    page.wait_for_function('fixture.editor.instance.value !== undefined')
    assert page.evaluate('fixture.editor.instance.value.getValue()') == 'const external = 42;'
    assert not errors, errors
    page.screenshot(path='.tmp/code-editor-browser.png', full_page=True)
    browser.close()
    print('Editor browser checks passed: Shiki colors, TypeScript worker, edits, v-model, undo/redo, direct/nested readOnly precedence, external updates, themes, aliases, fallback, rapid updates, resize, find, cleanup and remount.')
