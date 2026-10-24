"""Validate shared sidebar selection, visibility, overflow, swaps and retained state."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get('FRAME_TEST_URL','http://localhost:1448').rstrip('/')
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1320,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 fixture=(Path(__file__).parent/'fixtures/sidebar-parity/index.html').resolve().as_posix();page.goto(BASE+'/@fs/'+fixture)
 root=page.locator('#sidebar-instance-0');other=page.locator('#sidebar-instance-1')
 def api(script):page.evaluate('(script)=>{const frame=window.sidebarFrames[0];eval(script)}',script)
 def rail(region):return root.get_by_role('navigation',name=region.title()+' view bar',exact=True)
 def content(region):return root.locator('#side-panel' if region=='primary' else '#secondary-panel')
 def open_both():api("frame.openSidePanel('p1');frame.openSecondaryPanel('s1')")
 # Vertical selection and explicit hiding retain outside selectors; independent instance unaffected.
 api("frame.primaryViewBar.setPosition('default');frame.secondaryViewBar.setPosition('default')")
 for region,label in [('primary','Primary view 1'),('secondary','Secondary view 1')]:
  rail(region).get_by_role('button',name=label,exact=True).click();expect(content(region)).not_to_be_visible();expect(rail(region)).to_be_visible()
  rail(region).get_by_role('button',name=label,exact=True).click();expect(content(region)).to_be_visible()
  content(region).get_by_role('button',name='Hide '+region+' sidebar',exact=True).click();expect(rail(region)).to_be_visible();expect(content(region)).not_to_be_visible();open_both()
 expect(other.locator('#side-panel')).to_be_visible();expect(other.locator('#secondary-panel')).to_be_visible()
 # Horizontal active item cannot close its content; explicit close hides strip too.
 for position in ['top','bottom']:
  api(f"frame.primaryViewBar.setPosition('{position}');frame.secondaryViewBar.setPosition('{position}')");open_both()
  for region,label in [('primary','Primary view 1'),('secondary','Secondary view 1')]:
   rail(region).get_by_role('button',name=label,exact=True).click();expect(content(region)).to_be_visible()
   content(region).get_by_role('button',name='Hide '+region+' sidebar',exact=True).click();expect(content(region)).not_to_be_visible();expect(rail(region)).not_to_be_visible();open_both()
 # Bar preference is independent of content and persists through close/reopen.
 for position in ['default','top']:
  api(f"frame.primaryViewBar.setPosition('{position}');frame.secondaryViewBar.setPosition('{position}')");open_both()
  api("frame.primaryViewBar.setPosition('hidden');frame.secondaryViewBar.setPosition('hidden')")
  for region in ['primary','secondary']:expect(rail(region)).not_to_be_visible();expect(content(region)).to_be_visible()
  api("frame.closeSidePanel();frame.closeSecondaryPanel()");open_both()
  for region in ['primary','secondary']:expect(rail(region)).not_to_be_visible();expect(content(region)).to_be_visible()
 # State survives both user and API hide/show.
 api("frame.primaryViewBar.setPosition('default');frame.secondaryViewBar.setPosition('default')");open_both()
 content('primary').get_by_role('textbox',name='Primary 1 draft',exact=True).fill('Retained primary')
 content('secondary').get_by_role('textbox',name='Secondary 1 draft',exact=True).fill('Retained secondary')
 api("frame.closeSidePanel();frame.closeSecondaryPanel()");open_both()
 expect(content('primary').get_by_role('textbox',name='Primary 1 draft',exact=True)).to_have_value('Retained primary')
 expect(content('secondary').get_by_role('textbox',name='Secondary 1 draft',exact=True)).to_have_value('Retained secondary')
 # Default stays on each container's outside edge after swapping.
 for side in ['left','right']:
  api(f"frame.layout.primarySide='{side}'")
  primary=rail('primary').bounding_box();secondary=rail('secondary').bounding_box()
  pc=content('primary').bounding_box();sc=content('secondary').bounding_box()
  assert (primary['x']<pc['x']) if side=='left' else (primary['x']>pc['x'])
  assert (secondary['x']>sc['x']) if side=='left' else (secondary['x']<sc['x'])
 # Horizontal text selectors overflow in both bars without a scrollbar.
 api("frame.layout.primarySide='left';frame.layout.primaryWidth=180;frame.layout.secondaryWidth=180;frame.primaryViewBar.setPosition('top');frame.secondaryViewBar.setPosition('top');frame.primaryViewBar.setDisplay('both');frame.secondaryViewBar.setDisplay('both')")
 for region,target in [('primary','Primary view 10'),('secondary','Secondary view 10')]:
  bar=rail(region);more=bar.get_by_role('button',name='More Views',exact=True);expect(more).to_be_visible()
  assert bar.evaluate('e=>e.scrollWidth===e.clientWidth')
  items=bar.locator('.view-bar-items');bounds=items.bounding_box();box=more.bounding_box()
  assert abs(bounds['x']+bounds['width']-box['x']-box['width'])<=1,(region,bounds,box)
  row=items.locator('.rail-button').all()
  if row:
   last=row[-1].bounding_box();assert box['x']-last['x']-last['width']>=8,(region,last,box)
  if len(row)>1:
   left=row[0].bounding_box();right=row[1].bounding_box();assert right['x']-left['x']-left['width']>=4,(region,left,right)
  more.focus();page.keyboard.press('Enter')
  menu=page.get_by_role('menu',name='More Views',exact=True);menu.get_by_role('menuitemcheckbox',name=target,exact=True).click()
  expect(content(region)).to_have_attribute('aria-label',target)
  if not bar.get_by_role('button',name=target,exact=True).count():
   more.click();expect(page.get_by_role('menu',name='More Views',exact=True).get_by_role('menuitemcheckbox',name=target,exact=True)).to_be_checked();page.keyboard.press('Escape')
 # Title actions occupy their own row and collapse independently of selectors.
 open_both()
 for region in ['primary','secondary']:
  more=content(region).get_by_role('button',name='More View Actions',exact=True);expect(more).to_be_visible()
  assert more.locator('xpath=ancestor::header').get_by_role('heading',level=2).count()==1
 # Keyboard shortcuts follow the same orientation-dependent visibility rules.
 for position in ['default','top']:
  api(f"frame.primaryViewBar.setPosition('{position}');frame.secondaryViewBar.setPosition('{position}')");open_both()
  content('primary').get_by_role('textbox',name='Primary 1 draft',exact=True).focus();page.keyboard.press('Control+b')
  expect(content('primary')).not_to_be_visible()
  (expect(rail('primary')).to_be_visible() if position=='default' else expect(rail('primary')).not_to_be_visible())
  open_both();content('secondary').get_by_role('textbox',name='Secondary 1 draft',exact=True).focus();page.keyboard.press('Control+Alt+b')
  expect(content('secondary')).not_to_be_visible()
  (expect(rail('secondary')).to_be_visible() if position=='default' else expect(rail('secondary')).not_to_be_visible())
 open_both();api("frame.executeCommand('frame.layout.customize')")
 settings=page.get_by_role('menu',name='Layout options',exact=True)
 expect(settings.get_by_role('menuitemcheckbox',name='Primary View Bar',exact=True)).to_be_visible()
 expect(settings.get_by_role('menuitemcheckbox',name='Secondary View Bar',exact=True)).to_be_visible()
 page.keyboard.press('Escape')
 # Narrow overlays keep both bars inside the owning frame after a side swap.
 root.evaluate("e=>e.style.width='420px'")
 for side in ['left','right']:
  for position in ['default','top','bottom']:
   api(f"frame.layout.primarySide='{side}';frame.primaryViewBar.setPosition('{position}');frame.secondaryViewBar.setPosition('{position}')");open_both()
   bounds=root.locator('.workbench-body').bounding_box()
   for region in ['primary','secondary']:
    box=rail(region).bounding_box();assert box and bounds
    assert box['x']>=bounds['x']-1 and box['x']+box['width']<=bounds['x']+bounds['width']+1,(side,position,region,box,bounds)
 root.evaluate("e=>e.style.width='1240px'")
 api("frame.layout.primarySide='left';frame.primaryViewBar.setPosition('top');frame.secondaryViewBar.setPosition('top')");open_both()
 assert not errors,errors
 page.screenshot(path='.tmp/sidebar-parity.png');browser.close()
print('Sidebar parity: input modes, independent visibility, state retention, swaps, both overflow menus and title actions passed.')
