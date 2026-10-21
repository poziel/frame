import { describe, expect, test } from "bun:test";
import { createFrame } from "../packages/core/src/frame/createFrame";
import { createWorkspace } from "../packages/core/src/frame/workspace";
import type { WorkspaceNode } from "../packages/core/src/types";

function leaves(node: WorkspaceNode): string[] { return node.type === "pane" ? [node.id] : [...leaves(node.first), ...leaves(node.second)]; }

describe("workspace panes", () => {
  test("splits in all four directions, retaining the original content identity", () => {
    for (const direction of ["left", "right", "up", "down"] as const) {
      const workspace = createWorkspace();
      const original = workspace.panes.value[0];
      const added = workspace.split(direction);
      const root = workspace.root.value;
      expect(root.type).toBe("split");
      if (root.type !== "split") throw new Error("Missing split");
      expect(root.axis).toBe(direction === "left" || direction === "right" ? "x" : "y");
      expect(leaves(root)).toEqual(direction === "left" || direction === "up" ? [added, original!.id] : [original!.id, added]);
      expect(workspace.panes.value[0]).toBe(original);
      expect(workspace.activePane.value).toBe(added);
    }
  });
  test("nested splits resize and collapse without losing surviving pane content", () => {
    const workspace = createWorkspace();
    const second = workspace.split("right");
    const component = { render: () => null };
    workspace.setPane(second, { label: "Preview", component, props: { selected: 5 } });
    const saved = workspace.panes.value.find(pane => pane.id === second);
    const third = workspace.split("down", second);
    expect(leaves(workspace.root.value)).toEqual([workspace.initialPaneId, second, third]);
    const root = workspace.root.value;
    if (root.type !== "split" || root.second.type !== "split") throw new Error("Missing nested split");
    workspace.resize(root.second.id, 2);
    const resized = workspace.root.value;
    if (resized.type !== "split" || resized.second.type !== "split") throw new Error("Missing nested split");
    expect(resized.second.ratio).toBe(.9);
    expect(workspace.close(workspace.initialPaneId)).toBe(true);
    expect(workspace.close(third)).toBe(true);
    expect(workspace.root.value).toEqual({ type: "pane", id: second });
    expect(workspace.panes.value[0]).toBe(saved);
    expect(workspace.close(second)).toBe(false);
    expect(workspace.activePane.value).toBe(second);
    expect(() => workspace.split("right", "missing")).toThrow();
  });
});

describe("nested menu contributions", () => {
  const component = { render: () => null };
  test("nested menus can become activities, return to a collection, and move between regions", async () => {
    const frame = createFrame();
    const remove = frame.registerSidePanel({ id: "group", label: "Group", children: [{ id: "child", label: "Child", component }] });
    const child = frame.getViewChildren("group")[0];
    expect(frame.getViewParent("child")).toBe("group");
    expect(frame.moveView("child", "primary")).toBe(true);
    expect(frame.sidePanels.value.find(view => view.id === "child")).toBe(child);
    expect(frame.getViewChildren("group")).toHaveLength(0);
    expect(frame.getViewCommand("child")).toBe("frame.view.child");
    expect(frame.moveView("child", "primary", undefined, "group")).toBe(true);
    expect(frame.getViewChildren("group")[0]).toBe(child);
    expect(frame.moveView("group", "secondary")).toBe(true);
    expect(frame.viewRegion("child")).toBe("secondary");
    frame.layout.secondarySidebarVisible = false;
    await frame.executeCommand("frame.view.child");
    expect(frame.state.activeSecondaryTab).toBe("group");
    expect(frame.layout.secondarySidebarVisible).toBe(true);
    frame.menuState.collapsed.group = true; frame.menuState.collapsed.child = true;
    frame.openMenu("child");
    expect(frame.menuState.collapsed.group).toBe(false);
    expect(frame.menuState.collapsed.child).toBe(false);
    remove();
    expect(frame.views.value).toHaveLength(0);
    expect(frame.commands.value).toHaveLength(0);
  });
  test("collections reject cycles and plain content rejects nested drops", () => {
    const frame = createFrame();
    frame.registerSidePanel({ id: "outer", label: "Outer", children: [{ id: "inner", label: "Inner", children: [] }] });
    frame.registerBottomTab({ id: "plain", label: "Plain", component });
    expect(frame.moveView("outer", "primary", undefined, "inner")).toBe(false);
    expect(frame.moveView("inner", "primary", undefined, "inner")).toBe(false);
    expect(frame.moveView("inner", "bottom", undefined, "plain")).toBe(false);
    expect(() => frame.registerSidePanel({ id: "invalid", label: "Both", component, children: [] })).toThrow();
    expect(frame.views.value.some(view => view.id === "invalid")).toBe(false);
  });
  test("unregistering a collection rehomes independently registered menus", () => {
    const frame = createFrame();
    const remove = frame.registerSidePanel({ id: "collection", label: "Collection", children: [] });
    frame.registerBottomTab({ id: "independent", label: "Independent", component });
    frame.moveView("independent", "primary", undefined, "collection");
    remove();
    expect(frame.getViewParent("independent")).toBeUndefined();
    expect(frame.sidePanels.value[0]?.id).toBe("independent");
    expect(frame.views.value).toHaveLength(1);
  });
});

test("workspace banner registration, visibility, Zen restoration, and disposal", () => {
  const frame = createFrame();
  const component = { render: () => null };
  expect(frame.layout.bannerVisible).toBe(false);
  const remove = frame.registerWorkspaceBanner({ id: "notice", label: "Notice", component });
  expect(() => frame.registerWorkspaceBanner({ id: "other", label: "Other", component })).toThrow();
  frame.openWorkspaceBanner(); expect(frame.layout.bannerVisible).toBe(true);
  frame.setZenMode(true); expect(frame.layout.bannerVisible).toBe(false);
  frame.setZenMode(false); expect(frame.layout.bannerVisible).toBe(true);
  remove(); expect(frame.workspaceBanner.value).toBeUndefined(); expect(frame.layout.bannerVisible).toBe(false);
  frame.registerWorkspaceBanner({ id: "next", label: "Next", component }); remove();
  expect(frame.workspaceBanner.value?.id).toBe("next");
});


test("nested menu movement honors parent locks and same-parent reordering", () => {
  const frame = createFrame();
  const component = { render: () => null };
  frame.registerMenu({ id: "root", label: "Root", children: [{ id: "fixed", label: "Fixed", component, movable: false }, { id: "next", label: "Next", component }] }, "primary");
  expect(frame.moveView("fixed", "primary")).toBe(false);
  expect(frame.moveView("fixed", "primary", undefined, "root")).toBe(true);
  expect(frame.getViewChildren("root").map(child => child.id)).toEqual(["next", "fixed"]);
  frame.interaction.primary = false;
  expect(frame.moveView("next", "bottom")).toBe(false);
});
