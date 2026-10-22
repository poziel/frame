"""Pointer hover is neutral; keyboard focus and active submenu triggers are accented."""
import os
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1280,'height':900})
 page.goto(os.environ.get('FRAME_TEST_URL','http://localhost:1448'))
 def accented(item):
  return item.evaluate("e=>{const s=getComputedStyle(e);const c=document.createElement('span');c.style.color='var(--frame-accent)';e.append(c);const a=getComputedStyle(c).color;c.remove();return s.borderTopColor===a}")
 page.get_by_role('menubar',name='Application menus').get_by_role('menuitem',name='View',exact=True).click()
 menu=page.get_by_role('menu',name='Application menu',exact=True)
 ordinary=menu.get_by_role('menuitem',name='Quick actions…',exact=False)
 ordinary.hover();assert not accented(ordinary),'pointer hover must not receive an accent border'
 submenu=menu.get_by_role('menuitem',name='Open view',exact=True)
 submenu.hover();expect(submenu).to_have_attribute('aria-expanded','true');assert accented(submenu)
 child=page.get_by_role('menu',name='Open view',exact=True)
 leaf=child.get_by_role('menuitem').first;leaf.hover();assert not accented(leaf)
 page.keyboard.press('Escape')
 trigger=page.get_by_role('menubar',name='Application menus').get_by_role('menuitem',name='View',exact=True)
 trigger.focus();page.keyboard.press('ArrowDown')
 expect(ordinary).to_be_focused();assert accented(ordinary),'keyboard focus must receive an accent border'
 page.keyboard.press('ArrowDown');expect(submenu).to_be_focused();assert accented(submenu)
 page.keyboard.press('ArrowRight');expect(child.get_by_role('menuitem').first).to_be_focused();assert accented(child.get_by_role('menuitem').first)
 page.keyboard.press('ArrowLeft');expect(submenu).to_be_focused();assert accented(submenu)
 browser.close()
print('Menu pointer hover, active submenu, keyboard focus, and submenu return passed.')


