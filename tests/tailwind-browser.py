"""Run after bun run check:tailwind; serves the compiled consumer on a free port."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
import re

def contrast_ratio(foreground, background, base):
    def rgba(css):
        channels = [float(value) for value in re.findall(r"[\d.]+", css)]
        return channels[:3] + [channels[3] if len(channels) > 3 else 1]
    fg, bg, behind = rgba(foreground), rgba(background), rgba(base)
    bg_rgb = [bg[i] * bg[3] + behind[i] * (1 - bg[3]) for i in range(3)]
    fg_rgb = [fg[i] * fg[3] + bg_rgb[i] * (1 - fg[3]) for i in range(3)]
    def luminance(rgb):
        values = [value / 255 for value in rgb]
        values = [value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4 for value in values]
        return sum(a * b for a, b in zip(values, [.2126, .7152, .0722]))
    a, b = luminance(fg_rgb), luminance(bg_rgb)
    return (max(a, b) + .05) / (min(a, b) + .05)

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
        assert defaults[:3] == ["rgb(24, 24, 24)", "12px", "4px"], defaults
        assert page.locator("#ordinary").evaluate("el => getComputedStyle(el).display") == "flex"
        assert page.locator("#ordinary").evaluate("el => getComputedStyle(el).paddingTop") == "16px"
        scale_defaults = styles("#scales")
        assert scale_defaults[:3] == ["rgb(24, 24, 24)", "16px", "4px"], scale_defaults
        assert scale_defaults[4] == "11px", scale_defaults
        assert page.locator("#native").evaluate("el => getComputedStyle(el).borderTopStyle") != "none"
        page.evaluate("document.documentElement.dataset.theme = 'custom'")
        page.wait_for_function("getComputedStyle(document.querySelector('#sample')).paddingTop === '24px'")
        custom = styles("#sample")
        assert custom[:5] == ["rgb(18, 52, 86)", "24px", "13px", "monospace", "18px"], custom
        assert custom[5].endswith("rgb(0, 0, 0) 0px 1px 2px 0px"), custom
        assert custom[6:] == ["0.25s", "linear"], custom
        assert styles("[role=dialog]")[:4] == custom[:4]
        scale_custom = styles("#scales")
        assert scale_custom[:5] == ["rgb(18, 52, 86)", "24px", "9px", "monospace", "15px"], scale_custom
        assert page.locator("#ordinary").evaluate("el => getComputedStyle(el).gap") == "24px"
        assert page.locator("#scales").evaluate("el => [getComputedStyle(el).lineHeight, getComputedStyle(el).fontWeight, getComputedStyle(el).letterSpacing]") == ["30px", "650", "1.5px"]
        assert scale_custom[5].endswith("rgb(0, 0, 0) 0px 3px 9px 0px"), scale_custom
        assert scale_custom[6:] == ["0.25s", "linear"], scale_custom
        assert page.locator("#leading").evaluate("el => getComputedStyle(el).fontFamily") == "monospace"
        leading = page.locator("#leading").evaluate("el => [getComputedStyle(el).lineHeight, getComputedStyle(el).fontSize, getComputedStyle(el).getPropertyValue('--frame-leading-relaxed')]")
        assert float(leading[0][:-2]) == 2 * float(leading[1][:-2]), leading
        page.evaluate("document.documentElement.dataset.theme = 'another'")
        page.wait_for_function("getComputedStyle(document.querySelector('#sample')).paddingTop === '12px'")
        assert styles("#sample") == defaults
        assert styles("#scales") == scale_defaults
        assert styles("#stock")[0] == "rgba(0, 0, 0, 0)"
        page.keyboard.press("Escape")
        page.wait_for_selector("#first-sample")
        assert styles("#first-sample")[:3] == ["rgb(17, 34, 51)", "20px", "4px"]
        assert styles("#second-sample")[:3] == ["rgb(68, 85, 102)", "28px", "4px"]
        assert styles("#standalone-sample")[:3] == ["rgb(119, 136, 153)", "32px", "4px"]
        page.get_by_role("button", name="Open first", exact=True).click()
        page.wait_for_selector("#first-portal-sample")
        assert styles("#first-portal-sample")[:5] == styles("#first-sample")[:5]
        assert page.locator("#first-portal-sample").evaluate("el => !!el.closest('.frame-overlay-host')")
        cdp = page.context.new_cdp_session(page)
        cdp.send("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-reduced-transparency", "value": "reduce"}]})
        assert page.locator("#first-portal-sample").evaluate("el => getComputedStyle(el.closest('.frame-overlay-host')).getPropertyValue('--frame-overlay-background').trim()") == "#112233"
        assert page.locator("#first-portal-sample").evaluate("el => getComputedStyle(el.closest('.frame-overlay-host')).getPropertyValue('--frame-overlay-backdrop-filter').trim()") == "none"
        cdp.send("Emulation.setEmulatedMedia", {"features": []})
        assert page.locator("#first-control").evaluate("el => getComputedStyle(el).paddingLeft") == "12.5px"
        imported = {"version": 1, "id": "imported", "name": "Imported", "appearance": "light", "tokens": {"--frame-surface": "#abcdef", "--frame-spacing-unit": "9px", "--frame-font-size-body": "16px"}}
        import json
        page.evaluate("json => window.themeFixture.setFirst(json)", json.dumps(imported))
        assert styles("#first-sample")[:3] == ["rgb(171, 205, 239)", "36px", "4px"]
        assert styles("#first-portal-sample")[:5] == styles("#first-sample")[:5]
        assert page.locator("#first-portal-sample").evaluate("el => getComputedStyle(el).colorScheme") == "light"
        assert styles("#second-sample")[1] == "28px"
        page.keyboard.press("Escape")
        page.evaluate("window.themeFixture.hide()")
        page.wait_for_selector("#first-sample", state="detached")
        page.evaluate("window.themeFixture.show()")
        page.wait_for_selector("#first-sample")
        assert styles("#first-sample")[1] == "36px"
        page.evaluate("window.themeFixture.first.theme.reset()")
        assert styles("#first-sample")[:3] == ["rgb(24, 24, 24)", "16px", "4px"]
        page.evaluate("document.documentElement.dataset.theme = 'custom'")
        assert styles("#first-sample")[:3] == ["rgb(18, 52, 86)", "24px", "9px"]
        assert styles("#second-sample")[:3] == ["rgb(68, 85, 102)", "28px", "4px"]
        page.evaluate("window.themeFixture.detach()")
        assert styles("#standalone-sample")[1] == "24px"
        page.evaluate("window.themeFixture.dispose()")
        assert page.locator(".frame-overlay-host").count() == 0
        page.goto(f"http://127.0.0.1:{server.server_port}/additive.html")
        assert page.locator("#host-palette").evaluate("el => [getComputedStyle(el).paddingTop, getComputedStyle(el).borderRadius, getComputedStyle(el).backgroundColor]") == ["20px", "9px", "oklch(0.637 0.237 25.331)"]
        assert page.locator("#host-override").evaluate("el => getComputedStyle(el).backgroundColor") == "rgb(171, 205, 239)"
        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(f"http://127.0.0.1:{server.server_port}/light-2026.html")
        page.wait_for_selector("#preset-primary")
        def palette(selector):
            return page.locator(selector).first.evaluate("el => { const s = getComputedStyle(el); return [s.backgroundColor, s.color] }")
        assert palette(".titlebar")[0] == "rgb(250, 250, 253)"
        assert palette(".side-panel")[0] == "rgb(250, 250, 253)"
        assert palette("#preset-workspace") == ["rgb(255, 255, 255)", "rgb(32, 32, 32)"]
        assert palette("#preset-tailwind") == ["rgb(250, 250, 253)", "rgb(32, 32, 32)"]
        assert palette("#preset-catalog button[aria-current=page]")[1] == "rgb(32, 32, 32)"
        assert palette("#preset-primary") == ["rgb(0, 105, 204)", "rgb(255, 255, 255)"]
        assert palette("#preset-secondary") == ["rgb(234, 234, 234)", "rgb(32, 32, 32)"]
        assert palette(".status-bar") == ["rgb(250, 250, 253)", "rgb(96, 96, 96)"]
        assert palette(".view-bar .rail-button.selected") == ["rgb(214, 214, 214)", "rgb(32, 32, 32)"]
        output = Path(__file__).resolve().parent.parent / ".ai-workspace/themes"
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(output / "vscode-light-2026.png"), full_page=True)
        page.get_by_role("button", name="Preview popup", exact=True).click()
        page.wait_for_selector("#preset-portal")
        assert page.locator("#preset-portal").evaluate("el => !!el.closest('.frame-overlay-host')")
        assert palette(".frame-general-popup") == ["rgb(250, 250, 253)", "rgb(32, 32, 32)"]
        assert page.locator(".frame-general-popup").evaluate("el => getComputedStyle(el).boxShadow") == "none"
        page.keyboard.press("Escape")
        page.evaluate("window.lightThemeFixture.frame.theme.reset()")
        assert palette(".titlebar")[0] == "rgb(24, 24, 24)"
        page.evaluate("window.lightThemeFixture.importJSON()")
        assert palette(".titlebar")[0] == "rgb(250, 250, 253)"
        # Use the actual select UI as well as host API calls.
        page.get_by_role("combobox", name="Theme preset", exact=True).click()
        page.get_by_role("option", name="Frame default", exact=True).click()
        assert palette(".titlebar")[0] == "rgb(24, 24, 24)"
        page.get_by_role("combobox", name="Theme preset", exact=True).click()
        page.get_by_role("option", name="VS Code Light 2026", exact=True).click()
        assert palette(".titlebar")[0] == "rgb(250, 250, 253)"
        for suffix, expected_bg, expected_fg in [("black", "rgb(0, 0, 0)", "rgb(255, 255, 255)"), ("white", "rgb(255, 255, 255)", "rgb(41, 41, 41)")]:
            name = f"VS Code High Contrast {suffix.title()}"
            page.get_by_role("combobox", name="Theme preset", exact=True).click()
            page.get_by_role("option", name=name, exact=True).click()
            assert palette(".titlebar")[0] == expected_bg
            assert palette("#preset-workspace") == [expected_bg, expected_fg]
            selected = "#preset-catalog button[aria-current=page]"
            background, foreground = palette(selected)
            assert contrast_ratio(foreground, background, expected_bg) >= 7
            outline = page.locator(selected).evaluate("el => getComputedStyle(el).outlineColor")
            assert contrast_ratio(outline, background, expected_bg) >= 3
            background, foreground = palette("#preset-primary")
            assert contrast_ratio(foreground, background, expected_bg) >= 7
            border = page.locator("#preset-primary").evaluate("el => getComputedStyle(el).borderTopColor")
            assert max(contrast_ratio(border, expected_bg, expected_bg), contrast_ratio(background, expected_bg, expected_bg)) >= 3
            page.locator("#preset-input").focus()
            focus = page.locator("#preset-input").evaluate("el => [getComputedStyle(el).outlineColor, getComputedStyle(el).outlineStyle]")
            assert focus[1] != "none"
            assert contrast_ratio(focus[0], expected_bg, expected_bg) >= 3
            page.get_by_role("button", name="Preview popup", exact=True).click()
            page.wait_for_selector("#preset-portal")
            assert palette(".frame-general-popup") == [expected_bg, expected_fg]
            assert page.locator("#preset-portal").evaluate("el => !!el.closest('.frame-overlay-host')")
            page.keyboard.press("Escape")
            page.get_by_role("combobox", name="Theme preset", exact=True).click()
            highlighted = page.locator("[role=option][data-highlighted]").first
            background, foreground = highlighted.evaluate("el => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]")
            assert contrast_ratio(foreground, background, expected_bg) >= 7
            page.keyboard.press("Escape")
            page.evaluate("() => { window.lightThemeFixture.frame.showQuickPick([{ id: 'contrast-check', label: 'Selected command', detail: 'Readable selected description', shortcut: 'Ctrl+K' }]); }")
            page.wait_for_selector(".palette .command-result.active small")
            background, foreground = palette(".palette .command-result.active")
            detail_color = page.locator(".palette .command-result.active small").evaluate("el => getComputedStyle(el).color")
            assert contrast_ratio(detail_color, background, expected_bg) >= 7
            page.keyboard.press("Escape")
            page.mouse.move(800, 700)
            page.screenshot(path=str(output / f"vscode-high-contrast-{suffix}.png"), full_page=True)
            page.evaluate("window.lightThemeFixture.frame.theme.reset()")
            page.evaluate("id => window.lightThemeFixture.importJSON(id)", f"vscode-high-contrast-{suffix}")
            assert palette(".titlebar")[0] == expected_bg
        page.evaluate("window.lightThemeFixture.dispose()")
        assert page.locator(".frame-overlay-host").count() == 0
        assert not errors, errors
        browser.close()
        print("Tailwind verified: scales, imports, isolation, portals, cleanup; Light 2026 selected-row regression; High Contrast Black/White text, button, focus, quick-input and popup checks; raw JSON and UI switching. Previews: .ai-workspace/themes/.")
finally:
    server.shutdown()
    server.server_close()
