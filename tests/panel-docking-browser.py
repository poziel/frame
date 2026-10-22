"""Panel dock geometry and content identity across all positions, alignments and sidebar sides."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright,expect
fixture=(Path(__file__).parent/'fixtures/panel-controls/index.html').resolve().as_posix()
def near(a,b):assert abs(a-b)<2,(a,b)
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1500,'height':850});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448')+'/@fs/'+fixture)
 panel=page.locator('.bottom-region');workspace=page.locator('.workspace-region')
 panel.get_by_role('textbox',name='Panel draft',exact=True).fill('Retained through docking')
 for side in ['left','right']:
  for position in ['top','bottom','left','right']:
   for alignment in ['center','left','right','justify']:
    page.evaluate('([side,position,alignment])=>Object.assign(window.panelFixture.layout,{primarySide:side,panelPosition:position,panelAlignment:alignment,panelVisible:false,maximizedRegion:null})',[side,position,alignment]);page.wait_for_timeout(25)
    full=workspace.bounding_box();primary=page.locator('.primary-region>.side-panel').bounding_box();secondary=page.locator('.secondary-region>.side-panel').bounding_box()
    page.evaluate('window.panelFixture.layout.panelVisible=true');page.wait_for_timeout(25)
    box=panel.bounding_box();work=workspace.bounding_box()
    assert min(box['width'],box['height'],work['width'],work['height'])>0,(side,position,alignment,box,work)
    if position in ['left','right']:
     near(box['y'],work['y']);near(box['height'],work['height'])
     if position=='left':near(box['x'],full['x']);near(box['x']+box['width']+6,work['x'])
     else:near(box['x']+box['width'],full['x']+full['width']);near(work['x']+work['width']+6,box['x'])
     for selector,original in [('.primary-region>.side-panel',primary),('.secondary-region>.side-panel',secondary)]:
      actual=page.locator(selector).bounding_box()
      for key in ['x','y','width','height']:near(actual[key],original[key])
    elif position=='top':near(box['y']+box['height']+6,work['y'])
    else:near(work['y']+work['height']+6,box['y'])
    if position in ['top','bottom'] and alignment=='center':near(box['x'],work['x']);near(box['width'],work['width'])
    expect(panel.get_by_role('textbox',name='Panel draft',exact=True)).to_have_value('Retained through docking')
    panel.get_by_role('button',name='Maximize bottom panel',exact=True).click()
    expect(panel.get_by_role('button',name='Restore bottom panel',exact=True)).to_be_visible()
    expect(panel.get_by_role('textbox',name='Panel draft',exact=True)).to_have_value('Retained through docking')
    panel.get_by_role('button',name='Restore bottom panel',exact=True).click()
    page.wait_for_timeout(20)
    restored=panel.bounding_box()
    for key in ['x','y','width','height']:near(restored[key],box[key])
 # Top coverage moves only the corresponding sidebar content below the panel.
 for viewport in [1500,650]:
  page.set_viewport_size({'width':viewport,'height':850})
  for rail in ['default','top','hidden']:
   for alignment in ['center','left','right','justify']:
    page.evaluate('([rail,alignment])=>Object.assign(window.panelFixture.layout,{primarySide:"left",panelPosition:"top",panelAlignment:alignment,activityBarVisible:rail!=="hidden",activityBarPosition:rail==="top"?"top":"default",secondaryActivityBarVisible:rail!=="hidden",secondaryActivityBarPosition:rail==="top"?"top":"default"})',[rail,alignment]);page.wait_for_timeout(30)
    box=panel.bounding_box()
    for selector,covered in [('.primary-region>.side-panel',alignment in ['left','justify']),('.secondary-region>.side-panel',alignment in ['right','justify'])]:
     actual=page.locator(selector).bounding_box()
     if covered:assert actual['y']>=box['y']+box['height'],(viewport,rail,alignment,selector,box,actual)
 page.set_viewport_size({'width':1500,'height':850})
 page.evaluate("Object.assign(window.panelFixture.layout,{activityBarVisible:true,activityBarPosition:'default',secondaryActivityBarVisible:true,secondaryActivityBarPosition:'default'})")
 # Vertical resize uses width while top resize uses height.
 page.evaluate("Object.assign(window.panelFixture.layout,{panelPosition:'right',panelWidth:320})");page.wait_for_timeout(25)
 handle=panel.get_by_role('separator',name='Resize bottom panel',exact=True);handle.focus();before=panel.bounding_box()['width'];page.keyboard.press('ArrowLeft');page.wait_for_timeout(25);assert panel.bounding_box()['width']>before
 page.evaluate("window.panelFixture.layout.panelPosition='top'");page.wait_for_timeout(25)
 handle.focus();before=panel.bounding_box()['height'];page.keyboard.press('ArrowDown');page.wait_for_timeout(25);assert panel.bounding_box()['height']>before
 # Hidden sidebar states must not change vertical docking's workspace boundary.
 for primary in [False,True]:
  for secondary in [False,True]:
   for position in ['left','right']:
    page.evaluate('([primary,secondary,position])=>Object.assign(window.panelFixture.layout,{primarySidebarVisible:primary,secondarySidebarVisible:secondary,panelPosition:position,panelVisible:false})',[primary,secondary,position]);page.wait_for_timeout(25)
    full=workspace.bounding_box()
    page.evaluate('window.panelFixture.layout.panelVisible=true');page.wait_for_timeout(25)
    box=panel.bounding_box();work=workspace.bounding_box()
    near(min(box['x'],work['x']),full['x']);near(max(box['x']+box['width'],work['x']+work['width']),full['x']+full['width'])
 # Commands use the same guard as the public API when a panel is side docked.
 page.evaluate("Object.assign(window.panelFixture.layout,{panelPosition:'left',panelAlignment:'center'})")
 assert page.evaluate("window.panelFixture.commands.value.find(c=>c.id==='frame.layout.panel.justify').enabled()") is False
 page.evaluate("window.panelFixture.commands.value.find(c=>c.id==='frame.layout.panel.justify').run()")
 assert page.evaluate("window.panelFixture.layout.panelAlignment")=='center'
 assert not errors,errors
 page.screenshot(path='.tmp/panel-docking-top.png');browser.close()
print('Panel docking geometry passed:4positions,4alignments,2sidebar sides, independent sidebars, retained content, maximize/restore and keyboard resize.')
