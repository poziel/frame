"""Run against the docs dev server on port 1420 with Playwright Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(permissions=["clipboard-read", "clipboard-write"], viewport={"width": 1180, "height": 780})
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    fixture = (Path(__file__).parent / "fixtures/code-block/index.html").resolve().as_posix()
    page.goto(f"http://localhost:1420/@fs/{fixture}")
    viewer = page.locator("#viewer")
    expect(viewer).to_be_visible()
    expect(viewer).to_have_attribute("aria-busy", "false")
    expect(viewer.locator(".frame-code-line")).to_have_count(4)
    expect(viewer.locator(".frame-code-line").first).to_have_attribute("data-line", "40")
    expect(viewer.locator('.frame-code-line[data-line="42"]')).to_have_class("frame-code-line is-highlighted")
    assert viewer.locator(".frame-code-token[style]").count() > 1
    row = viewer.locator(".frame-code-line").first
    row.hover()
    hovered = row.evaluate("el => getComputedStyle(el).backgroundColor")
    page.get_by_role("button", name="Toggle hover", exact=True).click()
    row.hover()
    assert row.evaluate("el => getComputedStyle(el).backgroundColor") != hovered
    page.get_by_role("button", name="Toggle numbers", exact=True).click()
    expect(viewer.locator(".frame-code-gutter")).to_have_count(0)
    page.get_by_role("button", name="Copy code", exact=True).click()
    expect(viewer.get_by_role("status")).to_have_text("Copied")
    clipboard = page.evaluate("navigator.clipboard.readText()")
    assert clipboard.replace("\r\n", "\n") == 'const greeting = "Hello";\n\nconsole.log(greeting);\n', repr(clipboard)
    dark = viewer.evaluate("el => getComputedStyle(el).backgroundColor")
    page.get_by_role("button", name="Toggle theme", exact=True).click()
    expect(viewer).to_have_attribute("data-theme", "light-plus")
    expect(viewer).to_have_attribute("aria-busy", "false")
    assert viewer.evaluate("el => getComputedStyle(el).backgroundColor") != dark
    page.get_by_role("button", name="Change start", exact=True).click()
    expect(viewer.locator(".frame-code-line").first).to_have_attribute("data-line", "100")
    page.get_by_role("button", name="Unsafe source", exact=True).click()
    expect(viewer).to_have_attribute("aria-busy", "false")
    expect(viewer.locator("img,script")).to_have_count(0)
    expect(viewer.locator("code")).to_contain_text('<img src=x onerror="window.codeExecuted=true">')
    assert page.evaluate("window.codeExecuted") is None
    page.get_by_role("button", name="Unknown language", exact=True).click()
    expect(viewer).to_have_attribute("aria-busy", "false")
    expect(viewer.locator("code")).to_have_text("new source")
    page.get_by_role("button", name="Rapid updates", exact=True).click()
    expect(viewer).to_have_attribute("aria-busy", "false")
    expect(viewer.locator("code")).to_have_text("const newest = 2")
    expect(viewer).to_have_attribute("data-theme", "github-dark")
    assert not errors, errors
    browser.close()
    print("Code block browser checks passed: highlighting, line controls, themes, exact copying, safe rendering, unknown languages, rapid updates.")
