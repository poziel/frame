"""Unpinned toolbar commands remain usable without changing their pin state."""
import os,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1280,'height':760});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 fixture=(Path(__file__).parent/'fixtures/shell-toolbar/index.html').resolve().as_posix()
 page.goto(os.environ.get('FRAME_TEST_URL','http://localhost:1448').rstrip('/')+'/@fs/'+fixture)
 more=page.get_by_role('button',name='More Actions…',exact=True)
 def overflow():
  more.click();popup=page.get_by_role('menu',name='More Actions',exact=True);expect(popup).to_be_visible();return popup
 def context():
  page.get_by_role('button',name='Customize layout',exact=True).click(button='right')
  return page.get_by_role('menu',name='Title bar actions',exact=True)
 popup=overflow()
 expect(popup.get_by_role('menuitem',name='Customize Layout…',exact=True)).to_have_count(0)
 toggle=popup.get_by_role('menuitemcheckbox',name=re.compile('^Toggle Primary Sidebar'))
 old=toggle.get_attribute('aria-checked');toggle.click()
 popup=overflow();expect(popup.get_by_role('menuitemcheckbox',name=re.compile('^Toggle Primary Sidebar'))).to_have_attribute('aria-checked','false' if old=='true' else 'true')
 expect(page.get_by_role('button',name='Toggle primary sidebar',exact=True)).to_have_count(0)
 popup.get_by_role('menuitem',name='Custom action',exact=True).click();expect(page.locator('#runs')).to_have_text('1')
 expect(page.get_by_role('button',name='Custom action',exact=True)).to_have_count(0)
 context().get_by_role('menuitemcheckbox',name=re.compile('^Toggle Primary Sidebar')).click()
 expect(page.get_by_role('button',name='Toggle primary sidebar',exact=True)).to_be_visible()
 popup=overflow();expect(popup.get_by_role('menuitemcheckbox',name=re.compile('^Toggle Primary Sidebar'))).to_have_count(0)
 page.keyboard.press('Escape');expect(more).to_be_focused()
 context().get_by_role('menuitemcheckbox',name=re.compile('^Toggle Primary Sidebar')).click()
 popup=overflow();expect(popup.get_by_role('menuitemcheckbox',name=re.compile('^Toggle Primary Sidebar'))).to_be_visible()
 page.keyboard.press('Escape')
 # Move all remaining actions onto the bar: no empty overflow trigger should remain.
 for label in ['Toggle Primary Sidebar','Toggle Panel','Toggle Secondary Sidebar','Custom action']:
  context().get_by_role('menuitemcheckbox',name=label,exact=True).click()
 expect(more).to_have_count(0)
 context().get_by_role('menuitemcheckbox',name=re.compile('^Toggle Panel')).click();expect(more).to_be_visible()
 # Keyboard opening and action execution use the same command path.
 more.focus();page.keyboard.press('Enter')
 popup=page.get_by_role('menu',name='More Actions',exact=True)
 expect(popup.get_by_role('menuitemcheckbox',name=re.compile('^Toggle Panel'))).to_be_focused()
 page.keyboard.press('Enter');expect(popup).to_have_count(0);expect(more).to_be_focused()
 assert not errors,errors;b.close()
print('Toolbar overflow: unpinned commands/actions execute, layout checkmarks update, pin/unpin moves items, empty menu disappears, keyboard focus returns.')
