from pathlib import Path
from playwright.sync_api import sync_playwright,expect
fixture=(Path(__file__).parent/'fixtures/shell-menu/index.html').resolve().as_posix()
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1100,'height':700});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://localhost:1448/@fs/'+fixture)
 opener=page.get_by_role('button',name='Open menu 0',exact=True);opener.click()
 menu=page.get_by_role('menu',name='Fixture menu 0',exact=True)
 assert menu.get_by_role('menuitem',name='Alpha',exact=False).evaluate('e=>getComputedStyle(e).display')=='grid','Menu rows must retain their menu layout when reusing FrameButton'
 assert menu.locator('.menu-label').first.evaluate('e=>getComputedStyle(e).textAlign')=='left'
 expect(menu.get_by_role('menuitem',name='Options',exact=True).locator('.menu-chevron svg path')).to_be_visible()
 assert menu.get_by_role('menuitem',name='Alpha',exact=False).bounding_box()['height']==24,'Menu rows should remain compact when composed from FrameButton'
 # Typeahead must use the label, independently of shortcut and status decorations.
 page.keyboard.press('z');expect(menu.get_by_role('menuitem',name='Zulu',exact=True)).to_be_focused()
 page.keyboard.press('Home');expect(menu.get_by_role('menuitem',name='Alpha',exact=False)).to_be_focused()
 page.keyboard.press('ArrowDown');expect(menu.get_by_role('menuitemcheckbox',name='Show badge',exact=True)).to_be_focused()
 expect(menu.get_by_role('menuitemcheckbox',name='Show badge',exact=True)).to_have_attribute('aria-checked','true')
 page.keyboard.press('ArrowDown');page.keyboard.press('ArrowRight')
 child=page.get_by_role('menu',name='Options',exact=True);expect(child.get_by_role('menuitem',name='Child action',exact=True)).to_be_focused()
 page.keyboard.press('ArrowDown');page.keyboard.press('ArrowRight')
 deep=page.get_by_role('menu',name='Advanced',exact=True);expect(deep.get_by_role('menuitem',name='Deep action',exact=True)).to_be_focused()
 page.keyboard.press('ArrowLeft');expect(child.get_by_role('menuitem',name='Advanced',exact=True)).to_be_focused()
 page.keyboard.press('ArrowLeft');expect(menu.get_by_role('menuitem',name='Options',exact=True)).to_be_focused()
 page.keyboard.press('End');page.keyboard.press('Enter');expect(page.locator('#selected')).to_have_text('zulu');expect(menu).to_have_count(0);expect(opener).to_be_focused();expect(page.locator('#closes')).to_have_text('1')
 opener.click();page.keyboard.press('Escape');expect(opener).to_be_focused();expect(page.locator('#closes')).to_have_text('2')
 opener.click();page.get_by_role('button',name='Outside 0',exact=True).click();expect(menu).to_have_count(0);expect(page.locator('#selected')).to_have_text('outside');expect(page.get_by_role('button',name='Outside 0',exact=True)).to_be_focused()
 opener.click();menu.get_by_role('menuitemcheckbox',name='Show badge',exact=True).click();expect(page.locator('#selected')).to_have_text('checked');expect(menu).to_have_count(0)
 opener.click();menu.get_by_role('menuitem',name='Blocked',exact=True).click(force=True);expect(menu).to_be_visible();page.keyboard.press('Tab');expect(menu).to_have_count(0)
 # Separate hosts own their portalled menu; all levels remain inside their bounds.
 for i in range(2):
  area=page.get_by_text('Context area '+str(i),exact=True);area.click(button='right',position={'x':area.bounding_box()['width']-4,'y':180})
  root=page.get_by_role('menu',name='Fixture menu '+str(i),exact=True);expect(root).to_be_visible()
  host=page.locator('#host-'+str(i)+' .workbench-body').bounding_box()
  def bounded(m):
   page.wait_for_function("""(label)=>{const e=[...document.querySelectorAll('main [role=menu],.frame-overlay-host [role=menu]')].find(e=>e.getAttribute('aria-label')===label);if(!e)return false;const r=e.getBoundingClientRect();const b=e.closest('.frame-overlay-host').getBoundingClientRect();return r.x>=b.x-1&&r.y>=b.y-1&&r.right<=b.right+1&&r.bottom<=b.bottom+1}""",arg=m.get_attribute('aria-label'));r=m.bounding_box();assert r['x']>=host['x']-1 and r['y']>=host['y']-1 and r['x']+r['width']<=host['x']+host['width']+1 and r['y']+r['height']<=host['y']+host['height']+1,(r,host)
  bounded(root);root.get_by_role('menuitem',name='Options',exact=True).hover();sub=page.get_by_role('menu',name='Options',exact=True);expect(sub).to_be_visible();bounded(sub)
  page.keyboard.press('Escape');expect(root).to_have_count(0)
 for alignment in ['center','right']:
  page.evaluate('(value)=>window.__menuAlignment.value=value',alignment);opener.click()
  expect(menu).to_have_attribute('data-item-alignment',alignment);assert menu.locator('.menu-label').first.evaluate('e=>getComputedStyle(e).textAlign')==alignment
  menu.get_by_role('menuitem',name='Options',exact=True).hover();sub=page.get_by_role('menu',name='Options',exact=True);expect(sub).to_be_visible();assert sub.locator('.menu-label').first.evaluate('e=>getComputedStyle(e).textAlign')==alignment;page.keyboard.press('Escape')
  page.get_by_text('Wrapped context area 0',exact=True).click(button='right');wrapped=page.get_by_role('menu',name='Wrapped menu 0',exact=True);expect(wrapped).to_have_attribute('data-item-alignment',alignment);assert wrapped.locator('.menu-label').first.evaluate('e=>getComputedStyle(e).textAlign')==alignment;page.keyboard.press('Escape')
 page.evaluate("window.__menuAlignment.value='left'")
 page.locator('#host-0').evaluate('e=>e.style.height="180px"');opener.click();expect(menu).to_be_visible();assert menu.evaluate('e=>e.scrollHeight>e.clientHeight');page.keyboard.press('End');expect(menu.get_by_role('menuitem',name='Zulu',exact=True)).to_be_focused();page.keyboard.press('Escape')
 assert not errors,errors
 browser.close();print('Shell menu typeahead, disabled skipping, nested keyboard navigation, checked items, selection, dismissal, focus and per-Frame collision bounds passed.')
