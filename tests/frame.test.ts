import { describe, expect, test } from "bun:test";
import { createFrame } from "../packages/core/src/frame/createFrame";
const component = { render: () => null };

describe("Frame contributions", () => {
  test("isolates shells and rejects duplicate command IDs", () => {
    const first = createFrame();
    const second = createFrame();
    first.registerCommand({ id: "app.action", label: "Action", run() {} });
    expect(second.commands.get("app.action")).toBeUndefined();
    expect(() => first.registerCommand({ id: "app.action", label: "Duplicate", run() {} })).toThrow();
  });
  test("a stale disposer cannot remove a newer contribution with the same ID", () => {
    const frame = createFrame();
    const remove = frame.registerCommand({ id: "app.action", label: "Original", run() {} });
    remove();
    frame.registerCommand({ id: "app.action", label: "Replacement", run() {} });
    remove();
    expect(frame.commands.get("app.action")?.label).toBe("Replacement");
  });
  test("removing selected contributions leaves valid panel selections", () => {
    const frame = createFrame();
    frame.registerSidePanel({ id: "one", label: "One", component });
    const removeSide = frame.registerSidePanel({ id: "two", label: "Two", component });
    frame.openSidePanel("two");
    removeSide();
    expect(frame.state.sidebarVisible).toBe(true);
    expect(frame.state.activeSidePanel).toBe("one");
    expect(frame.state.sidebarVisible).toBe(true);
    frame.registerBottomTab({ id: "tab.one", label: "One", component });
    const removeTab = frame.registerBottomTab({ id: "tab.two", label: "Two", component });
    frame.openBottomPanel("tab.two");
    removeTab();
    expect(frame.state.activeBottomTab).toBe("tab.one");
    expect(frame.state.panelVisible).toBe(true);
  });
  test("disabled commands do not run, and async failures reach the session log", async () => {
    const frame = createFrame();
    let calls = 0;
    frame.registerCommand({ id: "disabled", label: "Disabled", enabled: () => false, run() { calls++; } });
    await frame.executeCommand("disabled");
    expect(calls).toBe(0);
    frame.registerCommand({ id: "failure", label: "Failure", async run() { throw new Error("Test failure"); } });
    await frame.executeCommand("failure");
    expect(frame.state.entries.at(-1)?.message).toContain("Test failure");
  });
  test("quick picks preserve caller data and settle when replaced or disposed", async () => {
    const frame = createFrame();
    const item = { id: "choice", label: "Choose", value: 42 };
    const pick = frame.showQuickPick([item]);
    frame.acceptQuickInput("choice");
    expect(await pick).toBe(item);
    const cancelled = frame.showQuickPick([item]);
    frame.openCommands();
    expect(await cancelled).toBeUndefined();
    const disposed = frame.showQuickPick([item]);
    frame.dispose();
    expect(await disposed).toBeUndefined();
  });
  test("disabled and unknown quick-pick choices cannot complete a picker", async () => {
    const frame = createFrame();
    const pick = frame.showQuickPick([{ id: "disabled", label: "Disabled", disabled: true }]);
    frame.acceptQuickInput("disabled");
    expect(frame.quickInput.value).not.toBeNull();
    frame.acceptQuickInput("missing");
    expect(frame.quickInput.value).not.toBeNull();
    frame.closeQuickInput();
    expect(await pick).toBeUndefined();
  });
  test("commands registered while quick input is open appear without reopening", () => {
    const frame = createFrame();
    frame.openCommands();
    const remove = frame.registerCommand({ id: "late", label: "Late action", scope: "frame", run() {} });
    expect(frame.quickInputItems.value.map(item => item.id)).toContain("late");
    remove();
    expect(frame.quickInputItems.value.some(item => item.id === "late")).toBe(false);
  });
});

test("panel contributions automatically add and remove searchable actions", async () => {
  const frame = createFrame();
  const removeSide = frame.registerSidePanel({ id: "app.side", label: "App side", component });
  const removeTab = frame.registerBottomTab({ id: "app.tab", label: "App output", component });
  await frame.executeCommand("frame.side.app.side");
  expect(frame.state.activeSidePanel).toBe("app.side");
  expect(frame.state.sidebarVisible).toBe(true);
  await frame.executeCommand("frame.tab.app.tab");
  expect(frame.state.activeBottomTab).toBe("app.tab");
  expect(frame.state.panelVisible).toBe(true);
  removeSide(); removeTab();
  expect(frame.commands.get("frame.side.app.side")).toBeUndefined();
  expect(frame.commands.get("frame.tab.app.tab")).toBeUndefined();
  expect(frame.bottomTabs.value).toHaveLength(0);
  expect(frame.state.panelVisible).toBe(true);
});

test("each quick-input request has a distinct identity even with the same title", () => {
  const frame = createFrame();
  frame.openCommands();
  const first = frame.quickInput.value?.id;
  frame.openCommands();
  expect(frame.quickInput.value?.id).not.toBe(first);
  frame.closeQuickInput();
});


test("views reorder, travel between regions, and retain identity and commands", async () => {
  const frame = createFrame();
  const remove = frame.registerSidePanel({ id: "a", label: "A", component });
  frame.registerSidePanel({ id: "b", label: "B", component });
  const original = frame.sidePanels.value[0];
  expect(frame.moveView("b", "primary", "a")).toBe(true);
  expect(frame.sidePanels.value.map(view => view.id)).toEqual(["b", "a"]);
  expect(frame.moveView("a", "secondary")).toBe(true);
  expect(frame.secondaryTabs.value[0]).toBe(original);
  expect(frame.state.activeSidePanel).toBe("b");
  expect(frame.state.activeSecondaryTab).toBe("a");
  frame.layout.secondarySidebarVisible = false;
  await frame.executeCommand("frame.side.a");
  expect(frame.layout.secondarySidebarVisible).toBe(true);
  remove(); remove();
  expect(frame.secondaryTabs.value).toHaveLength(0);
  expect(frame.commands.value.some(command => command.id === "frame.side.a")).toBe(false);
});

test("drag policies and globally unique view IDs protect host contributions", () => {
  const frame = createFrame();
  frame.registerSidePanel({ id: "locked", label: "Locked", component, movable: false });
  frame.registerBottomTab({ id: "fixed", label: "Fixed", component, draggable: false });
  expect(frame.moveView("locked", "bottom")).toBe(false);
  expect(frame.moveView("fixed", "secondary")).toBe(false);
  expect(() => frame.registerSecondaryTab({ id: "fixed", label: "Duplicate", component })).toThrow();
  frame.interaction.dragging = false;
  expect(frame.moveView("locked", "primary")).toBe(false);
  frame.interaction.dragging = true; frame.interaction.primary = false;
  expect(frame.moveView("locked", "primary")).toBe(false);
});

test("toolbar actions are isolated, opt-in, and dispose safely", () => {
  const frame = createFrame();
  const remove = frame.registerToolbarAction({ id: "save", label: "Save", run() {} });
  expect(frame.toolbarActions[0]?.visible).toBe(false);
  frame.toolbarActions[0]!.visible = true;
  expect(() => frame.registerToolbarAction({ id: "save", label: "Save", run() {} })).toThrow();
  remove(); frame.registerToolbarAction({ id: "save", label: "New", run() {} }); remove();
  expect(frame.toolbarActions[0]?.label).toBe("New");
  frame.dispose(); expect(frame.toolbarActions).toHaveLength(0);
});
