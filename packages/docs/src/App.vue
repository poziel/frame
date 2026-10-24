<script setup lang="ts">
import { createDemoTerminalBackend } from "./examples/terminalDemo";
import { h, markRaw, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { createFrame, FrameShell } from "@frame/core";
import { vscodeLight2026, vscodeHighContrastBlack, vscodeHighContrastWhite } from '@frame/themes';
import { createNotificationHistory, NotificationPanel } from "@frame/features";
import { createTerminal, createTerminalView } from '@frame/features';
import AccentPalette from "./examples/AccentPalette.vue";
import ApiCatalog from "./examples/ApiCatalog.vue";
import { apiViewId, openApiReference } from "./examples/apiNavigation";
import { typeDocs } from "./examples/typeDocs";
import SubViewExample from "./examples/SubViewExample.vue";
import ComponentCatalog from "./examples/ComponentCatalog.vue";
import AIChatPlaygroundChat from "./examples/AIChatPlaygroundChat.vue";
import { createChatPlayground } from "./examples/chatPlayground";
import { openChatPlayground } from "./examples/chatPlaygroundNavigation";
import SecondarySidebarExample from "./examples/SecondarySidebarExample.vue";
import FrameIcon from "../../core/src/components/FrameIcon.vue";
import GuideCatalog from "./guides/GuideCatalog.vue";
import { openGuide, guidesViewId } from "./guides/navigation";
import { isGuidePageId } from "./guides/pages";

import "./examples/sample.css";
import "./docs.css";

// The host application owns its contributions; Frame only renders and routes them.
const frame = createFrame({ navigation: true, navigationBar: { display: "both", allowAddSeparator: true }, primaryViewBar: { allowAddSeparator: true }, secondaryViewBar: { allowAddSeparator: true }, panelViewBar: { allowAddSeparator: true } });
const notificationHistory = createNotificationHistory(frame, { statusBar: true });
const removeStatusName = frame.status.register({ id: 'docs.name', kind: 'text', label: 'Application name', text: 'Frame documentation', side: 'left' });
const removeStatusVersion = frame.status.register({ id: 'docs.version', kind: 'text', label: 'Version', text: 'Frame 0.1', side: 'right' });
const terminal = createTerminal({ backend: createDemoTerminalBackend() });
const removeTerminalView = frame.registerView(createTerminalView({ id: 'features.terminal', frame, terminal }), 'bottom');
const titleText = ref("Frame (Workspace)");
const showSearch = ref(true);

const cleanups: (() => void)[] = [];
const chatPlayground = markRaw(createChatPlayground());
const showChatPlayground = () => openChatPlayground(frame, chatPlayground);
cleanups.push(() => chatPlayground.dispose());
cleanups.push(frame.registerCommand({ id: 'demo.chat.playground', label: 'Demo: Open AI chat playground', group: 'Features', run: showChatPlayground }));
const themePresets = [vscodeLight2026, vscodeHighContrastBlack, vscodeHighContrastWhite];
for (const theme of themePresets) cleanups.push(frame.theme.register(theme));
cleanups.push(frame.registerCommand({
  id: 'demo.workspace.tabs', label: 'Demo: Open workspace tabs', group: 'Workspace',
  enabled: () => frame.workspace.canSplit(),
  run: async () => {
    frame.workspace.configure({ tabs: { allowCreate: true, allowClose: true, allowMove: true, lastTab: 'allow-empty' } });
    const paneId = frame.splitWorkspace('right');
    frame.workspace.setPaneMode(paneId, 'tabs');
    await frame.workspace.requestTab(paneId);
  },
}));
cleanups.push(removeStatusName, removeStatusVersion);
const navigationSelection = ref('home');
for (const item of [{id:'home',label:'Home',icon:'home',href:'#/guide/overview'},{id:'reference',label:'Reference',icon:'book',href:'#/api/Frame'}]) cleanups.push(frame.registerNavigationItem({id:`demo.navigation.${item.id}`,type:'link',href:item.href,label:item.label,icon:()=>h(FrameIcon,{name:item.icon,size:20}),active:()=>navigationSelection.value===item.id,onNavigate:()=>{navigationSelection.value=item.id;if(item.id==='home')openGuide(frame);else openApiReference(frame,'Frame');}}));
cleanups.push(frame.registerNavigationItem({id:'demo.nav.separator',type:'separator',label:'Navigation divider'}));
cleanups.push(frame.registerNavigationItem({id:'demo.nav.commands',type:'action',label:'Quick actions',icon:()=>h(FrameIcon,{name:'search',size:20}),run:()=>frame.openCommands()}));
cleanups.push(frame.registerNavigationItem({ id: 'demo.nav.chat-playground', type: 'action', label: 'AI chat playground', icon: () => h(FrameIcon, { name: 'beaker', size: 20 }), run: showChatPlayground }));
cleanups.push(frame.registerNavigationItem({id:'demo.nav.layout',type:'dropdown',label:'Layout',icon:()=>h(FrameIcon,{name:'layout',size:20}),items:[{id:'demo.nav.dock',type:'dropdown',label:'Navigation bar position',items:(['top','bottom','left','right']as const).map(position=>({id:`demo.nav.dock.${position}`,type:'action' as const,label:position[0]!.toUpperCase()+position.slice(1),run:()=>{frame.navigationBar.setPosition(position);}}))},{id:'demo.nav.docs',type:'link',label:'Frame reference',href:'#/api/Frame',onNavigate:()=>openApiReference(frame,'Frame') }]}));

cleanups.push(frame.registerCommand({ id: "features.notifications", scope: "frame", label: "Notifications: Toggle history", run: notificationHistory.toggle }));
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
cleanups.push(frame.registerView({ id: "demo.secondary.chat", label: "AI chat", icon: () => h(FrameIcon, { name: "comment-discussion", size: 16 }), component: AIChatPlaygroundChat, props: { session: chatPlayground, openPlayground: showChatPlayground }, padded: false }, "secondary"));
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
  { id: 'appearance.theme', label: 'Theme', type: 'select', default: 'default', getValue: () => frame.theme.current.value?.id ?? 'default', options: [{ value: 'default', label: 'Frame default' }, ...themePresets.map(theme => ({ value: theme.id, label: theme.name }))], onChange: value => { const theme = themePresets.find(theme => theme.id === value); if (theme) frame.theme.set(theme); else frame.theme.reset(); } },
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
frame.openSecondaryPanel("demo.secondary.chat"); frame.closeBottomPanel();
frame.layout.primaryWidth = 245; frame.layout.secondaryWidth = 460; frame.layout.panelHeight = 190;
frame.record("Documentation opened");
if (!location.hash) openGuide(frame, "overview", false);
function loadTypeReference() {
  if (location.hash === '#/playground/ai-chat') { showChatPlayground(); return; }
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
<template><FrameShell :frame="frame" :title-text="titleText" :show-search="showSearch"><template #overlays><NotificationPanel :frame="frame" :history="notificationHistory" /></template></FrameShell></template>
