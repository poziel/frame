"""Navigation arrows and layout visibility in the documentation application."""
from playwright.sync_api import sync_playwright, expect
import os
from pathlib import Path
BASE_URL=os.environ.get("FRAME_TEST_URL", "http://localhost:1420").rstrip("/")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 820})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE_URL+"/")
    back = page.get_by_role("button", name="Back", exact=True)
    forward = page.get_by_role("button", name="Forward", exact=True)
    expect(back).to_be_visible()
    expect(back).to_be_disabled()
    expect(forward).to_be_disabled()
    search = page.get_by_role("button", name="Open quick actions")
    assert forward.bounding_box()["x"] < search.bounding_box()["x"]
    catalog = page.locator(".component-catalog")
    catalog.get_by_role("button", name="Loading region", exact=True).click()
    catalog.get_by_role("button", name="Text inputs", exact=True).click()
    expect(catalog.get_by_role("button", name="Text inputs", exact=True)).to_have_attribute("aria-current", "page")
    back.click()
    expect(catalog.get_by_role("button", name="Loading region", exact=True)).to_have_attribute("aria-current", "page")
    forward.click()
    expect(catalog.get_by_role("button", name="Text inputs", exact=True)).to_have_attribute("aria-current", "page")
    back.click()
    catalog.get_by_role("button", name="Buttons", exact=True).click()
    expect(forward).to_be_disabled()
    page.locator(".workspace-pane-host").first.click(button="right", position={"x": 10, "y": 10})
    expect(page.get_by_role("menuitemcheckbox", name="Back and Forward", exact=True)).to_have_count(0)
    expect(page.get_by_role("menuitem", name="Split Right", exact=True)).to_be_visible()
    expect(page.get_by_role("menuitem", name="Close Pane", exact=True)).to_be_disabled()
    page.keyboard.press("Escape")
    page.get_by_role("button", name="Customize layout", exact=True).click()
    choices=page.locator('.layout-options button').evaluate_all('els=>els.map(el=>el.dataset.option)')
    assert choices[0]=='menu',choices
    assert choices.index('navigation')==choices.index('status')+1,choices
    page.get_by_role("menuitemcheckbox", name="Back and Forward", exact=True).click()
    page.keyboard.press("Escape")
    expect(back).to_have_count(0)
    page.get_by_role("button", name="Customize layout", exact=True).click()
    page.get_by_role("menuitemcheckbox", name="Back and Forward", exact=True).click()
    page.keyboard.press("Escape")
    expect(back).to_be_visible()
    expect(back).to_be_enabled()
    back.click()
    expect(catalog.get_by_role("button", name="Loading region", exact=True)).to_have_attribute("aria-current", "page")
    for width in [760, 700, 540, 420]:
        page.set_viewport_size({"width": width, "height": 820})
        assert back.bounding_box()["x"] >= 0
        assert forward.bounding_box()["x"] + forward.bounding_box()["width"] <= search.bounding_box()["x"] + 1
    # An instance with navigation disabled retains workspace actions without exposing visibility.
    fixture=(Path(__file__).parent/'fixtures/overlays/index.html').resolve().as_posix()
    page.goto(BASE_URL+'/@fs/'+fixture)
    page.get_by_role('button',name='Customize layout',exact=True).click()
    expect(page.get_by_role('menuitemcheckbox',name='Back and Forward',exact=True)).to_have_count(0)
    page.keyboard.press('Escape')
    page.locator('.workspace-pane-host').first.click(button='right',position={'x':10,'y':100})
    expect(page.get_by_role('menuitemcheckbox',name='Back and Forward',exact=True)).to_have_count(0)
    expect(page.get_by_role('menuitem',name='Close Pane',exact=True)).to_be_disabled()
    page.get_by_role('menuitem',name='Split Right',exact=True).click()
    expect(page.locator('.workspace-pane-host')).to_have_count(2)
    page.locator('.workspace-pane-host').last.click(button='right',position={'x':10,'y':100})
    expect(page.get_by_role('menuitem',name='Close Pane',exact=True)).to_be_enabled()
    page.get_by_role('menuitem',name='Close Pane',exact=True).click()
    expect(page.locator('.workspace-pane-host')).to_have_count(1)
    assert not errors, errors
    browser.close()
    print("Navigation browser checks passed")

