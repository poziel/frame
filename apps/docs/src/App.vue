<script setup lang="ts">
import { h, onBeforeUnmount, onMounted, ref } from "vue";
import { createFrame, FrameShell } from "@frame/core";
import TypeDocumentationPage from "../../../src/examples/TypeDocumentationPage.vue";
import { typeDocs } from "../../../src/examples/typeDocs";
import ComponentCatalog from "../../../src/examples/ComponentCatalog.vue";
import BuiltinView from "../../../src/components/BuiltinView.vue";
import DemoProperties from "../../../src/examples/DemoProperties.vue";
import DemoBanner from "../../../src/examples/DemoBanner.vue";
import FrameIcon from "../../../src/components/FrameIcon.vue";
import DemoList from "../../../src/examples/DemoList.vue";
import DemoInspector from "../../../src/examples/DemoInspector.vue";

import SamplePanel from "../../../src/examples/SamplePanel.vue";
import SampleTab from "../../../src/examples/SampleTab.vue";
import "../../../src/examples/sample.css";
import "./docs.css";

// The host application owns its contributions; Frame only renders and routes them.
const frame = createFrame();
const titleText = ref("Frame (Workspace)");
const showSearch = ref(true);

const cleanups: (() => void)[] = [];
cleanups.push(frame.registerActivityAction({ id: "demo.home", label: "Home", icon: () => h(FrameIcon, { name: "home", size: 20 }), run: () => { history.replaceState(null, "", location.pathname + location.search); frame.resetWorkspace(); } }));
cleanups.push(frame.registerView({ id: "demo.components", label: "Components", icon: () => h(FrameIcon, { name: "symbol-class", size: 20 }), component: ComponentCatalog }, "primary"));
cleanups.push(frame.registerCommand({
  id: "sample.titlebar", label: "Sample: Toggle search or plain title",
  run: () => { showSearch.value = !showSearch.value; titleText.value = showSearch.value ? "Frame (Workspace)" : "Sample workbench"; },
}));
let removeSide: (() => void) | undefined;
let removeTab: (() => void) | undefined;
cleanups.push(frame.registerSecondaryTab({ id: "sample.secondary", label: "Sample", component: SampleTab }));
cleanups.push(frame.registerSidePanel({ id: "sample.home", label: "Sample tools", component: SamplePanel }));
cleanups.push(frame.registerCommand({
  id: "sample.add-side", label: "Sample: Add a primary view", detail: "Register and open an app-owned view",
  run: () => {
    if (!removeSide) removeSide = frame.registerSidePanel({ id: "sample.detail", label: "Sample details", component: SamplePanel, props: { detail: true } });
    frame.openSidePanel("sample.detail");
    frame.record("Sample view opened");
  },
}));
cleanups.push(frame.registerCommand({
  id: "sample.remove-side", label: "Sample: Remove details view", enabled: () => frame.sidePanels.value.some(panel => panel.id === "sample.detail"),
  run: () => { removeSide?.(); removeSide = undefined; frame.openSidePanel("sample.home"); },
}));
cleanups.push(frame.registerCommand({
  id: "sample.add-tab", label: "Sample: Add a panel view", detail: "Register a tab alongside Session",
  run: () => {
    if (!removeTab) removeTab = frame.registerBottomTab({ id: "sample.tab", label: "Sample", component: SampleTab });
    frame.openBottomPanel("sample.tab");
    frame.record("Sample bottom tab opened");
  },
}));
cleanups.push(frame.registerCommand({
  id: "sample.quick-pick", label: "Sample: Choose a view…", detail: "Use Quick input with app-supplied choices",
  run: async () => {
    const choice = await frame.showQuickPick(frame.sidePanels.value.map(panel => ({ id: panel.id, label: panel.label })), {
      title: "Choose a view", placeholder: "Select a view to open…",
    });
    if (choice) frame.openSidePanel(choice.id);
  },
}));
cleanups.push(frame.registerSidePanel({ id: "demo.collections", label: "Collections", children: [{ id: "demo.collection-list", label: "Collections", component: DemoList, padded: false, actions: [{ id: "add", label: "Add collection", icon: () => h(FrameIcon, { name: "add" }), run: () => frame.record("New collection requested") }] }, { id: "demo.people", label: "People", component: DemoList, props: { kind: "people" } }], padded: false, actions: [{ id: "choose", label: "…", run: () => frame.executeCommand("sample.quick-pick") }] }));
cleanups.push(frame.registerSecondaryTab({ id: "demo.inspector", label: "Inspector", component: DemoInspector, actions: [{ id: "refresh", label: "↻", run: () => frame.record("Inspector refreshed") }] }));
cleanups.push(frame.registerBottomTab({ id: "demo.activity", label: "Activity", component: SampleTab, actions: [{ id: "record", label: "Record event", run: () => frame.record("Demo event recorded") }] }));
cleanups.push(frame.registerToolbarAction({ id: "demo.save", label: "Save workspace", run: () => { frame.record("Workspace saved"); frame.state.message = "Workspace saved"; } }));
cleanups.push(frame.registerBanner({ id: "demo.review", label: "Workspace review", component: DemoBanner }));
cleanups.push(frame.registerCommand({ id: "demo.banner", label: "Demo: Show banner", run: frame.openBanner }));
cleanups.push(frame.registerBottomTab({ id: "demo.session", label: "Session", component: BuiltinView, props: { view: "session" } }));
cleanups.push(frame.registerSecondaryTab({ id: "demo.secondary.session", label: "Session", component: BuiltinView, props: { view: "session" } }));
cleanups.push(frame.registerCommand({ id: "demo.properties", label: "Demo: Open workspace properties", run: () => { frame.openModal({ id: "demo.properties", title: "Workspace properties", component: DemoProperties, actions: [{ id: "record", label: "Record change", run: () => frame.record("Properties action requested") }] }); } }));
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
frame.notify({ title: "Workspace ready", severity: "info", details: "Your sidebars, workspace panes, and activity panel are ready to arrange.", source: "Frame demo" });
frame.notify({ title: "Project saved", severity: "success", details: "The sample workspace is up to date.", source: "Frame demo" });
cleanups.push(frame.registerCommand({ id: "demo.notification", label: "Demo: Show notification", run: () => { frame.notify({ title: "Review requested", severity: "warning", priority: "Normal", details: "Open Settings to review the workspace preferences before continuing.", source: "Frame demo", show: true }); } }));
frame.manageMenuItems.value = [{ id: "settings", label: "Settings", command: "frame.settings", shortcut: "Ctrl+," }, { id: "separator", type: "separator" }, { id: "layout", label: "Customize layout", command: "frame.layout.customize" }, { id: "notifications", label: "Notifications", command: "frame.notifications" }];
frame.openSidePanel("demo.components"); frame.openSecondaryPanel("demo.inspector"); frame.openBottomPanel("demo.activity");
frame.layout.primaryWidth = 245; frame.layout.secondaryWidth = 270; frame.layout.panelHeight = 190;
frame.record("Interaction studio opened");
function loadTypeReference() {
  const name = decodeURIComponent(location.hash.replace(/^#\/types\//, ""));
  if (typeDocs[name]) frame.setWorkspacePane(frame.workspace.activePane.value, { label: name, component: TypeDocumentationPage, props: { name } });
}
onMounted(() => { window.addEventListener("hashchange", loadTypeReference); loadTypeReference(); });
onBeforeUnmount(() => { window.removeEventListener("hashchange", loadTypeReference); removeSide?.(); removeTab?.(); cleanups.reverse().forEach(cleanup => cleanup()); frame.dispose(); });
</script>
<template><FrameShell :frame="frame" :title-text="titleText" :show-search="showSearch"><template #status-actions><span>Personal workspace</span><button @click="frame.toggleBottomPanel()">Session {{ frame.state.entries.length }}</button><span>Frame 0.1</span></template></FrameShell></template>
