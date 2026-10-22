<script setup lang="ts">
import { h, onBeforeUnmount, onMounted, ref } from "vue";
import { createFrame, FrameShell } from "@frame/core";
import { createNotificationHistory, NotificationPanel, NotificationIndicator } from "@frame/extras";
import { createTerminal, createTerminalView } from '@frame/extras';
import ApiCatalog from "./examples/ApiCatalog.vue";
import { apiViewId, openApiReference } from "./examples/apiNavigation";
import { typeDocs } from "./examples/typeDocs";
import ComponentCatalog from "./examples/ComponentCatalog.vue";
import FrameIcon from "../../core/src/components/FrameIcon.vue";

import "./examples/sample.css";
import "./docs.css";

// The host application owns its contributions; Frame only renders and routes them.
const frame = createFrame({ navigation: true });
const notificationHistory = createNotificationHistory(frame);
const terminal = createTerminal();
const removeTerminalView = frame.registerView(createTerminalView({ id: 'extras.terminal', frame, terminal }), 'bottom');
const titleText = ref("Frame (Workspace)");
const showSearch = ref(true);

const cleanups: (() => void)[] = [];
cleanups.push(frame.registerCommand({ id: "extras.notifications", label: "Notifications: Toggle history", run: notificationHistory.toggle }));
cleanups.push(frame.registerActivityAction({ id: "demo.home", label: "Home", icon: () => h(FrameIcon, { name: "home", size: 20 }), run: () => { history.replaceState(null, "", location.pathname + location.search); frame.resetWorkspace(); } }));
cleanups.push(frame.registerView({ id: "demo.components", label: "Components", icon: () => h(FrameIcon, { name: "symbol-class", size: 20 }), component: ComponentCatalog }, "primary"));
cleanups.push(frame.registerView({ id: "demo.extras", label: "Extras", icon: () => h(FrameIcon, { name: "package", size: 20 }), component: ComponentCatalog, props: { extras: true } }, "primary"));
cleanups.push(frame.registerView({ id: apiViewId, label: "API", icon: () => h(FrameIcon, { name: "references", size: 20 }), component: ApiCatalog, padded: false }, "primary"));
cleanups.push(frame.registerSettingsSection({ id: "appearance", title: "Appearance", description: "Arrange Frame around the way you work.", settings: [
  { id: "appearance.density", label: "Layout density", type: "select", default: "default", getValue: () => frame.layout.density, options: [{ value: "default", label: "Default", description: "Roomier regions with resize grips." }, { value: "compact", label: "Compact", description: "Tighter regions without resize grips." }], onChange: value => { frame.layout.density = value as "default" | "compact"; } },
  { id: "appearance.sidebar", label: "Primary sidebar position", type: "select", default: "left", getValue: () => frame.layout.primarySide, options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], onChange: value => { frame.layout.primarySide = value as "left" | "right"; } },
  { id: "appearance.centered", label: "Center the workspace", description: "Keep workspace content within a centered column.", type: "checkbox", default: false, getValue: () => frame.layout.centered, onChange: value => { frame.layout.centered = Boolean(value); } },
], children: [{ id: "appearance.workspace", title: "Workspace", settings: [
  { id: "workspace.name", label: "Workspace name", type: "text", default: "Frame (Workspace)", getValue: () => titleText.value, onChange: value => { titleText.value = String(value); } },
  { id: "workspace.width", label: "Centered workspace width", type: "range", default: 90, getValue: () => Math.round(frame.layout.centeredRatio * 100), min: 30, max: 100, step: 1, onChange: value => { frame.layout.centeredRatio = Number(value) / 100; } },
  { id: "workspace.notes", label: "Workspace notes", type: "textarea", default: "Keep the workspace focused." },
] }] }));
cleanups.push(frame.registerSettingsSection({ id: "application", title: "Application", settings: [
  { id: "application.autosave", label: "Autosave interval (seconds)", type: "number", default: 30, min: 5, max: 300, step: 5, description: "Sample preference for applications that provide autosave." },
  { id: "application.color", label: "Project color", type: "color", default: "#0078d4" },
] }));
frame.manageMenuItems.value = [{ id: "settings", label: "Settings", command: "frame.settings", shortcut: "Ctrl+," }, { id: "separator", type: "separator" }, { id: "layout", label: "Customize layout", command: "frame.layout.customize" }, { id: "notifications", label: "Notifications", command: "extras.notifications" }];
frame.openSidePanel("demo.components");
frame.layout.secondarySidebarVisible = false; frame.closeBottomPanel();
frame.navigation.clear();
frame.layout.primaryWidth = 245; frame.layout.secondaryWidth = 270; frame.layout.panelHeight = 190;
frame.record("Documentation opened");
function loadTypeReference() {
  const match = location.hash.match(/^#\/(?:api|types)\/(.+)$/);
  if (!match) return;
  let name: string;
  try { name = decodeURIComponent(match[1]!); } catch { return; }
  if (Object.prototype.hasOwnProperty.call(typeDocs, name)) openApiReference(frame, name, false);
}
onMounted(() => { window.addEventListener("hashchange", loadTypeReference); loadTypeReference(); });
onBeforeUnmount(() => { window.removeEventListener("hashchange", loadTypeReference); removeTerminalView(); void terminal.dispose().catch(terminal.reportError); cleanups.reverse().forEach(cleanup => cleanup()); notificationHistory.dispose(); frame.dispose(); });
</script>
<template><FrameShell :frame="frame" :title-text="titleText" :show-search="showSearch"><template #overlays><NotificationPanel :frame="frame" :history="notificationHistory" :bottom="frame.layout.statusBarVisible ? (frame.layout.density === 'compact' ? 28 : 38) : 8"/></template><template #status-actions><span>Frame documentation</span><span>Frame 0.1</span><NotificationIndicator :history="notificationHistory"/></template></FrameShell></template>
