"""Capabilities and browser files through the public host contract."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    fixture = (Path(__file__).parent / 'fixtures/host/index.html').resolve().as_posix()
    page.goto(f'http://localhost:1420/@fs/{fixture}')
    page.wait_for_load_state('networkidle')
    expect(page.get_by_role('button', name='Minimize window', exact=True)).to_be_disabled()
    expect(page.get_by_role('button', name='Close window', exact=True)).to_be_disabled()
    page.get_by_role('button', name='Maximize window', exact=True).click()
    expect(page.get_by_role('button', name='Restore window', exact=True)).to_be_enabled()
    page.evaluate("window.hostFixture.frame.host.window.execute('maximize')")
    expect(page.get_by_role('button', name='Maximize window', exact=True)).to_be_enabled()
    with page.expect_file_chooser() as chooser:
        page.get_by_role('button', name='Pick files', exact=True).click()
    chooser.value.set_files([{'name': 'example.txt', 'mimeType': 'text/plain', 'buffer': b'Frame host files'}])
    page.wait_for_function('window.hostFixture.files()?.length === 1')
    assert page.evaluate("window.hostFixture.files()[0].name") == 'example.txt'
    assert page.evaluate("window.hostFixture.files()[0].path === undefined")
    assert page.evaluate("window.hostFixture.files()[0].file.text()") == 'Frame host files'
    assert page.locator('input[type=file]').count() == 0
    with page.expect_file_chooser() as chooser:
        page.get_by_role('button', name='Pick files', exact=True).click()
    chooser.value.element.dispatch_event('cancel')
    page.wait_for_function('window.hostFixture.files()?.length === 0')
    assert page.locator('input[type=file]').count() == 0
    page.evaluate('window.hostFixture.frame.dispose()')
    assert page.evaluate('window.hostFixture.stopped()') == 1
    assert not errors, errors
    browser.close()
print('PASS: partial window capabilities, UI/API parity, browser file selection/cancellation, cleanup; no browser errors')
