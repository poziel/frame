"""Verify General catalog coverage and four-tab examples against the docs host."""
import json,os,subprocess
from playwright.sync_api import sync_playwright,expect
inventory=json.loads(subprocess.check_output(['bun','-e',"import {generalExamples} from './packages/docs/src/examples/generalCatalog';console.log(JSON.stringify(generalExamples.map(({id,title})=>({id,title}))));"],text=True))
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1500,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448'))
 for item in inventory:
  page.locator('.component-catalog').get_by_role('button',name=item['title'],exact=True).click()
  expect(page.locator('.documentation-page h1')).to_have_text(item['title'])
  page.get_by_role('tab',name='Features',exact=True).click()
  expect(page.locator('.documentation-feature')).to_have_count(2)
  for feature in page.locator('.documentation-feature').all():
   expect(feature.locator('.documentation-surface')).to_be_visible()
  for tab in ['API','Theming','Interactive demo']:
   page.get_by_role('tab',name=tab,exact=True).click()
   expect(page.locator('.documentation-panel:not([hidden])')).to_be_visible()
  assert not page.locator('.documentation-demo-inputs [role=alert]').count(),item['id']
 page.locator('.component-catalog').get_by_role('button',name='Toast',exact=True).click()
 page.get_by_role('tab',name='Features',exact=True).click()
 first=page.locator('.documentation-feature').first
 first.get_by_role('button',name='Show notification',exact=True).click()
 expect(page.locator('.frame-general-toast').get_by_text('Project saved',exact=True)).to_be_visible()
 page.get_by_role('button',name='Dismiss notification',exact=True).click()
 expect(page.locator('.frame-general-toast')).to_have_count(0)
 first.get_by_role('button',name='Show notification',exact=True).click()
 expect(page.locator('.frame-general-toast')).to_be_visible()
 page.get_by_role('button',name='Dismiss notification',exact=True).click()
 assert not errors,errors
 b.close()
print('All23 new General pages:46live examples, API/theme/demo tabs and repeated toast activation passed.')

