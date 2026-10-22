"""Standalone Tooltip/Button compatibility; docs host defaults to 1448."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
base=os.environ.get('FRAME_TEST_URL','http://localhost:1448').rstrip('/')
with sync_playwright() as p:
 browser=p.chromium.launch()
 page=browser.new_page(viewport={'width':900,'height':700})
 errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 fixture=(Path(__file__).parent/'fixtures/tooltip-buttons/index.html').resolve().as_posix()
 page.goto(f'{base}/@fs/{fixture}')
 page.get_by_role('button',name='Default button',exact=True).click()
 expect(page.locator('#submitted')).to_have_text('false')
 page.get_by_role('button',name='Submit',exact=True).click()
 expect(page.locator('#submitted')).to_have_text('true')
 expect(page.locator('#clicks')).to_have_text('2')
 page.get_by_role('button',name='Disabled button',exact=True).evaluate('el => el.click()')
 expect(page.locator('#clicks')).to_have_text('2')
 expect(page.get_by_role('button',name='Disabled button',exact=True)).to_be_disabled()
 page.get_by_role('button',name='Check elements',exact=True).click()
 assert page.evaluate('window.elementContracts')=={'button':True,'icon':True}
 page.get_by_role('button',name='Focus public button',exact=True).click()
 expect(page.get_by_role('button',name='Submit',exact=True)).to_be_focused()
 page.get_by_role('button',name='Focus public icon',exact=True).click()
 expect(page.get_by_role('button',name='Open',exact=True)).to_be_focused()
 icon=page.get_by_role('button',name='Open',exact=True)
 icon.hover()
 expect(page.get_by_role('tooltip')).to_have_text('Open Ctrl+O')
 ids=icon.get_attribute('aria-describedby').split()
 assert 'external-description' in ids,ids
 assert any(page.locator(f'[id="{ident}"]').inner_text().replace('\n',' ').strip()=='Open Ctrl+O' for ident in ids if ident!='external-description'), ids
 page.keyboard.press('Escape')
 expect(page.get_by_role('tooltip')).to_have_count(0)
 page.get_by_role('button',name='No hint',exact=True).hover()
 page.wait_for_timeout(500)
 expect(page.get_by_role('tooltip')).to_have_count(0)
 standalone=page.get_by_role('button',name='Standalone',exact=True)
 standalone.hover()
 expect(page.get_by_role('tooltip')).to_have_text('Standalone hint Alt+S')
 expect(page.locator('#standalone-wrapper')).to_have_class('tooltip-trigger')
 page.get_by_role('button',name='Toggle hint',exact=True).evaluate('el => el.click()')
 expect(page.get_by_role('tooltip')).to_have_count(0)
 standalone.hover()
 page.wait_for_timeout(500)
 expect(page.get_by_role('tooltip')).to_have_count(0)
 # Keyboard focus opens immediately and blur closes without pointer involvement.
 page.get_by_role('button',name='Toggle hint',exact=True).click()
 page.mouse.move(0,0)
 standalone.focus()
 page.keyboard.press('Shift+Tab');page.keyboard.press('Tab')
 expect(page.get_by_role('tooltip')).to_have_text('Standalone hint Alt+S')
 page.keyboard.press('Tab')
 expect(page.get_by_role('tooltip')).to_have_count(0)
 # A rectangular source SVG keeps its viewBox in a square slot; labels stay optional.
 rectangular=page.get_by_role('button',name='Rectangle',exact=True)
 box=rectangular.bounding_box()
 assert abs(box['width']-box['height'])<0.5,box
 slot=rectangular.locator('.frame-icon-button-icon').bounding_box()
 assert abs(slot['width']-slot['height'])<0.5,slot
 assert rectangular.locator('svg').get_attribute('viewBox')=='0 0 16 10'
 labeled=page.get_by_role('button',name='Labeled rectangle',exact=True)
 expect(labeled.locator('.frame-icon-button-label')).to_have_text('Labeled rectangle')
 assert labeled.bounding_box()['width']>labeled.bounding_box()['height']
 assert labeled.locator('.frame-icon-button-label').evaluate("e=>getComputedStyle(e).paddingInlineEnd")=='2px'
 labeled.evaluate("e=>e.style.setProperty('--frame-icon-button-label-end-padding','0px')")
 assert labeled.locator('.frame-icon-button-label').evaluate("e=>getComputedStyle(e).paddingInlineEnd")=='0px'
 assert not errors,errors
 print('Tooltip/button compatibility browser checks passed.')
 browser.close()
