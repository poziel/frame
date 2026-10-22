"""Activity layout, public APIs, context moves and retained view state; docs Vite server required."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRAME_TEST_URL','http://localhost:1448').rstrip('/')
fixture=(Path(__file__).parent/'fixtures/activity-layout/index.html').resolve().as_posix()
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1180,'height':800});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base+'/@fs/'+fixture)
 def api(expression):return page.evaluate('window.__activityTest.frame.'+expression)
 def rail():return page.get_by_role('navigation',name='Primary activity bar',exact=True)
 def button(name):return rail().get_by_role('button',name=name,exact=True)
 def menu(name,child):
  page.get_by_role('menuitem',name=name,exact=True).hover()
  page.get_by_role('menuitemcheckbox',name=child,exact=True).click()
 def contained():
  bounds=page.locator('.workbench-body').bounding_box();box=rail().bounding_box()
  assert box and bounds
  assert box['x']>=bounds['x']-1 and box['y']>=bounds['y']-1,(box,bounds)
  assert box['x']+box['width']<=bounds['x']+bounds['width']+1,(box,bounds)
  assert box['y']+box['height']<=bounds['y']+bounds['height']+1,(box,bounds)
 expect(button('Notes')).to_be_visible();page.get_by_role('textbox',name='Notes entry').fill('Retained while moving')
 assert page.locator('#notes-mount').inner_text()=='1'
 # A disabled move is visible but cannot mutate the registered view.
 button('Locked').click(button='right');page.get_by_role('menuitem',name='Move To',exact=True).hover()
 expect(page.get_by_role('menuitem',name='Panel',exact=True)).to_be_disabled();expect(page.get_by_role('menuitem',name='Secondary Sidebar',exact=True)).to_be_disabled();page.keyboard.press('Escape')
 # Actions do not offer view moves.
 button('Run fixture action').click(button='right');expect(page.get_by_role('menuitem',name='Move To',exact=True)).to_have_count(0);page.keyboard.press('Escape')
 for label,region in [('Panel','bottom'),('Secondary Sidebar','secondary')]:
  button('Notes').click(button='right');page.get_by_role('menuitem',name='Move To',exact=True).hover();page.get_by_role('menuitem',name=label,exact=True).click();api("openView('notes')")
  expect(page.get_by_role('textbox',name='Notes entry')).to_be_visible();expect(page.get_by_role('textbox',name='Notes entry')).to_have_value('Retained while moving')
  assert page.locator('#notes-mount').inner_text()=='1';assert page.evaluate('window.__activityTest.notesMounts')==1
  collection='bottomTabs' if region=='bottom' else 'secondaryTabs'
  assert api(collection+".value.some(view=>view.id==='notes')")
  api("moveView('notes','primary')");api("openView('notes')")
 api('layout.secondarySidebarVisible=false');api('layout.panelVisible=false')
 # Position and independent icon sizing are usable through both menu and API.
 button('Notes').click(button='right');menu('Activity Bar Position','Top');assert api('layout.activityBarPosition')=='top'
 button('Notes').click(button='right');menu('Activity Bar Size','Compact');assert api('layout.activityBarSize')=='compact'
 small=button('Notes').bounding_box();api("activity.setSize('default')");normal=button('Notes').bounding_box();assert normal['height']>small['height'] or normal['width']>small['width']
 for position in ['top','bottom']:
  for side in ['left','right']:
   api("activity.setPosition('"+position+"')");api("layout.primarySide='"+side+"'");api("layout.density='compact'");api("activity.setSize('default')")
   assert api('layout.activityBarSize')=='default';expect(rail()).to_be_visible();contained()
   a=button('Notes').bounding_box();b=button('Locked').bounding_box();assert a['width']==normal['width'] and a['height']==normal['height'],('density changed activity size',normal,a);assert abs(a['y']-b['y'])<2,(position,side,a,b);assert abs(a['x']-b['x'])>5
   button('Notes').click();expect(rail()).to_be_visible();assert api('layout.primarySidebarVisible')
   api('closeSidePanel()');expect(rail()).to_be_hidden()
   workspace=page.locator('.workspace-panes').bounding_box();body=page.locator('.workbench-body').bounding_box();assert abs(workspace['width']-body['width'])<=2,('collapsed horizontal rail reserves workspace width',workspace,body)
   api("openView('notes')")
 # The primary-side context command toggles its target side.
 api("layout.primarySide='left'");button('Notes').click(button='right');page.get_by_role('menuitem',name='Move Primary Side Bar Right',exact=True).click();assert api('layout.primarySide')=='right'
 api("activity.setPosition('hidden')");expect(rail()).to_be_hidden()
 page.get_by_role('button',name='Customize layout',exact=True).click();page.get_by_role('menuitemcheckbox',name='Primary Activity Bar',exact=True).click();page.keyboard.press('Escape');expect(rail()).to_be_visible();assert api('layout.activityBarPosition')=='bottom'
 for width in [700,420]:
  page.set_viewport_size({'width':width,'height':600})
  for position in ['default','top','bottom']:
   for side in ['left','right']:
    api("activity.setPosition('"+position+"')");api("layout.primarySide='"+side+"'");api("openView('notes')");expect(rail()).to_be_visible();contained()
 expect(page.get_by_role('textbox',name='Notes entry')).to_have_value('Retained while moving');assert page.evaluate('window.__activityTest.notesMounts')==1
 # Customize Layout exposes the same choices immediately above primary-sidebar position.
 page.set_viewport_size({'width':1180,'height':800})
 page.get_by_role('button',name='Customize layout',exact=True).click()
 options=page.locator('.layout-options')
 ids=options.locator('button').evaluate_all('els=>els.map(e=>e.dataset.option)')
 assert ids.index('primary-activity-position-default')<ids.index('primary-activity-size-default')<ids.index('side-left'),ids
 for value in ['top','bottom','default']:
  options.locator('[data-option="primary-activity-position-'+value+'"]').click()
  assert api('layout.activityBarPosition')==value
  expect(options.locator('[data-option="primary-activity-position-'+value+'"]')).to_have_attribute('aria-checked','true')
 options.locator('[data-option="primary-activity-size-compact"]').click();assert api('layout.activityBarSize')=='compact'
 options.locator('[data-option="primary-activity-position-top"]').click();assert api('layout.activityBarSize')=='compact'
 options.locator('[data-option="primary-activity-position-hidden"]').click();expect(rail()).to_be_hidden()
 expect(options.locator('[data-option="activity"]')).to_have_attribute('aria-checked','false')
 options.locator('[data-option="activity"]').click();expect(rail()).to_be_visible()
 expect(options.locator('[data-option="primary-activity-position-top"]')).to_have_attribute('aria-checked','true')
 options.locator('[data-option="primary-activity-size-default"]').click();assert api('layout.activityBarSize')=='default'
 page.keyboard.press('Escape')
 assert not errors,errors
 browser.close();print('Activity layout: positions, independent sizes/density, context moves/guards, retained content, hide/show, side toggles and narrow geometry passed.')
