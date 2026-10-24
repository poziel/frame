"""Secondary context menus, display preferences, tab/action overflow and retained content."""
import os,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1350,'height':850});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 fixture=(Path(__file__).parent/'fixtures/secondary-view-bar/index.html').resolve().as_posix()
 page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448')+'/@fs/'+fixture)
 secondary=page.locator('.secondary-region');bar=secondary.get_by_role('navigation',name='Secondary view bar',exact=True)
 expect(bar.get_by_role('button',name='Chat',exact=True)).to_be_visible()
 expect(bar.locator('.bar-item-badge').filter(visible=True)).to_have_text('3')
 draft=secondary.get_by_role('textbox',name='Draft message',exact=True);draft.fill('Keep this draft')
 def context():
  bar.get_by_role('button',name='Chat',exact=True).click(button='right')
  popup=page.get_by_role('menu',name='Secondary view bar',exact=True);expect(popup).to_be_visible();return popup
 popup=context();expect(popup.get_by_role('menuitem',name='View Bar Position',exact=True)).to_be_visible()
 popup.get_by_role('menuitem',name='Hide Badge',exact=True).click()
 expect(bar.locator('.bar-item-badge').filter(visible=True)).to_have_count(0)
 context().get_by_role('menuitem',name='Show Badge',exact=True).click()
 for mode,label in [('icons','Icons Only'),('text','Text Only'),('both','Icons and Text')]:
  context().get_by_role('menuitem',name='View Bar Display',exact=True).hover()
  page.get_by_role('menuitemcheckbox',name=label,exact=True).click()
  expect(page.locator('#display-state')).to_have_text(mode)
  expect(bar.get_by_role('button',name='Chat',exact=True)).to_be_visible()
 context().get_by_role('menuitem',name='View Bar Size',exact=True).hover()
 page.get_by_role('menuitemcheckbox',name='Compact',exact=True).click();expect(page.locator('#size-state')).to_have_text('compact')
 context().get_by_role('menuitem',name="Hide 'Chat'",exact=True).click()
 expect(bar.get_by_role('button',name='Chat',exact=True)).to_have_count(0)
 bar.click(button='right');page.get_by_role('menu',name='Secondary view bar',exact=True).get_by_role('menuitemcheckbox',name='Chat',exact=True).click()
 page.locator('#open-chat').click();expect(secondary.get_by_role('textbox',name='Draft message',exact=True)).to_have_value('Keep this draft')
 context().get_by_role('menuitem',name='Move Secondary Sidebar Left',exact=True).click();expect(page.locator('#side-state')).to_have_text('right')
 popup=context();expect(popup.get_by_role('menuitem',name='Move Secondary Sidebar Right',exact=True)).to_be_visible();page.keyboard.press('Escape')
 page.locator('#medium').click()
 expect(bar.get_by_role('button',name='More Views',exact=True)).to_have_count(0)
 bar.get_by_role('button',name='Chat',exact=True).focus()
 page.locator('#narrow').evaluate('e=>e.click()');expect(bar.get_by_role('button',name='More Views',exact=True)).to_be_visible()
 assert bar.evaluate('e=>e.contains(document.activeElement)')
 if bar.locator('.view-bar-items [data-view-id]').count()==0:
  assert bar.bounding_box()['x']+bar.bounding_box()['width']-bar.get_by_role('button',name='More Views',exact=True).bounding_box()['x']-bar.get_by_role('button',name='More Views',exact=True).bounding_box()['width']<=6
 bar.get_by_role('button',name='More Views',exact=True).click()
 popup=page.get_by_role('menu',name='More Views',exact=True)
 expect(popup.get_by_role('menuitemcheckbox',name='Claude Code',exact=True)).to_be_visible()
 popup.get_by_role('menuitemcheckbox',name='Claude Code',exact=True).click()
 page.locator('#open-chat').click()
 expect(secondary.get_by_role('button',name='More View Actions',exact=True)).to_be_visible()
 secondary.get_by_role('button',name='More View Actions',exact=True).click()
 popup=page.get_by_role('menu',name='View actions',exact=True)
 popup.get_by_role('menuitem',name='New Chat',exact=True).click();expect(page.locator('#runs')).to_have_text('1')
 header=secondary.locator('.section-header');assert header.evaluate('e=>e.scrollWidth<=e.clientWidth'),header.evaluate('e=>[e.scrollWidth,e.clientWidth]')
 page.screenshot(path='.tmp/secondary-view-bar-narrow.png')
 page.locator('#wide').click();expect(bar.get_by_role('button',name='Chat',exact=True)).to_be_visible()
 context().get_by_role('menuitem',name='Move To',exact=True).hover()
 page.get_by_role('menuitem',name='Primary Sidebar',exact=True).click();expect(page.locator('#region-state')).to_have_text('primary')
 expect(page.locator('#side-panel').get_by_role('textbox',name='Draft message',exact=True)).to_have_value('Keep this draft')
 page.reload()
 expect(bar.get_by_role('button',name='Chat',exact=True)).to_be_visible()
 context().get_by_role('menuitem',name='Move To',exact=True).hover()
 page.get_by_role('menuitem',name='Panel',exact=True).click();expect(page.locator('#region-state')).to_have_text('bottom')
 expect(page.locator('.bottom-region').get_by_role('textbox',name='Draft message',exact=True)).to_be_visible()
 assert not errors,errors
 page.screenshot(path='.tmp/secondary-view-bar.png');b.close()
print('Secondary view bar: context actions, badges, display/size, mirror layout, retained state, tab/action overflow and movement passed.')


