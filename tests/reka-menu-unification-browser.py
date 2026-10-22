from pathlib import Path
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1280,'height':900});page.set_default_timeout(7000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://localhost:1448/@fs/'+Path('tests/fixtures/shell-menu/index.html').resolve().as_posix())
 dropdown=page.get_by_role('button',name='Dropdown 0',exact=True);dropdown.click()
 menu=page.get_by_role('menu',name='Reusable dropdown 0',exact=True);expect(menu).to_be_visible()
 assert menu.get_attribute('class')=='frame-menu'
 page.keyboard.press('z');expect(menu.get_by_role('menuitem',name='Zulu',exact=True)).to_be_focused()
 page.keyboard.press('Enter');expect(page.locator('#selected')).to_have_text('zulu');expect(dropdown).to_be_focused()
 context=page.get_by_role('button',name='Context 0',exact=True);context.click(button='right')
 menu=page.get_by_role('menu',name='Reusable context 0',exact=True);expect(menu).to_be_visible()
 menu.get_by_role('menuitem',name='Options',exact=True).hover();sub=page.get_by_role('menu',name='Options',exact=True);expect(sub).to_be_visible()
 page.keyboard.press('Escape');expect(menu).to_have_count(0)
 bar=page.get_by_role('menubar',name='Reusable menubar 0',exact=True)
 file=bar.get_by_role('menuitem',name='File',exact=True);edit=bar.get_by_role('menuitem',name='Edit',exact=True)
 file.focus();page.keyboard.press('ArrowDown');menu=page.get_by_role('menu',name='File',exact=True);expect(menu.get_by_role('menuitem',name='Alpha',exact=False)).to_be_focused()
 page.keyboard.press('ArrowRight');expect(page.get_by_role('menu',name='Edit',exact=True)).to_be_visible();expect(menu).to_have_count(0)
 page.keyboard.press('Escape');expect(edit).to_be_focused()
 file.click();edit.hover();expect(page.get_by_role('menu',name='Edit',exact=True)).to_be_visible();page.keyboard.press('Escape')
 bar.get_by_role('menuitem',name='All application menus',exact=True).click();overflow=page.get_by_role('menu',name='Application menu',exact=True);expect(overflow.get_by_role('menuitem',name='Tools',exact=True)).to_be_visible();page.keyboard.press('Escape')
 assert not errors,errors
 b.close()
print('PASS: shared public dropdown/context presentation, selection/typeahead, context Escape, menubar keyboard/pointer switching and overflow.')
