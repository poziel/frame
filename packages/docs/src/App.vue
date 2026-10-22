<script setup lang="ts">
import { h, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { createFrame, FrameShell } from "@frame/core";
import { createNotificationHistory, NotificationPanel, NotificationIndicator } from "@frame/features";
import { createTerminal, createTerminalView } from '@frame/features';
import AccentPalette from "./examples/AccentPalette.vue";
import ApiCatalog from "./examples/ApiCatalog.vue";
import { apiViewId, openApiReference } from "./examples/apiNavigation";
import { typeDocs } from "./examples/typeDocs";
import SubViewExample from "./examples/SubViewExample.vue";
import ComponentCatalog from "./examples/ComponentCatalog.vue";
import SecondarySidebarExample from "./examples/SecondarySidebarExample.vue";
import FrameIcon from "../../core/src/components/FrameIcon.vue";
import GuideCatalog from "./guides/GuideCatalog.vue";
import { openGuide, guidesViewId } from "./guides/navigation";
import { isGuidePageId } from "./guides/pages";

import "./examples/sample.css";
import "./docs.css";

// The host application owns its contributions; Frame only renders and routes them.
const frame = createFrame({ navigation: true });
const notificationHistory = createNotificationHistory(frame);
const terminal = createTerminal();
const removeTerminalView = frame.registerView(createTerminalView({ id: 'features.terminal', frame, terminal }), 'bottom');
const titleText = ref("Frame (Workspace)");
const showSearch = ref(true);

const cleanups: (() => void)[] = [];
cleanups.push(frame.registerCommand({ id: "features.notifications", label: "Notifications: Toggle history", run: notificationHistory.toggle }));
cleanups.push(frame.registerActivityAction({ id: "demo.home", label: "Home", icon: () => h(FrameIcon, { name: "home", size: 20 }), active: () => frame.workspace.panes.value.find(pane => pane.id === frame.workspace.activePane.value)?.props?.pageId === "overview", run: () => openGuide(frame) }));
cleanups.push(frame.registerView({ id: guidesViewId, label: "Guides", icon: () => h(FrameIcon, { name: "book", size: 20 }), component: GuideCatalog }, "primary"));
cleanups.push(frame.registerView({ id: "demo.accent-palette", label: "Accent palette", icon: () => h(FrameIcon, { name: "symbol-color", size: 20 }), component: AccentPalette }, "primary"));
cleanups.push(frame.registerView({ id: "demo.components", label: "Components", icon: () => h(FrameIcon, { name: "symbol-class", size: 20 }), component: ComponentCatalog }, "primary"));
cleanups.push(frame.registerView({ id: "demo.features", label: "Features", icon: () => h(FrameIcon, { name: "package", size: 20 }), component: ComponentCatalog, props: { features: true } }, "primary"));
cleanups.push(frame.registerView({ id: apiViewId, label: "API", icon: () => h(FrameIcon, { name: "references", size: 20 }), component: ApiCatalog, padded: false }, "primary"));
cleanups.push(frame.registerView({ id: 'demo.explorer', label: 'Explorer example', icon: () => h(FrameIcon, { name: 'files', size: 20 }), children: [
  { id: 'demo.project-notes', label: 'Project notes', component: SubViewExample, props: { title: 'Project notes', canAdd: true } },
  { id: 'demo.outline', label: 'Outline', component: SubViewExample, props: { title: 'Outline' } },
  { id: 'demo.timeline', label: 'Timeline', component: SubViewExample, props: { title: 'Timeline' } },
] }, 'primary'));
cleanups.push(frame.registerView({ id: 'demo.scratchpad', label: 'Scratchpad', component: SubViewExample, props: { title: 'Scratchpad' } }, 'bottom'));
for (const view of [
  {id:'demo.secondary.info',label:'Info',icon:'info',description:'Inspect details for the current selection.'},
  {id:'demo.secondary.outline',label:'Outline',icon:'list-tree',description:'Review the structure of the current document.'},
  {id:'demo.secondary.notes',label:'Notes',icon:'note',description:'Keep a draft while switching between sidebar views.'},
  {id:'demo.secondary.tasks',label:'Tasks',icon:'checklist',description:'Track work alongside the main workspace.'},

]) {
  const state=reactive({draft:'',feedback:'',savedDraft:''});
  let updates=0;
  const icon=(name:string)=>()=>h(FrameIcon,{name,size:16});
  const refresh={id:'refresh',label:`Refresh ${view.label.toLowerCase()}`,icon:icon('refresh'),run:()=>{state.feedback=`${view.label} refreshed (${++updates}).`;}};
  const clear={id:'clear',label:`Clear ${view.label.toLowerCase()}`,icon:icon('clear-all'),run:()=>{state.draft='';state.feedback='Draft cleared.';}};
  const actions=view.label==='Info'?[refresh]:view.label==='Outline'?[refresh,clear]:view.label==='Notes'?[
    {id:'save',label:'Save notes',icon:icon('save'),run:()=>{state.savedDraft=state.draft;state.feedback=state.draft?'Notes saved in this demo session.':'No notes to save.';}},clear,
  ]:[{id:'add',label:'Add task',icon:icon('add'),run:()=>{state.draft+=(state.draft?'\n':'')+'[ ] New task '+(++updates);state.feedback='Task added.';}}];
  cleanups.push(frame.registerView({id:view.id,label:view.label,icon:()=>h(FrameIcon,{name:view.icon,size:16}),actions,component:SecondarySidebarExample,props:{label:view.label,description:view.description,state}},'secondary'));
}

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
frame.manageMenuItems.value = [{ id: "settings", label: "Settings", command: "frame.settings", shortcut: "Ctrl+," }, { id: "separator", type: "separator" }, { id: "layout", label: "Customize layout", command: "frame.layout.customize" }, { id: "notifications", label: "Notifications", command: "features.notifications" }];
frame.openSidePanel("demo.components");
frame.openSecondaryPanel("demo.secondary.info"); frame.closeBottomPanel();
frame.layout.primaryWidth = 245; frame.layout.secondaryWidth = 460; frame.layout.panelHeight = 190;
frame.record("Documentation opened");
if (!location.hash) openGuide(frame, "overview", false);
function loadTypeReference() {
  const guide = location.hash.match(/^#\/guide\/(.+)$/);
  if (guide && isGuidePageId(guide[1]!)) { openGuide(frame, guide[1]!, false); return; }
  const match = location.hash.match(/^#\/(?:api|types)\/(.+)$/);
  if (!match) return;
  let name: string;
  try { name = decodeURIComponent(match[1]!); } catch { return; }
  if (Object.prototype.hasOwnProperty.call(typeDocs, name)) openApiReference(frame, name, false);
}
onMounted(() => { window.addEventListener("hashchange", loadTypeReference); loadTypeReference(); frame.navigation.clear(); });
onBeforeUnmount(() => { window.removeEventListener("hashchange", loadTypeReference); removeTerminalView(); void terminal.dispose().catch(terminal.reportError); cleanups.reverse().forEach(cleanup => cleanup()); notificationHistory.dispose(); frame.dispose(); });
</script>
<template><FrameShell :frame="frame" :title-text="titleText" :show-search="showSearch"><template #overlays><NotificationPanel :frame="frame" :history="notificationHistory" /></template><template #status-leading-actions><NotificationIndicator v-if="notificationHistory.state.indicatorPosition==='bottom-left'" :history="notificationHistory"/></template><template #status-actions><span>Frame documentation</span><span>Frame 0.1</span><NotificationIndicator v-if="notificationHistory.state.indicatorPosition==='bottom-right'" :history="notificationHistory"/></template></FrameShell></template>
