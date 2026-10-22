"""Catalog scrolling/search sizing in the live docs shell; Playwright Chromium required."""
import os
from playwright.sync_api import sync_playwright,expect
URL=os.environ.get('FRAME_DOCS_URL','http://localhost:1448')
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1180,'height':450});errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)));page.goto(URL)
 def inspect(activity,search):
  activity_button=page.get_by_role('navigation',name='Activities',exact=True).get_by_role('button',name=activity,exact=True)
  if activity_button.get_attribute('aria-pressed')!='true':activity_button.click()
  catalog=page.locator('.component-catalog:visible');field=catalog.get_by_role('searchbox',name=search,exact=True)
  expect(field).to_be_visible()
  dimensions=field.evaluate('el=>{const p=el.parentElement;const s=getComputedStyle(p);return {input:el.getBoundingClientRect().width,available:p.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)}}')
  assert abs(dimensions['input']-dimensions['available'])<=1,(activity,dimensions)
  assert catalog.evaluate('el=>el.clientHeight>0 && el.clientHeight<=el.parentElement.clientHeight'),activity
  last=catalog.locator('section button').last
  if catalog.evaluate('el=>el.scrollHeight>el.clientHeight+1'):
   catalog.hover(position={'x':80,'y':150});page.mouse.wheel(0,30000)
   page.wait_for_function("document.querySelector('.component-catalog:not([hidden])')!==null")
   expect(last).to_be_in_viewport()
   assert catalog.evaluate('el=>el.scrollTop>0'),activity
   expect(page.locator('.frame-overlay-scrollbar.y').first).to_be_visible()
  last.click();expect(last).to_have_attribute('aria-current','page')
  catalog.evaluate('el=>el.scrollTop=0')
  return catalog
 for activity,search in [('Components','Filter components'),('Features','Filter Features'),('API','Filter API references')]:inspect(activity,search)
 page.get_by_role('navigation',name='Activities',exact=True).get_by_role('button',name='Components',exact=True).click()
 sash=page.get_by_role('separator',name='Resize primary sidebar',exact=True);sash.focus()
 for _ in range(25):page.keyboard.press('ArrowRight')
 assert page.locator('.component-catalog:visible').bounding_box()['width']>340
 for activity,search in [('Components','Filter components'),('Features','Filter Features'),('API','Filter API references')]:inspect(activity,search)
 assert not errors,errors;b.close()
print('Components, Features and API searches fill narrow/wide sidebars; catalog scrolling reaches final entries with existing overlay scrollbars.')

