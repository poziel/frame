from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parent.parent/'.tmp/forms-dates')))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  page=browser.new_page(); errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}')
  page.locator('#calendar [data-reka-calendar-cell-trigger]:not([data-disabled])').first.click()
  assert page.locator('#value').inner_text() != 'empty'
  page.locator('#date-field [role=spinbutton]').first.focus()
  page.keyboard.press('ArrowUp')
  assert page.locator('#field-value').inner_text() != '2026-10-15'
  page.get_by_role('button',name='Choose date',exact=True).click()
  page.get_by_role('dialog').wait_for()
  assert page.locator('#date-overlay-host [role=dialog]').count()==1
  rect=page.get_by_role('dialog').bounding_box()
  assert rect['x']>=0 and rect['x']+rect['width']<=page.viewport_size['width']+1
  page.locator('[role=dialog] .frame-date-day:not([data-disabled])').first.click()
  assert page.locator('#popup-value').inner_text() != 'empty'
  page.get_by_role('button',name='Choose date',exact=True).click()
  page.keyboard.press('Escape')
  assert page.get_by_role('dialog').count()==0
  page.get_by_role('button',name='Choose range',exact=True).click()
  page.get_by_role('dialog').wait_for()
  range_days=page.locator('[role=dialog] .frame-date-day:not([data-disabled])')
  range_days.nth(8).click();range_days.nth(11).click()
  if page.get_by_role('dialog').count(): page.keyboard.press('Escape')
  for name in ['month','month-range','year','year-range','range-calendar']:
   assert page.locator('#'+name+' [role=grid]').count()>0,name
  for name in ['time','time-range','date-range']:
   assert page.locator('#'+name+' [role=spinbutton]').count()>0,name
  page.locator('#month .frame-date-day:not([data-disabled])').nth(1).click()
  assert page.locator('#month-value').inner_text() != 'empty'
  days=page.locator('#range-calendar .frame-date-day:not([data-disabled])')
  days.nth(8).click();days.nth(11).click()
  assert 'empty' not in page.locator('#range-value').inner_text()
  assert page.locator('#disabled .frame-date-day:not([data-disabled])').count()==0
  assert page.locator('#limited .frame-date-day:not([data-disabled])').count()==1
  before=page.locator('.frame-calendar').first.evaluate('el=>getComputedStyle(el).backgroundColor')
  page.evaluate("document.documentElement.style.setProperty('--frame-surface','#123456')")
  assert page.locator('.frame-calendar').first.evaluate('el=>getComputedStyle(el).backgroundColor')=='rgb(18, 52, 86)'
  assert before!='rgb(18, 52, 86)'
  assert not errors,errors
  browser.close()
  print('Date forms verified: all 12 families, keyboard editing, popup/range/month selection, disabled/min/max, owned portal clipping and pointer input, theme updates.')
finally:
 server.shutdown();server.server_close()
