"""Verify custom and Reka-backed controls respond to the same theme tokens."""
import os
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':1000});page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448'))
 def open_page(title):
  page.locator('.component-catalog').get_by_role('button',name=title,exact=True).click()
  page.get_by_role('tab',name='Features',exact=True).click()
  page.locator('.documentation-page').evaluate("e=>{e.style.setProperty('--frame-panel-radius','13px');e.style.setProperty('--frame-control-radius','9px');e.style.setProperty('--frame-font-mono','Courier New, monospace');e.style.setProperty('--frame-gap','10px')}")
 open_page('Code block')
 block=page.locator('.documentation-feature .showcase-preview .frame-code-block').first
 expect(block).to_be_visible()
 assert block.evaluate('e=>getComputedStyle(e).borderTopLeftRadius')=='13px'
 assert 'Courier New' in block.evaluate('e=>getComputedStyle(e).fontFamily')
 open_page('Selects')
 select=page.locator('.documentation-feature .showcase-preview .frame-select').first
 expect(select).to_be_visible()
 assert select.evaluate('e=>getComputedStyle(e).borderTopLeftRadius')=='9px'
 open_page('Loading region')
 # The custom loading indicator uses the shared spacing step, like the form controls.
 indicator=page.locator('.documentation-feature .frame-loading-indicator').first
 expect(indicator).to_be_visible()
 assert indicator.evaluate('e=>getComputedStyle(e).gap')=='20px'
 b.close()
print('Custom code/loading surfaces and Reka select honor shared radius, font and spacing tokens.')
