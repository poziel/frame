"""Activity buttons must not shift when the adjacent sidebar opens."""
import os
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 browser=p.chromium.launch()
 page=browser.new_page(viewport={'width':1500,'height':1000})
 page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448'))
 region=page.locator('.primary-region').first
 buttons=region.locator('.rail-button[data-view-id]')
 buttons.first.wait_for()
 def geometry():
  return buttons.evaluate_all("els=>els.map(e=>({button:e.getBoundingClientRect().x-e.closest('.view-bar').getBoundingClientRect().x,icon:e.firstElementChild.getBoundingClientRect().x-e.closest('.view-bar').getBoundingClientRect().x}))")
 def toggle(button):
  # Keep a stable locator after aria-pressed changes during the click.
  button=region.get_by_role("button",name=button.get_attribute("aria-label"),exact=True)
  button.click()
  expected=button.get_attribute('aria-pressed')=='true'
  expect(region).to_have_class(__import__('re').compile(r'\bexpanded\b') if expected else __import__('re').compile(r'^(?!.*\bexpanded\b)'))
 for side in ['left','right']:
  # Mirror only the existing CSS geometry to isolate the shared border rule.
  page.locator('.layout-grid').evaluate('(e,side)=>e.classList.toggle("primary-right",side==="right")',side)
  region.evaluate('(e,side)=>e.dataset.sidebarSide=side',side)
  for compact in [False,True]:
   page.locator('.workbench').evaluate('(e,on)=>e.classList.toggle("compact",on)',compact)
   if region.locator('.rail-button[data-view-id][aria-pressed=true]').count():toggle(region.locator('.rail-button[data-view-id][aria-pressed=true]').first)
   closed=geometry()
   for button in buttons.all():
    toggle(button)
    opened=geometry()
    assert closed==opened,(side,compact,closed,opened)
    toggle(button)
    assert geometry()==closed,(side,compact)
 browser.close()
print('Activity rail icon/button alignment stays fixed across every primary view, left/right placement and compact mode.')
