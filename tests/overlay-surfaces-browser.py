from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1100,'height':700});page.goto('http://localhost:1448/@fs/'+Path('tests/fixtures/shell-menu/index.html').resolve().as_posix());page.get_by_role('button',name='Open menu 0',exact=True).click()
 host=page.locator('.frame-overlay-host').first
 assert host.evaluate('e=>getComputedStyle(e).clipPath')=='none','The overlay host clip-path blocks backdrop blur from sampling the application behind it'
 styles=page.evaluate('''()=>{const host=document.querySelector('.frame-overlay-host');return ['frame-menu','frame-select-popup frame-reka-select-popup','palette','frame-modal','frame-date-popover','frame-advanced-popup','frame-general-dialog','frame-tooltip','frame-notification'].map(name=>{const e=document.createElement('section');e.className=name;host.append(e);const s=getComputedStyle(e);const result={name,background:s.backgroundColor,filter:s.backdropFilter};e.remove();return result})}''')
 assert len(set(item['background'] for item in styles))==1,styles
 assert all('blur(10px)' in item['filter'] for item in styles),styles
 assert '0.83' in styles[0]['background'],styles
 page.evaluate("document.documentElement.style.setProperty('--frame-overlay-backdrop-filter','none')")
 assert page.get_by_role('menu',name='Fixture menu 0',exact=True).evaluate('e=>getComputedStyle(e).backdropFilter')=='none'
 page.evaluate("document.documentElement.style.removeProperty('--frame-overlay-backdrop-filter')")
 page.context.new_cdp_session(page).send('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-transparency','value':'reduce'}]})
 assert page.get_by_role('menu',name='Fixture menu 0',exact=True).evaluate('e=>getComputedStyle(e).backdropFilter')=='none'
 assert page.get_by_role('menu',name='Fixture menu 0',exact=True).evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(31, 31, 31)'
 b.close();print('Overlay surfaces share a translucent frosted background, blur can sample behind the portal host, and reduced-transparency preference is respected.')
