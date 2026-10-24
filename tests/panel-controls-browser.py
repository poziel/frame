"""Panel context settings, customization, and retained state across docking."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1450,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 fixture=(Path(__file__).parent/'fixtures/panel-controls/index.html').resolve().as_posix()
 page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448')+'/@fs/'+fixture)
 panel=page.locator('.bottom-region')
 def api(expr):return page.evaluate('window.panelFixture.'+expr)
 def context():
  panel.get_by_role('tab',name='Terminal',exact=True).click(button='right')
  popup=page.get_by_role('menu',name='Panel View Bar',exact=True);expect(popup).to_be_visible();return popup
 draft=panel.get_by_role('textbox',name='Panel draft',exact=True);draft.fill('Retained through docking')
 popup=context();expect(popup.get_by_role('menuitem',name='Configure Keybinding',exact=True)).to_be_disabled()
 popup.get_by_role('menuitem',name='Hide Badge',exact=True).click();expect(panel.locator('.view-bar-badge').filter(visible=True)).to_have_count(0)
 context().get_by_role('menuitem',name='Show Badge',exact=True).click();expect(panel.locator('.view-bar-badge').filter(visible=True)).to_have_text('3')
 context().get_by_role('menuitem',name="Hide 'Terminal'",exact=True).click();expect(panel.get_by_role('tab',name='Terminal',exact=True)).to_have_count(0)
 api("openBottomPanel('terminal')");expect(panel.get_by_role('textbox',name='Panel draft',exact=True)).to_have_value('Retained through docking')
 context().get_by_role('menuitem',name='Align Panel',exact=True).hover();page.get_by_role('menuitemcheckbox',name='Justify',exact=True).click()
 for position in ['right','left','top','bottom']:
  context().get_by_role('menuitem',name='Panel Position',exact=True).hover()
  page.get_by_role('menuitemcheckbox',name=position.title(),exact=True).click()
  assert api('layout.panelPosition')==position
  popup=context()
  if position in ['right','left']:
   expect(popup.get_by_role('menuitem',name='Align Panel',exact=True)).to_be_disabled()
   assert api("panel.setAlignment('center')")==False
  else:expect(popup.get_by_role('menuitem',name='Align Panel',exact=True)).to_be_enabled()
  page.keyboard.press('Escape')
  assert api('layout.panelAlignment')=='justify'
  expect(panel.get_by_role('textbox',name='Panel draft',exact=True)).to_have_value('Retained through docking')
 for display,label in [('icons','Icons Only'),('text','Text Only'),('both','Icons and Text')]:
  context().get_by_role('menuitem',name='Show Labels',exact=True).hover()
  page.get_by_role('menuitemcheckbox',name=label,exact=True).click();assert api('layout.panelViewBarDisplay')==display
 # Customize Layout uses the same state and disables side-dock alignment.
 page.get_by_role('button',name='Customize layout',exact=True).click()
 options=page.get_by_role('menu',name='Layout options',exact=True)
 expect(options.locator('[data-option="panel-position-bottom"]')).to_have_attribute('aria-checked','true')
 options.locator('[data-option="panel-position-left"]').click()
 for name in ['left','right','center','justify']:expect(options.locator('[data-option="panel-'+name+'"]').first).to_be_disabled()
 options.locator('[data-option="panel-position-top"]').click()
 expect(options.locator('[data-option="panel-justify"]')).to_be_enabled()
 page.keyboard.press('Escape')
 # Moving a tab uses the registration movement contract, rather than moving the entire panel.
 context().get_by_role('menuitem',name='Move To',exact=True).hover()
 page.get_by_role('menuitem',name='Secondary Sidebar',exact=True).click()
 assert api("viewRegion('terminal')")=='secondary'
 api("moveView('terminal','bottom')");api("openBottomPanel('terminal')")
 expect(panel.get_by_role('textbox',name='Panel draft',exact=True)).to_have_value('Retained through docking')
 context().get_by_role('menuitem',name='Hide Panel',exact=False).click();expect(panel).to_be_hidden()
 api("openBottomPanel('terminal')");expect(panel).to_be_visible()
 assert not errors,errors;b.close()
print('Panel context/customization: positions, alignment guards, labels, badges, visibility, moving views, hiding and retained state passed.')

