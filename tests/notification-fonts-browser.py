"""Notifications must inherit the same typography as their workbench."""
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 820})
    page.goto("http://localhost:1420/")
    toast = page.locator(".frame-notifications strong").first
    expect(toast).to_be_visible()
    family = page.locator(".workbench").evaluate("el => getComputedStyle(el).fontFamily")
    assert toast.evaluate("el => getComputedStyle(el).fontFamily") == family
    page.locator(".notification-toggle").click()
    panel = page.locator(".notification-center")
    expect(panel).to_be_visible()
    for selector in ["h2", ".notification-title"]:
        assert panel.locator(selector).first.evaluate("el => getComputedStyle(el).fontFamily") == family
    assert panel.evaluate("el => getComputedStyle(el).fontSize") == "12px"
    browser.close()
    print("Notification typography browser checks passed")
