"""Run against the docs Vite server via FRAME_DOCS_URL."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright,expect
url=os.environ.get('FRAME_DOCS_URL','http://localhost:1448')
fixture=(Path(__file__).parent/'fixtures/dialog-primitives/index.html').resolve().as_posix()
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1100,'height':800});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(os.environ.get('FRAME_DIALOG_FIXTURE_URL',url+'/@fs/'+fixture))
 page.get_by_role('button',name='Open picker',exact=True).click();search=page.get_by_role('combobox',name='Choose command',exact=True);expect(search).to_be_focused()
 search.press('ArrowDown');search.press('Enter');expect(page.locator('#accepted')).to_have_text('two');expect(page.get_by_role('button',name='Open picker',exact=True)).to_be_focused()
 page.get_by_role('button',name='Open picker',exact=True).click();search.fill('First searchable');expect(page.get_by_role('option',name='One First searchable detail',exact=False)).to_be_visible();search.press('Enter');expect(page.locator('#accepted')).to_have_text('one')
 page.get_by_role('button',name='Open picker',exact=True).click();search.fill('does not exist');expect(page.get_by_role('status')).to_have_text('No matching actions.');search.press('Escape');expect(page.get_by_role('dialog',name='Choose command')).to_have_count(0)
 page.get_by_role('button',name='Open modal',exact=True).click();first=page.get_by_role('dialog',name='First modal',exact=True);entry=page.get_by_role('textbox',name='Retained input');expect(entry).to_be_focused();entry.fill('preserve me')
 header=first.locator('.frame-modal-header');box=first.bounding_box();header.press('Alt+ArrowRight');assert first.bounding_box()['x']==box['x']+10
 page.get_by_role('button',name='Open second',exact=True).focus();page.keyboard.press('Tab');expect(header).to_be_focused()
 page.get_by_role('combobox',name='Modal choice',exact=True).click();page.get_by_role('option',name='Beta',exact=True).click();expect(first).to_be_visible()
 page.get_by_role('combobox',name='Modal choice',exact=True).click();page.keyboard.press('Escape');expect(first).to_be_visible();expect(page.get_by_role('listbox',name='Modal choice')).to_have_count(0)
 page.get_by_role('button',name='Open second',exact=True).click();expect(page.get_by_role('dialog',name='Second modal',exact=True)).to_be_visible();page.get_by_role('button',name='Raise first',exact=True).click();expect(entry).to_have_value('preserve me');expect(entry).to_be_focused()
 page.keyboard.press('Escape');expect(first).to_have_count(0);expect(page.get_by_role('dialog',name='Second modal',exact=True)).to_be_visible();page.keyboard.press('Escape');expect(page.locator('.frame-modal')).to_have_count(0)
 # A direct close restores its opener. Reordered-stack opener history remains Frame's existing policy.
 page.get_by_role('button',name='Open modal',exact=True).click();page.keyboard.press('Escape');expect(page.get_by_role('button',name='Open modal',exact=True)).to_be_focused()
 page.get_by_role('button',name='Open custom panel',exact=True).click();expect(page.get_by_role('dialog',name='Custom panel',exact=True)).to_be_visible();page.get_by_role('textbox',name='Custom entry').focus();page.keyboard.press('Shift+Tab');expect(page.get_by_role('button',name='Close panel',exact=True)).to_be_focused();page.keyboard.press('Escape');expect(page.get_by_role('dialog',name='Custom panel')).to_have_count(0)
 assert not errors,errors
 b.close();print('Reka dialog/quick input: API acceptance, filter/detail, disabled skip, Escape/focus, modal stack retention, owned popup, custom content passed.')
