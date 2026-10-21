import { describe, expect, test } from "bun:test";
import { defaultLayout, layoutGeometry, panelCoverage } from "../packages/core/src/frame/layout";
import { createFrame } from "../packages/core/src/frame/createFrame";

describe("layout arrangements", () => {
  test("each alignment covers the correct physical edges", () => {
    expect(panelCoverage("left")).toEqual({ left: true, right: false });
    expect(panelCoverage("right")).toEqual({ left: false, right: true });
    expect(panelCoverage("center")).toEqual({ left: false, right: false });
    expect(panelCoverage("justify")).toEqual({ left: true, right: true });
    for (const primarySide of ["left", "right"] as const) {
      for (const panelAlignment of ["left", "right", "center", "justify"] as const) {
        const layout = { ...defaultLayout(), primarySide, panelAlignment, primarySidebarVisible: true, secondarySidebarVisible: true, panelVisible: true };
        const geometry = layoutGeometry(layout, 1200, 800);
        expect(geometry.underPrimary).toBe(panelCoverage(panelAlignment)[primarySide]);
        expect(geometry.underSecondary).toBe(panelCoverage(panelAlignment)[primarySide === "left" ? "right" : "left"]);
      }
    }
  });
  test("small windows retain canvas space without destroying preferred sizes", () => {
    const layout = { ...defaultLayout(), primarySidebarVisible: true, secondarySidebarVisible: true, primaryWidth: 800, secondaryWidth: 600 };
    expect(layoutGeometry(layout, 360, 300).narrow).toBe(true);
    expect(layoutGeometry(layout, 360, 300).center).toBeGreaterThan(200);
    expect(layoutGeometry(layout, 900, 700).center).toBeGreaterThanOrEqual(240);
    expect(layout.primaryWidth).toBe(800);
    expect(layout.secondaryWidth).toBe(600);
  });
  test("compact density removes gaps but retains track placement", () => {
    const geometry = layoutGeometry({ ...defaultLayout(), density: "compact", primarySidebarVisible: true, panelVisible: true }, 1200, 800);
    expect(geometry.gap).toBe(0);
    expect(geometry.leftGap).toBe(0);
    expect(geometry.panelColumn).toBe("3 / 4");
  });
  test("Zen restores visibility and permits independent centered layout changes", () => {
    const frame = createFrame();
    frame.layout.primarySidebarVisible = true;
    frame.layout.panelVisible = true;
    frame.setZenMode(true);
    expect(frame.layout.centered).toBe(true);
    expect(frame.state.sidebarVisible).toBe(false);
    expect(frame.state.panelVisible).toBe(false);
    frame.layout.centered = false;
    expect(frame.layout.zenMode).toBe(true);
    frame.setZenMode(false);
    expect(frame.state.sidebarVisible).toBe(true);
    expect(frame.state.panelVisible).toBe(true);
    expect(frame.layout.centered).toBe(false);
  });
  test("secondary tabs register commands, select, and remove cleanly", async () => {
    const frame = createFrame();
    const remove = frame.registerSecondaryTab({ id: "app.secondary", label: "Details", component: { render: () => null } });
    await frame.executeCommand("frame.secondary.app.secondary");
    expect(frame.state.activeSecondaryTab).toBe("app.secondary");
    expect(frame.layout.secondarySidebarVisible).toBe(true);
    remove();
    expect(frame.layout.secondarySidebarVisible).toBe(true);
    expect(frame.commands.value).toHaveLength(0);
  });
});


test("banner alignment covers physical edges independently of bottom alignment", () => {
  for (const primarySide of ["left", "right"] as const) for (const bannerAlignment of ["left", "right", "center", "justify"] as const) {
    const layout = { ...defaultLayout(), primarySide, bannerAlignment, bannerVisible: true, panelVisible: true, panelAlignment: "center" as const };
    const geometry = layoutGeometry(layout, 1200, 700);
    expect(geometry.abovePrimary).toBe(panelCoverage(bannerAlignment)[primarySide]);
    expect(geometry.aboveSecondary).toBe(panelCoverage(bannerAlignment)[primarySide === "left" ? "right" : "left"]);
    expect(geometry.underPrimary).toBe(false);
    expect(geometry.underSecondary).toBe(false);
    expect(geometry.banner + geometry.panel).toBeLessThan(700 - 120);
  }
});
