"""Verify the four-tab form catalog against docs on FRAME_DOCS_URL."""
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
    def open_page(title):
        page.locator('.component-catalog').get_by_role('button', name=title, exact=True).click()
        expect(page.locator('.documentation-page h1')).to_have_text(title)
    def tab(name):
        control=page.get_by_role('tab',name=name,exact=True)
        control.click()
        expect(control).to_have_attribute('aria-selected','true')
        return page.get_by_role('tabpanel')
    for title in PAGES:
        title = 'Pin Input' if title == 'PIN input' else title
        open_page(title)
        expect(page.get_by_role('tab',name='Features',exact=True)).to_have_attribute('aria-selected','true')
        assert page.locator('.documentation-feature').count()>=1,title
        expect(tab('API').locator('.documentation-api')).to_be_visible()
        expect(tab('Theming').get_by_role('heading',name='Design tokens',exact=True)).to_be_visible()
        expect(tab('Interactive demo').locator('.documentation-demo')).to_be_visible()
        expect(page.locator('.documentation-demo .showcase-preview')).to_be_visible()
        assert not page.locator('.documentation-demo [role=alert]').count(),title
    # Automatic activation and roving tabindex follow the standalone four-tab page.
    open_page('Date Field')
    first=page.get_by_role('tab',name='Features',exact=True)
    first.focus();page.keyboard.press('ArrowRight')
    expect(page.get_by_role('tab',name='API',exact=True)).to_be_focused()
    expect(page.get_by_role('tab',name='API',exact=True)).to_have_attribute('aria-selected','true')
    page.keyboard.press('End')
    expect(page.get_by_role('tab',name='Interactive demo',exact=True)).to_be_focused()
    page.keyboard.press('Home')
    expect(first).to_be_focused()
    # Type navigation returns to the originating component and its selected tab.
    for title,model in [('Date Field','DateValue'),('Date Range Field','DateRange'),('Time Field','TimeValue'),('Time Range Field','TimeRange')]:
        open_page(title);tab('API')
        page.locator('.documentation-api').get_by_role('link',name=model+' reference',exact=True).first.click()
        expect(page.get_by_role('heading',name=model,exact=True)).to_be_visible()
        page.get_by_role('button',name='Back to '+title,exact=True).click()
        expect(page.locator('.documentation-page h1')).to_have_text(title)
        expect(page.get_by_role('tab',name='API',exact=True)).to_have_attribute('aria-selected','true')
    # ISO editor values hydrate into real calendar/time objects, not display strings.
    open_page('Date Field');tab('Interactive demo')
    model=page.locator('.documentation-demo-inputs').get_by_role('textbox',name='modelValue',exact=True)
    model.fill('"2027-02-03"')
    preview=page.locator('.documentation-demo-result .showcase-preview')
    expect(preview.locator('[data-reka-date-field-segment=year]')).to_have_attribute('aria-valuenow','2027')
    expect(preview.locator('[data-reka-date-field-segment=month]')).to_have_attribute('aria-valuenow','2')
    day=preview.locator('[data-reka-date-field-segment=day]')
    day.focus();page.keyboard.press('ArrowUp')
    expect(day).to_have_attribute('aria-valuenow','4')
    expect(model).to_have_value('"2027-02-04"')
    expect(page.locator('.documentation-demo-inputs [role=alert]')).to_have_count(0)
    for name,value in [('minValue','2027-02-01'),('maxValue','2027-02-28')]:
        field=page.locator('.documentation-demo-inputs fieldset').filter(has=page.locator('legend',has_text=name))
        field.get_by_role('switch',name='Set '+name,exact=True).check()
        field.get_by_role('textbox',name=name,exact=True).fill('"'+value+'"')
    expect(page.locator('.documentation-demo-inputs [role=alert]')).to_have_count(0)
    expect(page.locator('.documentation-event-log')).to_contain_text('update:modelValue')
    model.fill('"not-a-date"')
    expect(page.locator('.documentation-demo-inputs [role=alert]')).to_be_visible()
    expect(day).to_have_attribute('aria-valuenow','4')
    open_page('Date Range Field');tab('Interactive demo')
    page.locator('.documentation-demo-inputs').get_by_role('textbox',name='modelValue',exact=True).fill('{"start":"2027-02-03","end":"2027-02-08"}')
    preview=page.locator('.documentation-demo-result .showcase-preview')
    expect(preview.locator('[data-reka-date-field-segment=day]').first).to_have_attribute('aria-valuenow','3')
    expect(preview.locator('[data-reka-date-field-segment=day]').last).to_have_attribute('aria-valuenow','8')
    open_page('Time Field');tab('Interactive demo')
    page.locator('.documentation-demo-inputs').get_by_role('textbox',name='modelValue',exact=True).fill('"11:45:00"')
    preview=page.locator('.documentation-demo-result .showcase-preview')
    expect(preview.get_by_role('spinbutton',name='minute,',exact=False)).to_have_attribute('aria-valuenow','45')
    assert not errors, errors
    browser.close()
print('All 34 form pages: four tabs, API/type round trips, keyboard tab navigation, live demo mounts, and typed date/range/time editors with min/max and validation passed.')
