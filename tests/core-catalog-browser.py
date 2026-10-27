"""Legacy Core discovery, four-tab coverage, and native interaction smoke checks."""
import os
from playwright.sync_api import sync_playwright,expect
PAGES=['Buttons','Icon buttons','Text inputs','Checkboxes','Selects','Sliders','Text areas','Color pickers','Settings controls','Icons','Code block','Loader','Loading region','Back and forward','Modals','Settings','Notifications','Quick pick','Tooltips','Dropdown menus','Context menus','Resizable panes','Resize handles','Banner','Workspace panes','Views and sections','Activity actions']
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':1000});errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)));page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448'))
 expect(page.locator('.component-catalog section').first.get_by_role('heading')).to_have_text('Actions')
 page.get_by_role('searchbox',name='Filter components').fill('FrameTextArea')
 expect(page.locator('.component-catalog').get_by_role('button',name='Text areas',exact=True)).to_be_visible()
 page.get_by_role('searchbox',name='Filter components').fill('')
 for title in PAGES:
  page.locator('.component-catalog').get_by_role('button',name=title,exact=True).click()
  expect(page.locator('.documentation-page h1')).to_have_text(title)
  for tab in ['Features','API','Theming','Interactive demo']:
   page.get_by_role('tab',name=tab,exact=True).click();expect(page.get_by_role('tabpanel')).to_be_visible()
 page.locator('.component-catalog').get_by_role('button',name='Text inputs',exact=True).click()
 field=page.locator('.documentation-feature').first.locator('input').first;field.fill('Restored workspace');expect(field).to_have_value('Restored workspace')
 page.locator('.component-catalog').get_by_role('button',name='Checkboxes',exact=True).click()
 checkbox=page.locator('.documentation-feature').first.get_by_role('checkbox').first;checkbox.click();expect(checkbox).to_be_checked()
 page.locator('.component-catalog').get_by_role('button',name='Text areas',exact=True).click()
 notes=page.locator('.documentation-feature').first.locator('textarea');notes.fill('Restored\nmultiline notes');expect(notes).to_have_value('Restored\nmultiline notes')
 assert not errors,errors;b.close()
print('All27 legacy Core pages remain discoverable, open four tabs, and native fields interact correctly.')
