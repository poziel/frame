from pathlib import Path
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport={'width':1400,'height':900})
    fixture=(Path(__file__).parent/'fixtures/accent-palette/index.html').resolve().as_posix()
    page.goto(f'http://localhost:1448/@fs/{fixture}')
    palette=page.get_by_role('region',name='Accent palette')
    expect(palette).to_be_visible()
    expect(palette.locator('.accent-palette-colors button')).to_have_count(20)
    for name,color in [('Iris purple','#8066CC'),('Muted teal','#368F87'),('Copper','#B87550')]:
        palette.get_by_role('button',name=f'{name} {color}',exact=True).click()
        assert page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--frame-accent").trim()')==color
        fills=page.locator('.app-mark svg path').evaluate_all('(els)=>els.map(el=>getComputedStyle(el).fill)')
        assert len(set(fills))==2,fills
        assert fills[1] == f'rgb({int(color[1:3],16)}, {int(color[3:5],16)}, {int(color[5:7],16)})',fills
    palette.get_by_role('button',name='Reset accent',exact=True).click()
    assert page.evaluate('document.documentElement.style.getPropertyValue("--frame-accent")')==''
    browser.close()
print('20 presets, runtime accents, two-tone logo and reset passed')
