"""View actions keep execution, disabled state and keyboard access when space runs out."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 fixture=(Path(__file__).parent/'fixtures/panel-action-overflow/index.html').resolve().as_posix()
 page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448')+'/@fs/'+fixture)
 header=page.locator('#explicit');expect(header.get_by_role('button',name='Save',exact=True)).to_be_visible()
 expect(header.get_by_role('button',name='More View Actions',exact=True)).to_have_count(0)
 expect(page.locator('#automatic').get_by_role('button',name='More View Actions',exact=True)).to_be_visible()
 def budget(value):page.locator('#budget').fill(str(value))
 budget(64)
 expect(header.get_by_role('button',name='Save',exact=True)).to_be_visible()
 more=header.get_by_role('button',name='More View Actions',exact=True);more.click()
 menu=page.get_by_role('menu',name='View actions',exact=True)
 expect(menu.get_by_role('menuitem',name='Unavailable',exact=True)).to_be_disabled()
 menu.get_by_role('menuitem',name='Preview project',exact=True).click()
 expect(page.locator('#runs')).to_have_text('10');expect(more).to_be_focused()
 more.click();page.keyboard.press('Escape');expect(more).to_be_focused()
 # Resizing hides the focused action and returns focus to its replacement trigger.
 header.get_by_role('button',name='Save',exact=True).focus()
 page.locator('#budget').evaluate('(e)=>{e.value="26";e.dispatchEvent(new Event("input",{bubbles:true}))}')
 expect(header.get_by_role('button',name='Save',exact=True)).to_have_count(0)
 expect(more).to_be_focused();page.keyboard.press('Enter')
 expect(menu.get_by_role('menuitem',name='Save',exact=True)).to_be_focused()
 page.keyboard.press('Enter');expect(page.locator('#runs')).to_have_text('11')
 expect(page.locator('#unavailable')).to_have_text('0')
 more.click();expect(menu).to_be_visible()
 budget(360);expect(more).to_have_count(0)
 expect(header.get_by_role('button',name='Preview project',exact=True)).to_be_visible()
 assert not errors,errors;b.close()
print('Panel actions: measured overflow, automatic budget, disabled entries, commands, resize focus and keyboard passed.')
