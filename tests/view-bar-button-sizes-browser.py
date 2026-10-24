"""Exercise both real activity controllers across size, orientation, and display changes."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':850})
 fixture=(Path(__file__).parent/'fixtures/sidebar-parity/index.html').resolve().as_posix()
 page.goto(os.environ.get('FRAME_TEST_URL','http://localhost:1448').rstrip('/')+'/@fs/'+fixture)
 root=page.locator('#sidebar-instance-0')
 page.wait_for_function('!!window.sidebarFrames')
 for position in ['default','top','bottom']:
  for display in (['icons'] if position=='default' else ['icons','both','text']):
   for size in ['default','compact','default']:
    page.evaluate("([position,size,display])=>{const f=window.sidebarFrames[0];for(const c of [f.primaryViewBar,f.secondaryViewBar]){c.setPosition(position);c.setSize(size);c.setDisplay(display)}}",[position,size,display])
    for region in ['Primary','Secondary']:
     bar=root.get_by_role('navigation',name=region+' view bar',exact=True)
     button=bar.get_by_role('button',name=region+' view 1',exact=True)
     expect(button).to_have_class(__import__('re').compile(r'frame-icon-button'))
     expect(bar).to_have_css('padding','4px')
     expect(bar.locator('.view-bar-items')).to_have_css('gap','4px')
     expect(button).to_have_css('padding','3px' if size=='compact' else '4px')
     if display!='text':
      dimension=18 if size=='compact' else 22 if position!='default' and display=='both' else 28
      slot=button.locator('.bar-icon-slot');glyph=slot.locator('svg').first
      for element in [slot,glyph]:
       expect(element).to_have_css('width',str(dimension)+'px');expect(element).to_have_css('height',str(dimension)+'px')
      if display=='icons':
       rect=button.bounding_box();assert abs(rect['width']-rect['height'])<0.5,(position,size,region,rect)
      else:
       expect(button).to_have_css('gap','4px')
       label=button.locator('.view-bar-label');expect(button).to_have_css('font-size','11px' if size=='compact' else '14px')
       a=slot.bounding_box();c=label.bounding_box();assert abs(a['y']+a['height']/2-c['y']-c['height']/2)<1,(a,c)
 b.close()
print('PASS: both view bars, all positions/displays, repeated normal/compact transitions, SVG sizes, padding and alignment.')
