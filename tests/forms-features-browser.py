"""Verify Reka-based feature guides and their real Frame examples."""
import json, os, subprocess
from playwright.sync_api import sync_playwright, expect
inventory=json.loads(subprocess.check_output(['bun','-e', "import {componentDocumentation as d} from './packages/docs/src/examples/documentation/registry';import {componentExamples as e} from './packages/docs/src/examples/componentCatalog';console.log(JSON.stringify(e.filter(x=>d[x.id].guide).map(x=>({id:x.id,title:x.title,count:d[x.id].features.length}))))"],text=True))
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':1000});errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)));page.goto(os.environ.get('FRAME_DOCS_URL','http://localhost:1448'))
 def open_page(title):
  page.locator('.component-catalog').get_by_role('button',name=title,exact=True).click()
  expect(page.locator('.documentation-page h1')).to_have_text(title)
  page.get_by_role('tab',name='Features',exact=True).click()
 def feature(heading):
  return page.locator('.documentation-feature').filter(has=page.get_by_role('heading',name=heading,exact=True))
 for item in inventory:
  open_page(item['title'])
  guide=page.get_by_role('region',name='Component guide',exact=True)
  expect(guide.get_by_role('heading',name='Anatomy',exact=True)).to_be_visible()
  expect(guide.get_by_role('link',name='Reka’s component guide')).to_have_attribute('href', 'https://reka-ui.com/docs/components/'+('checkbox' if item['id']=='checkbox-group' else item['id']))
  sections=page.locator('.documentation-feature');expect(sections).to_have_count(item['count'])
  for section in sections.all():expect(section.locator('.documentation-surface')).to_be_visible()
 open_page('Autocomplete')
 free=feature('Free text with suggestions').get_by_role('combobox');free.fill('Pear');free.blur();expect(free).to_have_value('Pear')
 filtered=feature('Filtered suggestions and empty results').get_by_role('combobox');filtered.fill('pear')
 expect(page.get_by_text('No matching suggestions',exact=True)).to_be_visible()
 filtered.fill('blue');page.get_by_role('option',name='Blueberry',exact=True).click();expect(filtered).to_have_value('Blueberry')
 open_page('Combobox')
 combo=feature('Search and select').get_by_role('combobox');combo.fill('blue')
 page.get_by_role('option',name='Blueberry',exact=True).click();expect(combo).to_have_value('Blueberry')
 open_page('Listbox')
 multiple=feature('Select multiple items');target=multiple.get_by_role('option',name='Banana',exact=True)
 target.click();expect(target).to_have_attribute('aria-selected','true');target.click();expect(target).to_have_attribute('aria-selected','false')
 open_page('Editable')
 edit=feature('Edit in place');edit.get_by_text('Reka UI',exact=True).click()
 editor=edit.get_by_role('textbox');editor.fill('Draft');page.keyboard.press('Escape')
 expect(edit.get_by_text('Reka UI',exact=True)).to_be_visible()
 open_page('Form')
 form=feature('Validate before submission');form.get_by_role('button',name='Submit project',exact=True).click()
 expect(form.locator('.documentation-surface').get_by_role('status')).to_contain_text('projectName')
 assert not errors,errors
 open_page('Autocomplete');page.screenshot(path='.tmp/reka-guide-autocomplete.png')
 b.close()
print(f'{len(inventory)} source-linked guides, every live feature preview, free text/filtering, selection, cancellation and form submission passed.')
