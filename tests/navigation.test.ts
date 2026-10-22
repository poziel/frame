import { describe, expect, test } from "bun:test";
import { createFrame } from "../packages/core/src/frame/createFrame";
const component = { template: "<div/>" };
describe("application navigation", () => {
  test("related region changes form one destination and duplicate props keep the forward path", () => {
    const frame = createFrame({ navigation: true });
    const id = frame.workspace.initialPaneId;
    frame.registerView({ id: "one", label: "One", component }, "primary");
    frame.navigation.record(() => {
      frame.openView("one");
      frame.setWorkspacePane(id, { label: "Page", component, props: { page: 1 } });
    });
    frame.navigation.back();
    expect(frame.layout.primarySidebarVisible).toBe(false);
    expect(frame.workspace.panes.value[0]!.label).toBe("Workspace");
    expect(frame.navigation.canGoBack).toBe(false);
    frame.navigation.forward();
    frame.setWorkspacePane(id, { label: "Next", component });
    frame.navigation.back();
    frame.setWorkspacePane(id, { label: "Page", component, props: { page: 1 } });
    expect(frame.navigation.canGoForward).toBe(true);
  });
  test("workspace destinations support back, forward, and branching", () => {
    const frame = createFrame({ navigation: true });
    const id = frame.workspace.initialPaneId;
    const open = (label: string) => frame.setWorkspacePane(id, { label, component });
    const label = () => frame.workspace.panes.value[0]!.label;
    expect(frame.navigation.canGoBack).toBe(false);
    open("Chats"); open("Loading"); open("Text input");
    expect(frame.navigation.back()).toBe(true); expect(label()).toBe("Loading");
    expect(frame.navigation.back()).toBe(true); expect(label()).toBe("Chats");
    expect(frame.navigation.forward()).toBe(true); expect(label()).toBe("Loading");
    open("Buttons");
    expect(frame.navigation.canGoForward).toBe(false);
    expect(frame.navigation.forward()).toBe(false);
    frame.navigation.back(); expect(label()).toBe("Loading");
    frame.navigation.forward(); expect(label()).toBe("Buttons");
  });
  test("direct workspace API and registered view navigation are tracked together", () => {
    const frame = createFrame({ navigation: true });
    frame.registerView({ id: "one", label: "One", component }, "primary");
    frame.registerView({ id: "two", label: "Two", component }, "primary");
    frame.openView("one");
    frame.workspace.setPane(frame.workspace.initialPaneId, { label: "Page", component });
    frame.openView("two");
    frame.navigation.back(); expect(frame.state.activeSidePanel).toBe("one");
    expect(frame.workspace.panes.value[0]!.label).toBe("Page");
    frame.navigation.back(); expect(frame.workspace.panes.value[0]!.label).toBe("Workspace");
    frame.navigation.forward(); frame.navigation.forward();
    expect(frame.state.activeSidePanel).toBe("two");
    expect(frame.navigation.canGoForward).toBe(false);
  });
  test("optional, isolated, hideable, and cleared on disposal", () => {
    const disabled = createFrame();
    disabled.setWorkspacePane(disabled.workspace.initialPaneId, { label: "Page" });
    expect(disabled.navigation.canGoBack).toBe(false);
    const frame = createFrame({ navigation: true });
    frame.layout.navigationVisible = false;
    frame.setWorkspacePane(frame.workspace.initialPaneId, { label: "Page" });
    expect(frame.navigation.canGoBack).toBe(true);
    frame.features.navigation = false;
    expect(frame.navigation.back()).toBe(false);
    frame.features.navigation = true;
    frame.dispose(); expect(frame.navigation.canGoBack).toBe(false);
  });
  test("unchanged destinations keep the forward branch and closed panes do not throw", () => {
    const frame = createFrame({ navigation: true });
    const id = frame.workspace.initialPaneId;
    frame.setWorkspacePane(id, { label: "One", component });
    frame.setWorkspacePane(id, { label: "Two", component });
    frame.navigation.back();
    frame.setWorkspacePane(id, { label: "One", component });
    expect(frame.navigation.canGoForward).toBe(true);
    const split = frame.splitWorkspace("right");
    frame.setWorkspacePane(split, { label: "Split", component });
    frame.closeWorkspacePane(split);
    expect(() => frame.navigation.back()).not.toThrow();
  });
});
