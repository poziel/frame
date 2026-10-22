"""Verify docs Home and guide navigation through the public shell UI."""
import os
from playwright.sync_api import sync_playwright, expect
URL=os.environ.get('FRAME_DOCS_URL','http://localhost:1448')
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':1000});errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)));page.goto(URL)
 workspace=page.get_by_role('main',name='Workspace',exact=True)
 expect(workspace.get_by_role('heading',name='What is Frame?',exact=True)).to_be_visible()
 expect(page.get_by_role('button',name='Back',exact=True)).to_be_disabled()
 page.get_by_role('button',name='Guides',exact=True).click()
 catalog=page.get_by_role('navigation',name='Frame guides')
 expect(catalog.get_by_role('heading',name='Introduction',exact=True)).to_be_visible()
 assert catalog.get_by_role('heading').evaluate('e=>getComputedStyle(e).textTransform') == 'uppercase'
 expect(catalog.locator('.frame-icon')).to_have_count(0)
 expect(workspace.get_by_role('tablist')).to_have_count(0)
 rows=catalog.get_by_role('button').all()
 assert rows[0].bounding_box()['x'] == rows[1].bounding_box()['x']
 assert rows[1].bounding_box()['y'] >= rows[0].bounding_box()['y']+rows[0].bounding_box()['height']
 page.screenshot(path='.tmp/guides-sidebar.png')
 catalog.get_by_role('button',name='Getting started',exact=True).click()
 expect(workspace.get_by_role('heading',name='Getting started',exact=True)).to_be_visible()
 expect(page).to_have_url(URL+'/#/guide/getting-started' if not URL.endswith('/') else URL+'#/guide/getting-started')
 page.reload()
 expect(page.get_by_role('button',name='Back',exact=True)).to_be_disabled()
 expect(page.get_by_role('button',name='Forward',exact=True)).to_be_disabled()
 expect(workspace.get_by_role('heading',name='Getting started',exact=True)).to_be_visible()
 page.get_by_role('button',name='Guides',exact=True).click()
 catalog.get_by_role('button',name='How Frame works',exact=True).click()
 expect(workspace.get_by_role('heading',name='How Frame works',exact=True)).to_be_visible()
 page.get_by_role('button',name='Home',exact=True).click()
 expect(workspace.get_by_role('heading',name='What is Frame?',exact=True)).to_be_visible()
 workspace.get_by_role('button',name='Browse components',exact=True).click()
 page.locator('.component-catalog').get_by_role('button',name='Autocomplete',exact=True).click()
 expect(page.locator('.documentation-page h1')).to_have_text('Autocomplete')
 assert '#/guide/' not in page.url
 page.get_by_role('button',name='Home',exact=True).click()
 expect(workspace.get_by_role('heading',name='What is Frame?',exact=True)).to_be_visible()
 expect(workspace.get_by_role('heading',name='What is Frame?',exact=True)).to_be_in_viewport()
 workspace.locator('.workspace-pane').first.click(button='right',position={'x':20,'y':20})
 page.get_by_role('menuitem',name='Split Right',exact=True).click()
 expect(workspace.locator('.workspace-pane')).to_have_count(2)
 page.get_by_role('button',name='Home',exact=True).click()
 expect(workspace.locator('.workspace-pane')).to_have_count(2)
 expect(workspace.get_by_role('heading',name='What is Frame?',exact=True)).to_have_count(2)
 page.get_by_role('button',name='Close pane: What is Frame?',exact=True).last.click()
 page.screenshot(path='.tmp/home-guide.png')
 assert not errors,errors
 browser.close()
print('Home introduction, Guides navigation, deep-link reloads, component navigation and return Home passed.')
