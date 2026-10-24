"""Run against Docs dev host; FRAME_TEST_URL defaults to port 1448."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRAME_TEST_URL','http://localhost:1448').rstrip('/')
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1500,'height':600});errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 fixture=(Path(__file__).parent/'fixtures/view-bar/index.html').resolve().as_posix()
 page.goto(f'{base}/@fs/{fixture}')
 first=page.locator('#frame-0');second=page.locator('#frame-1');rail=first.get_by_role('navigation',name='Primary view bar',exact=True)
 expect(first.get_by_role('button',name='Explorer',exact=True)).to_have_class(__import__('re').compile(r'frame-icon-button'))
 expect(first.get_by_role('button',name='Manage',exact=True)).to_have_class(__import__('re').compile(r'frame-icon-button'))
 menu=lambda:page.get_by_role('menu',name='Primary view bar',exact=True)
 expect(first.get_by_role('button',name='Hidden contribution',exact=True)).to_have_count(0)
 first.get_by_role('button',name='Increment state',exact=True).click()
 expect(first.locator('.counter:visible')).to_have_text('1')
 first.get_by_role('button',name='Explorer',exact=True).click(button='right')
 expect(menu().get_by_role('menuitem',name="Hide 'Explorer'",exact=True)).to_be_visible()
 expect(menu().get_by_role('menuitemcheckbox',name='Explorer',exact=True)).to_be_checked()
 expect(menu().get_by_role('menuitemcheckbox',name='Hidden contribution',exact=True)).not_to_be_checked()
 menu().get_by_role('menuitem',name="Hide 'Explorer'",exact=True).click()
 expect(first.get_by_role('button',name='Explorer',exact=True)).to_have_count(0)
 expect(first.get_by_role('button',name='Search',exact=True)).to_have_attribute('aria-pressed','true')
 expect(second.get_by_role('button',name='Explorer',exact=True)).to_be_visible()
 rail.click(button='right',position={'x':10,'y':200})
 expect(menu().get_by_role('menuitem',name="Hide 'Search'",exact=True)).to_have_count(0)
 expect(menu().get_by_role('menuitemcheckbox',name='Explorer',exact=True)).not_to_be_checked()
 menu().get_by_role('menuitemcheckbox',name='Explorer',exact=True).click()
 first.get_by_role('button',name='Explorer',exact=True).click()
 expect(first.locator('.counter:visible')).to_have_text('1')
 rail.click(button='right',position={'x':10,'y':200})
 menu().get_by_role('menuitemcheckbox',name='Hidden contribution',exact=True).click()
 expect(first.get_by_role('button',name='Hidden contribution',exact=True)).to_be_visible()
 # A host API call uses the same behavior as the menu and leaves the peer instance unchanged.
 page.evaluate("window.viewBarFrames[0].primaryViewBar.setVisible('search',false)")
 expect(first.get_by_role('button',name='Search',exact=True)).to_have_count(0)
 expect(second.get_by_role('button',name='Search',exact=True)).to_be_visible()
 expect(first.get_by_role('button',name='Manage',exact=True)).to_be_visible()
 assert not errors,errors
 print('Activity rail context menu browser checks passed.')
 browser.close()
