from pathlib import Path
from playwright.sync_api import sync_playwright, expect

def near(a, b):
    assert abs(a - b) < 2, (a, b)

def content_box(locator):
    return locator.evaluate("el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); const left = parseFloat(s.paddingLeft), right = parseFloat(s.paddingRight), top = parseFloat(s.paddingTop), bottom = parseFloat(s.paddingBottom); return { x: r.x + left, y: r.y + top, width: r.width - left - right, height: r.height - top - bottom }; }")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 820})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    fixture = (Path(__file__).parent / "fixtures/panel-maximize/index.html").resolve().as_posix()
    page.goto(f"http://localhost:1420/@fs/{fixture}")
    panel = page.locator(".bottom-region")
    secondary = page.locator(".secondary-region")
    expect(panel.get_by_role("button", name="Maximize panel")).to_be_visible()
    expect(panel.locator('.panel-action-separator')).to_have_count(1)
    page.evaluate("fixtureFrame.openBottomPanel('empty')")
    expect(panel.locator('.panel-action-separator')).to_have_count(0)
    expect(panel.get_by_role("button", name="Maximize panel")).to_be_visible()
    expect(panel.get_by_role("button", name="Hide panel")).to_be_visible()
    page.evaluate("fixtureFrame.openBottomPanel('bottom')")
    panel.get_by_role("textbox", name="Retained input").fill("Keep me")
    for side in ["left", "right"]:
        for alignment in ["left", "right", "center", "justify"]:
            page.evaluate("([side, alignment]) => { fixtureFrame.layout.primarySide = side; fixtureFrame.layout.panelAlignment = alignment; }", [side, alignment])
            page.wait_for_timeout(50)
            original = panel.bounding_box()
            workspace = page.locator(".workspace-region").bounding_box()
            body = content_box(page.locator(".workbench-body"))
            rail = page.locator(".view-bar").bounding_box()
            panel.get_by_role("button", name="Maximize panel").click()
            expect(panel.get_by_role("button", name="Restore panel")).to_have_attribute("aria-pressed", "true")
            box = panel.bounding_box()
            near(box["y"], body["y"])
            near(box["height"], body["height"])
            primary_edge = (body["x"] + rail["width"] + 6 if side == "left" else body["x"] + body["width"] - rail["width"] - 6) if alignment in ["left", "justify"] else (workspace["x"] if side == "left" else workspace["x"] + workspace["width"])
            secondary_edge = (body["x"] + body["width"] if side == "left" else body["x"]) if alignment in ["right", "justify"] else (workspace["x"] + workspace["width"] if side == "left" else workspace["x"])
            near(box["x"], primary_edge if side == "left" else secondary_edge)
            near(box["x"] + box["width"], secondary_edge if side == "left" else primary_edge)
            panel.get_by_role("button", name="Restore panel").click()
            near(panel.bounding_box()["height"], original["height"])
            expect(panel.get_by_role("textbox", name="Retained input")).to_have_value("Keep me")
    secondary.get_by_role("button", name="Maximize secondary sidebar").click()
    near(secondary.bounding_box()["height"], content_box(page.locator(".workbench-body"))["height"])
    page.evaluate("fixtureFrame.layout.primaryViewBarVisible = false")
    page.wait_for_timeout(50)
    near(secondary.bounding_box()["width"], content_box(page.locator(".workbench-body"))["width"])
    secondary.get_by_role("button", name="Hide secondary sidebar").click()
    expect(secondary).to_be_hidden()
    assert page.evaluate("fixtureFrame.layout.maximizedRegion") is None
    page.evaluate("fixtureFrame.openSecondaryPanel()")
    expect(secondary.get_by_role("button", name="Maximize secondary sidebar")).to_be_visible()
    for width in [1280, 420]:
        for density in ["default", "compact"]:
            page.set_viewport_size({"width": width, "height": 820})
            page.evaluate("density => { fixtureFrame.layout.density = density; fixtureFrame.layout.primaryViewBarVisible = true; fixtureFrame.layout.panelAlignment = 'justify'; }", density)
            page.wait_for_timeout(50)
            panel.get_by_role("button", name="Maximize panel").click()
            box, rail = panel.bounding_box(), page.locator(".view-bar").bounding_box()
            assert box["x"] + box["width"] <= rail["x"] + 1  # primary is on the right
            expect(panel.get_by_role("button", name="Restore panel")).to_be_visible()
            panel.get_by_role("button", name="Restore panel").click()
    assert not errors, errors
    browser.close()
    print("Panel maximize browser checks passed")
