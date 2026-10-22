"""Check documentation grouping and responsive property editors."""
import os
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    page.goto(os.environ.get("FRAME_DOCS_URL", "http://localhost:1448"))
    page.locator('.component-catalog').get_by_role('button', name='Autocomplete', exact=True).click()
    feature = page.locator('.documentation-feature').first
    description = feature.locator(':scope > p')
    example = feature.locator('.documentation-example')
    assert example.bounding_box()['y'] - (description.bounding_box()['y'] + description.bounding_box()['height']) >= 20
    assert example.evaluate("e => getComputedStyle(e).borderTopWidth") == '0px'
    assert example.locator('.showcase-preview').evaluate("e => getComputedStyle(e).borderTopWidth") == '1px'
    page.get_by_role('tab', name='Interactive demo', exact=True).click()
    form = page.locator('.documentation-demo-inputs')
    preview = page.locator('.documentation-demo-result')
    # Size the docs content itself so sidebar widths cannot mask component breakpoints.
    for width, columns in [(1000, 3), (700, 2), (320, 1)]:
        page.locator('.documentation-demo').evaluate('(e,w) => {e.style.width=w+"px";e.style.maxWidth="none"}', width)
        actual = form.evaluate("e => getComputedStyle(e).gridTemplateColumns.split(' ').length")
        assert actual == columns, (width, actual)
        assert preview.bounding_box()['y'] >= form.bounding_box()['y'] + form.bounding_box()['height']
        assert form.evaluate('e => e.scrollWidth <= e.clientWidth'), width
    page.locator('.documentation-demo').evaluate('e => e.style.removeProperty("width")')
    switch = form.get_by_role('switch', name='Set placeholder', exact=True)
    switch.check()
    form.get_by_role('textbox', name='placeholder', exact=True).fill('Find a language')
    expect(preview.get_by_role('combobox')).to_have_attribute('placeholder', 'Find a language')
    switch.uncheck()
    expect(form.get_by_role('textbox', name='placeholder', exact=True)).to_be_disabled()
    switch.check()
    page.get_by_role('button', name='Reset demo', exact=True).click()
    expect(switch).not_to_be_checked()
    expect(page.get_by_role('button', name='Reset demo', exact=True).locator('svg')).to_be_visible()
    page.mouse.move(0,0)
    assert page.get_by_role('button', name='Reset demo', exact=True).evaluate("e => getComputedStyle(e).backgroundColor") == 'rgba(0, 0, 0, 0)'
    page.locator('.documentation-page').evaluate('e => e.dir="rtl"')
    assert page.locator('.documentation-demo textarea').first.evaluate("e => getComputedStyle(e).direction") == 'ltr'
    assert page.locator('.documentation-demo .frame-code-block').evaluate("e => getComputedStyle(e).direction") == 'ltr'
    page.get_by_role('tab', name='Features', exact=True).click()
    page.get_by_role('tab', name='Features', exact=True).focus()
    page.keyboard.press('ArrowLeft')
    expect(page.get_by_role('tab', name='API', exact=True)).to_be_focused()
    page.locator('.documentation-page').evaluate('e => e.removeAttribute("dir")')
    page.get_by_role('tab', name='Interactive demo', exact=True).click()
    page.screenshot(path='.tmp/docs-demo-layout.png')
    browser.close()
print('Docs layout: separate example boxes, description spacing, 3/2/1 columns, preview order, inline overrides and icon reset passed.')
