import json
from pathlib import Path
import argparse
import os
import subprocess
import time
import urllib.request
from contextlib import contextmanager

parser = argparse.ArgumentParser()
parser.add_argument("--consumer", required=True)
parser.add_argument("--output", required=True)
args = parser.parse_args()
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)

@contextmanager
def consumer_server():
    with (output / "external-consumer-server.log").open("w") as log:
        process = subprocess.Popen(
            ["bun", "run", "preview"], cwd=args.consumer, stdout=log, stderr=log,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        try:
            for _ in range(100):
                if process.poll() is not None:
                    raise RuntimeError("Consumer server exited; see external-consumer-server.log")
                try:
                    urllib.request.urlopen("http://127.0.0.1:1437", timeout=0.2).close()
                    break
                except OSError:
                    time.sleep(0.1)
            else:
                raise RuntimeError("Consumer server did not become ready")
            yield
        finally:
            if os.name == "nt":
                subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], capture_output=True)
            else:
                process.terminate()
            process.wait()
from playwright.sync_api import sync_playwright, expect

checks = []
errors = []
with consumer_server(), sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1180, "height": 780})
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.goto("http://127.0.0.1:1437")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_test_id("consumer-sidebar")).to_have_text("Host navigation: shared Frame instance")
    expect(page.get_by_test_id("consumer-output")).to_have_text("Host output view")
    checks.append("host sidebar/bottom view registration and useFrame injection")
    expect(page.get_by_text("Sample tools", exact=True)).to_have_count(0)
    expect(page.get_by_text("Components", exact=True)).to_have_count(0)
    checks.append("no example app contributions")
    page.get_by_role("textbox", name="Project name", exact=True).fill("Package integration")
    expect(page.get_by_test_id("consumer-name")).to_have_text("Package integration")
    page.get_by_role("button", name="Increment", exact=True).click()
    expect(page.get_by_test_id("consumer-count")).to_have_text("Counter: 1")
    page.keyboard.press("Control+Alt+i")
    expect(page.get_by_test_id("consumer-count")).to_have_text("Counter: 2")
    checks.append("Frame input binding, button action and host keyboard command")
    page.get_by_role("button", name="Open quick actions").click()
    page.get_by_role("combobox").fill("Consumer: Increment counter")
    page.get_by_role("combobox").press("Enter")
    expect(page.get_by_test_id("consumer-count")).to_have_text("Counter: 3")
    checks.append("host command discoverable and executable in Quick actions")
    page.get_by_role("button", name="Open host dialog").click()
    expect(page.get_by_text("External modal content", exact=True)).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.get_by_text("External modal content", exact=True)).to_have_count(0)
    checks.append("host modal opens and dismisses")
    page.get_by_role("button", name="Open host settings").click()
    expect(page.get_by_role("heading", name="Host preferences", exact=True)).to_be_visible()
    page.keyboard.press("Escape")
    checks.append("host settings section")
    page.get_by_role("button", name="Notify", exact=True).click()
    expect(page.get_by_text("Host notification", exact=True)).to_be_visible()
    page.get_by_role("button", name="Dismiss notification: Host notification", exact=True).click()
    expect(page.get_by_text("Host notification", exact=True)).to_have_count(0)
    checks.append("host transient notification and dismissal")
    page.keyboard.press("Escape")
    for action in ["Minimize window", "Maximize window", "Close window"]:
        expect(page.get_by_role("button", name=action, exact=True)).to_be_disabled()
    checks.append("native-only window buttons disabled in browser")
    background = page.locator(".workbench").evaluate("(el) => getComputedStyle(el).backgroundColor")
    assert background != "rgba(0, 0, 0, 0)", background
    expect(page.locator(".frame-button.primary")).to_have_css("background-color", "rgb(0, 120, 212)")
    page.wait_for_function("Array.from(document.querySelectorAll('.app-mark img')).every(img => img.complete && img.naturalWidth > 0)")
    assert page.locator(".consumer-workspace svg").count() > 0
    checks.append("package CSS, bundled brand image and icon render")
    page.keyboard.press("Control+b")
    expect(page.get_by_test_id("consumer-sidebar")).not_to_be_visible()
    page.keyboard.press("Control+b")
    expect(page.get_by_test_id("consumer-sidebar")).to_be_visible()
    page.set_viewport_size({"width": 600, "height": 700})
    expect(page.get_by_role("button", name="Increment", exact=True)).to_be_visible()
    page.set_viewport_size({"width": 1180, "height": 780})
    checks.append("sidebar keyboard toggle and narrow viewport")

    page.screenshot(path=str(output / "external-consumer-browser.png"), full_page=True)
    browser.close()
assert not errors, errors
report = json.dumps({"ok": True, "checks": checks, "errors": errors}, indent=2)
(output / "external-consumer-browser.json").write_text(report, encoding="utf-8")
print(report)
