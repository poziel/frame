"""Leaf views scroll by default; collections keep scrolling inside their children."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    fixture = (Path(__file__).parent / 'fixtures/view-scrolling/index.html').resolve().as_posix()
    base = os.environ.get('FRAME_TEST_URL', 'http://localhost:1420').rstrip('/')
    page.goto(f'{base}/@fs/{fixture}')
    page.wait_for_function('!!window.fixtureFrame')
    for region, selector, opener in [('primary', '.primary-region', 'openSidePanel'), ('secondary', '.secondary-region', 'openSecondaryPanel'), ('bottom', '.bottom-region', 'openBottomPanel')]:
        page.evaluate('([region, opener]) => { fixtureFrame.moveView("leaf", region); fixtureFrame[opener]("leaf"); }', [region, opener])
        leaf = page.locator(f'{selector} .view-content').filter(has=page.get_by_role('textbox', name='Retained draft'))
        expect(leaf).to_be_visible()
        assert leaf.evaluate('el => getComputedStyle(el).overflowY === "auto" && el.scrollHeight > el.clientHeight + 100'), region
        leaf.get_by_role('textbox').fill('kept')
        leaf.hover()
        expect(page.locator('.frame-overlay-scrollbar.y')).to_have_count(1)
        leaf.evaluate('el => el.scrollTop = 200')
        assert leaf.evaluate('el => el.scrollTop') == 200
        page.evaluate('([region, opener]) => { fixtureFrame.moveView("groups", region); fixtureFrame[opener]("groups"); }', [region, opener])
        groups = page.locator(f'{selector} .view-sections')
        expect(groups).to_have_count(2)
        for collection in groups.all():
            assert collection.evaluate('el => getComputedStyle(el).overflowY === "hidden"')
        for child_id in ['one', 'two']:
            child = page.locator(f'#view-section-{child_id} > .view-host > .view-content')
            assert child.evaluate('el => getComputedStyle(el).overflowY === "auto" && el.scrollHeight > el.clientHeight'), child_id
            child.hover()
            expect(page.locator('.frame-overlay-scrollbar.y')).to_have_count(1)
        page.evaluate('opener => fixtureFrame[opener]("leaf")', opener)
        expect(page.locator(f'{selector}').get_by_role('textbox', name='Retained draft')).to_have_value('kept')
    assert not errors, errors
    browser.close()
print('Default leaf scrolling, nested collections, overlay scrollbars, moved views, and retained state passed in all regions.')




