import { expect, test } from "bun:test";
import { fitModal, initialModal, resizeModal } from "../packages/core/src/frame/modal";
import { createFrame } from "../packages/core/src/frame/createFrame";
const bounds = { x: 6, y: 40, width: 1188, height: 690 };
test("modal geometry stays within the workbench and fits small windows", () => {
  const box = initialModal(bounds, 800, 500);
  expect(box).toEqual({ x: 200, y: 135, width: 800, height: 500 });
  expect(fitModal({ ...box, x: -100, y: 900 }, bounds)).toEqual({ ...box, x: 6, y: 230 });
  expect(fitModal(box, { x: 6, y: 40, width: 240, height: 140 })).toEqual({ x: 6, y: 40, width: 240, height: 140 });
});
test("modal resize anchors the opposite corner and respects minimum size", () => {
  const box = { x: 200, y: 100, width: 600, height: 400 };
  expect(resizeModal(box, "nw", 100, 50, bounds)).toEqual({ x: 300, y: 150, width: 500, height: 350 });
  expect(resizeModal(box, "nw", 1000, 1000, bounds)).toEqual({ x: 480, y: 340, width: 320, height: 160 });
  expect(resizeModal(box, "se", 1000, 1000, bounds)).toEqual({ x: 200, y: 100, width: 994, height: 630 });
});
test("modal stack supports nested actions, existing-instance activation, and stale handles", () => {
  const frame = createFrame(); const component = { render: () => null };
  const first = frame.openModal({ id: "properties", title: "Properties", component });
  const definition = frame.modals[0];
  frame.openModal({ id: "advanced", title: "Advanced", component });
  frame.closeModal(); expect(frame.modals[0]).toBe(definition);
  frame.openModal({ id: "advanced", title: "Advanced", component });
  frame.openModal({ id: "properties", title: "Ignore replacement", component });
  expect(frame.modals[1]).toBe(definition);
  first.close(); expect(frame.modals.map(modal => modal.id)).toEqual(["advanced"]);
  frame.openModal({ id: "properties", title: "New", component }); first.close();
  expect(frame.modals[1]?.title).toBe("New");
  frame.dispose(); expect(frame.modals).toHaveLength(0);
});
test("empty view regions can be opened and remain visible when their last view moves", () => {
  const frame = createFrame(); const component = { render: () => null };
  frame.toggleSidePanel(); frame.toggleSecondaryPanel(); frame.toggleBottomPanel();
  expect(frame.layout.primarySidebarVisible).toBe(true); expect(frame.layout.secondarySidebarVisible).toBe(true); expect(frame.layout.panelVisible).toBe(true);
  frame.registerView({ id: "only", label: "Only", component }, "primary");
  frame.moveView("only", "bottom");
  expect(frame.sidePanels.value).toHaveLength(0); expect(frame.layout.primarySidebarVisible).toBe(true);
});


test("unregistering the last view leaves its open region available for a drop", () => {
  const frame = createFrame(); const component = { render: () => null };
  const removePrimary = frame.registerView({ id: "p", label: "Primary", component }, "primary");
  const removeSecondary = frame.registerView({ id: "s", label: "Secondary", component }, "secondary");
  const removeBottom = frame.registerView({ id: "b", label: "Bottom", component }, "bottom");
  frame.openView("p"); frame.openView("s"); frame.openView("b");
  removePrimary(); removeSecondary(); removeBottom();
  expect(frame.views.value).toHaveLength(0);
  expect(frame.layout.primarySidebarVisible).toBe(true); expect(frame.layout.secondarySidebarVisible).toBe(true); expect(frame.layout.panelVisible).toBe(true);
});
