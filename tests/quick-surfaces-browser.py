"""Standalone and multi-Frame searched input/custom panel contract. Run against FRAME_DOCS_URL."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright,expect
url=os.environ.get('FRAME_DOCS_URL','http://localhost:1448')
fixture=(Path(__file__).parent/'fixtures/quick-surfaces/index.html').resolve().as_posix()
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1200,'height':850});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url+'/@fs/'+fixture)
 def api(expression):return page.evaluate('window.__quickSplit.'+expression)
 def dialog(title):return page.get_by_role('dialog',name=title,exact=True,include_hidden=True)
 def check_geometry(title,index,position):
  d=dialog(title);expect(d).to_be_visible();box=d.bounding_box();bounds=page.locator('#host-'+str(index)+' .workbench-body').bounding_box()
  assert box['x']>=bounds['x']-1 and box['x']+box['width']<=bounds['x']+bounds['width']+1,(title,box,bounds)
  assert box['y']>=bounds['y']-1 and box['y']+box['height']<=bounds['y']+bounds['height']+1,(title,box,bounds)
  if position=='center':assert abs(box['y']+box['height']/2-bounds['y']-bounds['height']/2)<3,(title,box,bounds)
  else:assert box['y']-bounds['y']<12,(title,box,bounds)
  assert d.evaluate("el=>!!el.closest('.frame-overlay-host')")
 # A standalone searched list uses viewport top and Frame's reusable text control.
 opener=page.get_by_role('button',name='Standalone open picker',exact=True);opener.click();search=page.get_by_role('combobox',name='Standalone picker',exact=True);expect(search).to_be_focused();expect(search).to_have_attribute('placeholder','Type to search…');expect(search).to_have_class(__import__('re').compile('frame-text-input'))
 assert dialog('Standalone picker').bounding_box()['y']<12
 search.press('End');expect(page.get_by_role('option',name='Item 59',exact=True)).to_have_class(__import__('re').compile(r'active'))
 assert dialog('Standalone picker').locator('.palette-results').evaluate('el=>el.scrollHeight>el.clientHeight')
 page.wait_for_function("()=>{const item=[...document.querySelectorAll('[role=option]')].find(el=>el.textContent.trim()==='Item 59');const list=document.querySelector('.palette-results');return item&&list&&item.getBoundingClientRect().bottom<=list.getBoundingClientRect().bottom+1}")
 search.press('Home');expect(page.get_by_role('option',name='Alpha Distinct searchable detail',exact=False)).to_have_class(__import__('re').compile(r'active'))
 search.press('ArrowDown');search.press('Enter');expect(page.locator('#standalone-accepted')).to_have_text('beta');expect(opener).to_be_focused()
 opener.click();search.fill('Distinct searchable');expect(page.get_by_role('option',name='Alpha Distinct searchable detail',exact=False)).to_be_visible();search.press('Enter');expect(page.locator('#standalone-accepted')).to_have_text('alpha')
 opener.click();search.fill('no matches here');expect(dialog('Standalone picker').get_by_role('status')).to_have_text('No matching actions.');search.press('Enter');expect(dialog('Standalone picker')).to_be_visible();search.press('Escape');expect(opener).to_be_focused()
 opener.click();search.dispatch_event('keydown',{'key':'Enter','code':'Enter','isComposing':True,'bubbles':True});expect(dialog('Standalone picker')).to_be_visible();search.dispatch_event('keydown',{'key':'Escape','code':'Escape','isComposing':True,'bubbles':True});expect(dialog('Standalone picker')).to_be_visible();page.get_by_role('option',name='Beta',exact=True).click();expect(page.locator('#standalone-accepted')).to_have_text('beta')
 opener.click();page.mouse.click(1190,840);expect(dialog('Standalone picker')).to_have_count(0);expect(opener).to_be_focused()
 # Inherited positions follow their own Frame; explicit props override that preference.
 for index,letter,position in [(0,'A','center'),(1,'B','top')]:
  page.get_by_role('button',name='Host '+letter+' open picker',exact=True).click();check_geometry('Host '+letter+' picker',index,position);assert api('inputInstances['+str(index)+'].value.element instanceof HTMLInputElement');api('inputInstances['+str(index)+'].value.focus()');expect(page.get_by_role('combobox',name='Host '+letter+' picker',exact=True)).to_be_focused();page.keyboard.press('Escape')
 api("override[0].value='top'");page.get_by_role('button',name='Host A open picker',exact=True).click();check_geometry('Host A picker',0,'top');page.keyboard.press('Escape');api('override[0].value=undefined')
 api("frames[1].layout.quickInputPosition='center'");page.get_by_role('button',name='Host B open panel',exact=True).click();check_geometry('Host B panel',1,'center')
 expect(page.get_by_role('button',name='Host B header action',exact=True)).to_be_visible();expect(page.get_by_role('textbox',name='Host B custom input',exact=True)).to_be_visible()
 close=dialog('Host B panel').get_by_role('button',name='Close panel',exact=True);expect(close).to_have_class(__import__('re').compile('frame-icon-button'))
 page.get_by_role('textbox',name='Host B custom input',exact=True).focus();page.keyboard.press('Escape');expect(dialog('Host B panel')).to_have_count(0);expect(page.get_by_role('button',name='Host B open panel',exact=True)).to_be_focused()
 # Simultaneous independent hosts keep distinct bounded portal owners and models.
 api('picker[0].value=true');api('picker[1].value=true');check_geometry('Host A picker',0,'center');check_geometry('Host B picker',1,'center');page.keyboard.press('Escape');expect(dialog('Host B picker')).to_have_count(0);expect(dialog('Host A picker')).to_be_visible();page.keyboard.press('Escape')
 # Customize Layout is itself the custom panel and follows the same current preference.
 page.locator('#host-0').get_by_role('button',name='Customize layout',exact=True).click();check_geometry('Customize Layout',0,'center');page.keyboard.press('Escape')
 # Short shells keep custom content and searched results in an internally scrollable bounded surface.
 page.locator('#host-0').evaluate("el=>el.style.height='260px'");page.get_by_role('button',name='Host A open panel',exact=True).click();check_geometry('Host A panel',0,'center');assert dialog('Host A panel').evaluate("el=>[el,...el.querySelectorAll('*')].some(node=>node.scrollHeight>node.clientHeight&&['auto','scroll'].includes(getComputedStyle(node).overflowY))");page.keyboard.press('Escape')
 page.get_by_role('button',name='Standalone open panel',exact=True).click();expect(page.get_by_role('textbox',name='Standalone entry',exact=True)).to_be_visible();assert dialog('Standalone panel').bounding_box()['y']<12;page.keyboard.press('Escape');expect(page.get_by_role('button',name='Standalone open panel',exact=True)).to_be_focused()
 assert not errors,errors
 browser.close();print('Quick surfaces: standalone/Frame inheritance, explicit positions, isolated portals, filter/detail/disabled/IME/keyboard/mouse, focus, custom slots, controls and bounded scrolling passed.')
