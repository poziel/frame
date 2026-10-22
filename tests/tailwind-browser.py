"""Run after bun run check:tailwind; serves the compiled consumer on a free port."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent / ".tmp/tailwind-consumer"
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"http://127.0.0.1:{server.server_port}")
        page.wait_for_selector("#portal button")
        assert not errors, errors
        page.locator("#portal button").click()
        page.wait_for_selector("[role=dialog]", timeout=5000)
        def styles(selector):
            return page.locator(selector).evaluate("el => { const s = getComputedStyle(el); return [s.backgroundColor, s.paddingTop, s.borderRadius, s.fontFamily, s.fontSize, s.boxShadow, s.transitionDuration, s.transitionTimingFunction] }")
        defaults = styles("#sample")
        assert defaults[:3] == ["rgb(24, 24, 24)", "12px", "3px"], defaults
        assert page.locator("#ordinary").evaluate("el => getComputedStyle(el).display") == "flex"
        assert page.locator("#ordinary").evaluate("el => getComputedStyle(el).paddingTop") == "16px"
        assert page.locator("#native").evaluate("el => getComputedStyle(el).borderTopStyle") != "none"
        page.evaluate("document.documentElement.dataset.theme = 'custom'")
        page.wait_for_function("getComputedStyle(document.querySelector('#sample')).paddingTop === '24px'")
        custom = styles("#sample")
        assert custom[:5] == ["rgb(18, 52, 86)", "24px", "13px", "monospace", "18px"], custom
        assert custom[5].endswith("rgb(0, 0, 0) 0px 1px 2px 0px"), custom
        assert custom[6:] == ["0.25s", "linear"], custom
        assert styles("[role=dialog]")[:4] == custom[:4]
        page.evaluate("document.documentElement.dataset.theme = 'another'")
        page.wait_for_function("getComputedStyle(document.querySelector('#sample')).paddingTop === '12px'")
        assert styles("#sample") == defaults
        assert not errors, errors
        browser.close()
        print("Tailwind consumer verified: utilities, runtime tokens, Reka portal, theme replacement, no Preflight reset.")
finally:
    server.shutdown()
    server.server_close()
