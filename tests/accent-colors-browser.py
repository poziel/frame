from pathlib import Path
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page()
    fixture=(Path(__file__).parent/'fixtures/panel-controls/index.html').resolve().as_posix()
    page.goto(f'http://localhost:1448/@fs/{fixture}')
    page.get_by_role('button',name='Customize layout',exact=True).click()
    item=page.locator('.layout-options button').first
    item.hover()
    for accent in ['#0078d4','#9467db']:
        page.evaluate('(color)=>document.documentElement.style.setProperty("--frame-accent",color)',accent)
        colors=page.evaluate('''() => {
          const input=document.createElement('input');
          document.querySelector('.workbench').append(input);
          input.focus();
          const focus=getComputedStyle(input).outlineColor;
          const selection=getComputedStyle(document.querySelector('.layout-options button.selected')).backgroundColor;
          input.remove();return {focus,selection};
        }''')
        assert colors['focus']==colors['selection'],colors
    browser.close()
print('Accent hover/focus parity passed with default and custom themes')
