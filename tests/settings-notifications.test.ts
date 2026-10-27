import { test, expect } from "bun:test";
import {createFrame} from '../packages/core/src/framework/frame';
import { regionIcon } from "../packages/core/src/framework/layout/layoutIcons";
test("settings register nested categories, validate edits, notify hosts, and unregister atomically", () => {
  const frame = createFrame(); const changes: unknown[] = [];
  const section = { id: "editor", title: "Editor", children: [{ id: "font", title: "Font", settings: [{ id: "font.size", label: "Size", type: "number" as const, default: 14, min: 8, max: 40, onChange: (
    value: unknown
  ) => changes.push(value) }] }] };
  const remove = frame.registerSettingsSection(section);
  expect(frame.settings.allSections.value.map(item => item.id)).toEqual(["editor", "font"]);
  expect(frame.settings.set("font.size", 20)).toBe(true);
  expect(frame.settings.set("font.size", 100)).toBe(false);
  expect(frame.settings.set("font.size", NaN)).toBe(false);
  expect(frame.settings.set("font.size", "20")).toBe(false);
  expect(frame.settings.values["font.size"]).toBe(20);
  expect(changes).toEqual([20]);
  expect(() => frame.registerSettingsSection({ id: "other", title: "Other", settings: [{ id: "font.size", label: "Duplicate", type: "number", default: 10 }] })).toThrow();
  expect(frame.settings.sections.length).toBe(1);
  frame.settings.reset("font.size"); expect(frame.settings.values["font.size"]).toBe(14);
  remove(); expect(frame.settings.allSections.value).toEqual([]); expect(frame.settings.values["font.size"]).toBeUndefined();
  frame.registerSettingsSection(section); remove(); expect(frame.settings.sections.length).toBe(1);
  frame.dispose(); expect(frame.settings.sections.length).toBe(0);
});
test("settings and notifications are isolated and optional, with configurable manage items", () => {
  const first = createFrame({ settings: false, notifications: false }); const second = createFrame();
  first.openSettings(); expect(first.settingsRequest.value).toBe(0);
  second.openSettings(); expect(second.settingsRequest.value).toBe(1);
  expect(first.features.notifications).toBe(false);
  first.manageMenuItems.value = []; expect(second.manageMenuItems.value.map(item => item.id)).toEqual(["settings", "keybindings"]);
});
test("notifications preserve severity/details and support individual and bulk dismissal", () => {
  const frame = createFrame(); const other = createFrame();
  const old = frame.notify({ id: "save", title: "Saved", severity: "success", details: "All changes saved", source: "Editor", duration: 0 });
  expect(other.notifications.state.items).toEqual([]);
  expect(frame.notifications.state.items[0]?.severity).toBe("success");
  frame.notify({ title: "Failed", severity: "error" }); expect(frame.notifications.state.items[0]?.title).toBe("Failed");
  expect(() => frame.notify({ id: "save", title: "Duplicate" })).toThrow();
  old.close(); frame.notify({ id: "save", title: "Saved again" }); old.close(); expect(frame.notifications.state.items.length).toBe(2);
  frame.notifications.clear(); expect(frame.notifications.state.items).toEqual([]);
  frame.dispose(); expect(frame.notifications.state.items).toEqual([]);
});
test("layout icons match visibility and physical sidebar positions", () => {
  expect(regionIcon("panel", false)).toBe("layout-panel-off");
  expect(regionIcon("panel", true)).toBe("layout-panel");
  expect(regionIcon("primary", false, "right")).toBe("layout-sidebar-right-off");
  expect(regionIcon("secondary", true, "right")).toBe("layout-sidebar-left");
});

test("settings reject unknown choices and track reactive host values", () => {
  const frame = createFrame(); let external = "compact";
  frame.registerSettingsSection({ id: "layout", title: "Layout", settings: [{ id: "density", label: "Density", type: "select", default: "default", options: [{ value: "default", label: "Default" }, { value: "compact", label: "Compact" }], getValue: () => external, onChange: value => { external = String(value); } }, { id: "locked", label: "Locked", type: "checkbox", default: true, disabled: true }] });
  expect(frame.settings.set("density", "wrong")).toBe(false);
  expect(frame.settings.set("density", "default")).toBe(true); expect(external).toBe("default");
  expect(frame.settings.set("locked", false)).toBe(false); expect(frame.settings.values.locked).toBe(true);
});
test("generated notification identifiers avoid caller identifiers", () => {
  const frame = createFrame(); frame.notify({ id: "notification-1", title: "Explicit" });
  expect(frame.notify({ title: "Generated" }).id).toBe("notification-2");
});
