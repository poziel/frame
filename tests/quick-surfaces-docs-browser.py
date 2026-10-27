"""Verify distinct quick-surface docs and real launch/accept/close/slot interactions."""
import os
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1280,'height':900});errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)));page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448'))
 def open_page(title):
  page.locator('.component-catalog:visible').get_by_role('button',name=title,exact=True).click()
  expect(page.locator('.documentation-page h1')).to_have_text(title)
 def launch(index,name):
  page.locator('.documentation-feature').nth(index).get_by_role('button',name=name,exact=True).click()
  expect(page.locator('.palette')).to_be_visible()
 open_page('Quick pick');launch(0,'Open FrameQuickPick')
 search=page.get_by_role('combobox',name='Choose a command',exact=True);search.fill('save')
 page.get_by_role('option',name='Save all files Ctrl+Shift+S',exact=False).click()
 expect(page.locator('.palette')).to_have_count(0)
 launch(1,'Open FrameQuickPick');expect(page.locator('.palette-backdrop.position-center')).to_be_visible();page.keyboard.press('Escape')
 launch(2,'Open FrameQuickPick');expect(page.locator('.command-result strong').first).to_have_text('Design system');page.keyboard.press('Escape')
 for tab in ['API','Theming','Interactive demo']:
  page.get_by_role('tab',name=tab,exact=True).click();expect(page.get_by_role('tabpanel')).to_be_visible()
 page.locator('.documentation-demo').get_by_role('button',name='Open FrameQuickPick',exact=True).click()
 page.get_by_role('combobox').fill('first');page.get_by_role('option',name='First choice',exact=True).click()
 expect(page.locator('.documentation-event-log')).to_contain_text('accept')
 open_page('Quick panel');launch(0,'Open FrameQuickPanel');expect(page.locator('.palette')).to_contain_text('Design system workspace')
 expect(page.locator('.palette').get_by_role('combobox')).to_have_count(0);page.get_by_role('button',name='Close panel',exact=True).click();expect(page.locator('.palette')).to_have_count(0)
 launch(1,'Open FrameQuickPanel');page.locator('.palette').get_by_role('button',name='Done',exact=True).click();expect(page.locator('.palette')).to_have_count(0)
 launch(2,'Open FrameQuickPanel');expect(page.locator('.palette-backdrop.position-center')).to_be_visible();page.keyboard.press('Escape')
 for tab in ['API','Theming','Interactive demo']:
  page.get_by_role('tab',name=tab,exact=True).click();expect(page.get_by_role('tabpanel')).to_be_visible()
 assert not errors,errors;b.close()
print('Quick pick/panel docs: independent contracts, searched acceptance, custom item/header slots, close paths and four tabs passed.')
