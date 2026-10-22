"""Run against docs on FRAME_DOCS_URL (default localhost:1448)."""
import os
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('FRAME_DOCS_URL', 'http://localhost:1448')
PAGES = ['Autocomplete', 'Field', 'Form', 'Rating', 'Tag Group', 'Label', 'Checkbox Group', 'Combobox', 'Editable', 'Listbox', 'Number Field', 'PIN input', 'Radio Group', 'Switch', 'Tags Input', 'Toggle', 'Toggle Group', 'Calendar', 'Range Calendar', 'Date Field', 'Date Picker', 'Date Range Field', 'Date Range Picker', 'Time Field', 'Time Range Field', 'Month Picker', 'Month Range Picker', 'Year Picker', 'Year Range Picker', 'Color Area', 'Color Field', 'Color Slider', 'Color Swatch', 'Color Swatch Picker']
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    for title in PAGES:
        # Catalog titles follow PascalCase word splitting, including Pin Input.
        title = 'Pin Input' if title == 'PIN input' else title
        page.locator('.component-catalog').get_by_role('button', name=title, exact=True).click()
        preview = page.locator('[data-form-example]')
        expect(preview).to_be_visible()
        expect(page.get_by_role('heading', name=title, exact=True)).to_be_visible()
    page.locator('.component-catalog').get_by_role('button', name='Switch', exact=True).click()
    switch = page.locator('[data-form-example="switch"]').get_by_role('switch')
    switch.click()
    expect(switch).to_have_attribute('aria-checked', 'true')
    page.get_by_text('Disable example', exact=True).click()
    expect(switch).to_be_disabled()
    page.locator('.component-catalog').get_by_role('button', name='Date Picker', exact=True).click()
    page.locator('[data-form-example="date-picker"]').get_by_role('button').last.click()
    expect(page.get_by_role('gridcell').last).to_be_visible()
    page.locator('.frame-date-popover [data-reka-calendar-cell-trigger]:not([data-disabled]):not([data-outside-view])').nth(12).click()
    page.keyboard.press('Escape')
    page.locator('.component-catalog').get_by_role('button', name='Text inputs', exact=True).click()
    page.get_by_role('textbox', name='Workspace name', exact=True).fill('Reviewed workspace')
    expect(page.get_by_role('textbox', name='Workspace name', exact=True)).to_have_value('Reviewed workspace')
    page.locator('.component-catalog').get_by_role('button', name='Text areas', exact=True).click()
    page.get_by_role('textbox', name='Notes', exact=True).fill('Native multiline notes')
    expect(page.get_by_role('textbox', name='Notes', exact=True)).to_have_value('Native multiline notes')
    assert not errors, errors
    browser.close()
print('All form catalog pages mounted; switch and picker interactions passed.')
