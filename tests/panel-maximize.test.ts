import { expect, test } from "bun:test";
import { defaultLayout, layoutGeometry, maximizedRegionBounds } from "../packages/core/src/frame/layout";
import { createFrame } from "../packages/core/src/frame/createFrame";

test("maximized panel coverage follows alignment and preserves the activity rail on either side", () => {
  for (const primarySide of ["left", "right"] as const) for (const panelAlignment of ["left", "right", "center", "justify"] as const) {
    const layout = { ...defaultLayout(), primarySide, panelAlignment, primarySidebarVisible: true, secondarySidebarVisible: true, panelVisible: true, maximizedRegion: "bottom" as const };
    const g = layoutGeometry(layout, 1280, 800);
    const bounds = maximizedRegionBounds(layout, 1280, 800)!;
    expect(bounds.top).toBe(0); expect(bounds.height).toBe(800);
    expect(bounds.primary).toBe(panelAlignment === "left" || panelAlignment === "justify");
    expect(bounds.secondary).toBe(panelAlignment === "right" || panelAlignment === "justify");
    expect(primarySide === "left" ? bounds.left : bounds.right).toBeGreaterThanOrEqual(g.rail);
    expect(layout.panelHeight).toBe(240);
  }
});
test("secondary maximizes across all regions, and disabling the activity bar removes its reserved space", () => {
  const layout = { ...defaultLayout(), maximizedRegion: "secondary" as const, secondarySidebarVisible: true };
  expect(maximizedRegionBounds(layout, 1000, 800)?.width).toBe(954);
  layout.activityBarVisible = false;
  expect(maximizedRegionBounds(layout, 1000, 800)?.width).toBe(1000);
  layout.secondarySidebarVisible = false;
  expect(maximizedRegionBounds(layout, 1000, 800)).toBeUndefined();
});
test("closing or resetting a maximized region clears maximize without changing preferred sizes", () => {
  const frame = createFrame();
  frame.layout.panelVisible = true; frame.layout.maximizedRegion = "bottom";
  frame.closeBottomPanel(); expect(frame.layout.maximizedRegion).toBeNull();
  frame.layout.secondarySidebarVisible = true; frame.layout.maximizedRegion = "secondary";
  frame.layout.secondarySidebarVisible = false; expect(frame.layout.maximizedRegion).toBeNull();
  expect(frame.layout.panelHeight).toBe(240); expect(frame.layout.secondaryWidth).toBe(280);
  frame.layout.maximizedRegion = "bottom"; frame.resetLayout();
  expect(frame.layout.maximizedRegion).toBeNull();
  frame.dispose();
});
