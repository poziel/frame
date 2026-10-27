<script setup lang="ts">
import { editorModule } from '@frame/core/modules/editor';
import { h, markRaw, onBeforeUnmount, onMounted, ref } from "vue";
import { createFrame, FrameShell } from "@frame/core";
import { frameMonokaiDark, frameMonokaiLight, frameDusk, vscodeLight2026, vscodeHighContrastBlack, vscodeHighContrastWhite } from '@frame/themes';
import { createNotificationHistory, NotificationPanel } from '@frame/core/modules/notifications';
import AccentPalette from "./examples/AccentPalette.vue";
import ApiCatalog from "./examples/ApiCatalog.vue";
import { apiViewId, openApiReference } from "./examples/apiNavigation";
import { typeDocs } from "./examples/typeDocs";
import ComponentCatalog from "./examples/ComponentCatalog.vue";
import { createChatPlayground } from "./examples/chatPlayground";
import { openChatPlayground } from "./examples/chatPlaygroundNavigation";
import { openFeaturePage } from './examples/featureNavigation';
import FrameIcon from "../../core/src/components/data-display/FrameIcon.vue";
import GuideCatalog from "./guides/GuideCatalog.vue";
import { openGuide, guidesViewId } from "./guides/navigation";
import { isGuidePageId } from "./guides/pages";

import LayoutCatalog from "./layouts/LayoutCatalog.vue";
import { openLayout, resolveLayoutPageId } from "./layouts/navigation";

import "./examples/sample.css";
import "./docs.css";

// The host application owns its contributions; Frame only renders and routes them.
const frame = createFrame({ navigation: true, features: { navigationBar: false, secondarySidebar: false, panel: false }, primaryViewBar: { allowAddSeparator: true } }).use(editorModule);
const notificationHistory = createNotificationHistory(frame, { statusBar: true });
const removeStatusName = frame.status.register({ id: 'docs.name', kind: 'text', label: 'Application name', text: 'Frame documentation', side: 'left' });
const removeStatusVersion = frame.status.register({ id: 'docs.version', kind: 'text', label: 'Version', text: 'Frame 0.1', side: 'right' });
const titleText = ref("Frame (Workspace)");
const showSearch = ref(true);

const cleanups: (() => void)[] = [];
const showDocks = () => openLayout(frame, 'docks');
cleanups.push(frame.registerCommand({ id: 'demo.docks', label: 'Demo: Open docks playground', run: showDocks }));
const chatPlayground = markRaw(createChatPlayground());
const showChatPlayground = () => openChatPlayground(frame, chatPlayground);
cleanups.push(() => chatPlayground.dispose());
cleanups.push(frame.registerCommand({ id: 'demo.chat.playground', label: 'Demo: Open AI chat playground', run: showChatPlayground }));
const themePresets = [frameMonokaiDark, frameMonokaiLight, frameDusk, vscodeLight2026, vscodeHighContrastBlack, vscodeHighContrastWhite];
for (const theme of themePresets) cleanups.push(frame.theme.register(theme));
cleanups.push(frame.registerCommand({
  id: 'demo.workspace.tabs', label: 'Demo: Open workspace tabs',
  enabled: () => frame.workspace.canSplit(),
  run: async () => {
    frame.workspace.configure({ tabs: { allowCreate: true, allowClose: true, allowMove: true, lastTab: 'allow-empty' } });
    const paneId = frame.splitWorkspace('right');
    frame.workspace.setPaneMode(paneId, 'tabs');
    await frame.workspace.requestTab(paneId);
  },
}));
cleanups.push(removeStatusName, removeStatusVersion);
cleanups.push(frame.registerCommand({ id: "features.notifications", scope: "frame", label: "Notifications: Toggle history", run: notificationHistory.toggle }));
cleanups.push(frame.registerView({ id: guidesViewId, label: "Guides", icon: () => h(FrameIcon, { name: "book", size: 20 }), component: GuideCatalog, padded: false }, "primary"));
cleanups.push(frame.registerView({ id: 'demo.layouts', label: 'Layouts', icon: () => h(FrameIcon, { name: 'layout', size: 20 }), component: LayoutCatalog, padded: false }, 'primary'));
cleanups.push(frame.registerView({ id: "demo.components", label: "Components", icon: () => h(FrameIcon, { name: "symbol-class", size: 20 }), component: ComponentCatalog, padded: false }, "primary"));
cleanups.push(frame.registerView({ id: apiViewId, label: "API", icon: () => h(FrameIcon, { name: "references", size: 20 }), component: ApiCatalog, padded: false }, "primary"));
cleanups.push(frame.registerView({ id: "demo.accent-palette", label: "Theming", icon: () => h(FrameIcon, { name: "symbol-color", size: 20 }), component: AccentPalette }, "primary"));
cleanups.push(frame.registerView({ id: "demo.features", label: "Modules", icon: () => h(FrameIcon, { name: "package", size: 20 }), component: ComponentCatalog, props: { features: true }, padded: false }, "primary"));

cleanups.push(frame.registerSettingsSection({ id: "appearance", title: "Appearance", description: "Arrange Frame around the way you work.", settings: [
  { id: 'appearance.theme', label: 'Theme', description: "Choose the colors and contrast used throughout the shell.", type: 'select', default: 'default', getValue: () => frame.theme.current.value?.id ?? 'default', options: [{ value: 'default', label: 'Frame default' }, ...themePresets.map(theme => ({ value: theme.id, label: theme.name }))], onChange: value => { const theme = themePresets.find(theme => theme.id === value); if (theme) frame.theme.set(theme); else frame.theme.reset(); } },
  { id: "appearance.density", label: "Layout density", description: "Choose how much space shell regions and their controls use.", type: "select", default: "default", getValue: () => frame.layout.density, options: [{ value: "default", label: "Default", description: "Roomier regions with resize grips." }, { value: "compact", label: "Compact", description: "Tighter regions without resize grips." }], onChange: value => { frame.layout.density = value as "default" | "compact"; } },
  { id: "appearance.sidebar", label: "Primary sidebar position", description: "Choose the side of the workspace used by the primary sidebar.", type: "select", default: "left", getValue: () => frame.layout.primarySide, options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }], onChange: value => { frame.layout.primarySide = value as "left" | "right"; } },
  { id: "appearance.centered", label: "Center the workspace", description: "Keep workspace content within a centered column.", type: "checkbox", default: false, getValue: () => frame.layout.centered, onChange: value => { frame.layout.centered = Boolean(value); } },
], children: [{ id: "appearance.workspace", title: "Workspace", description: "Name and organize this workspace.", settings: [
  { id: "workspace.name", label: "Workspace name", description: "Name this workspace for display in the application.", type: "text", default: "Frame (Workspace)", getValue: () => titleText.value, onChange: value => { titleText.value = String(value); } },
  { id: "workspace.width", label: "Centered workspace width", description: "Set the percentage of available width used by centered workspace content.", type: "range", default: 90, getValue: () => Math.round(frame.layout.centeredRatio * 100), min: 30, max: 100, step: 1, onChange: value => { frame.layout.centeredRatio = Number(value) / 100; } },
  { id: "workspace.notes", label: "Workspace notes", description: "Keep a short note about this workspace.", type: "textarea", default: "Keep the workspace focused." },
] }] }));
cleanups.push(frame.registerSettingsSection({ id: "application", title: "Application", description: "Set application behavior and project preferences.", settings: [
  { id: "application.autosave", label: "Autosave interval (seconds)", type: "number", default: 30, min: 5, max: 300, step: 5, description: "Sample preference for applications that provide autosave." },
  { id: "application.color", label: "Project color", description: "Choose the accent color associated with this project.", type: "color", default: "#0078d4" },
] }));
frame.manageMenuItems.value = [{ id: "settings", label: "Settings", command: "frame.settings", shortcut: "Ctrl+," }, { id: "separator", type: "separator" }, { id: "layout", label: "Customize layout", command: "frame.layout.customize" }, { id: "notifications", label: "Notifications", command: "features.notifications" }];
frame.openSidePanel(guidesViewId);
frame.closeSecondaryPanel(); frame.closeBottomPanel();
frame.layout.primaryWidth = 245; frame.layout.secondaryWidth = 460; frame.layout.panelHeight = 190;
frame.record("Documentation opened");
if (!location.hash) openGuide(frame, "overview", false);
function loadTypeReference() {
  const feature = location.hash.match(/^#\/(?:modules|features)\/([\w-]+)$/);
  if (feature && openFeaturePage(frame,feature[1]!)) { frame.openView('demo.features'); return; }
  if (location.hash === '#/docks') { showDocks(); return; }
  const layout = location.hash.match(/^#\/layouts\/(.+)$/);
  const layoutPageId = layout && resolveLayoutPageId(layout[1]!);
  if (layoutPageId) { openLayout(frame, layoutPageId, false); frame.openView('demo.layouts'); return; }
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
onBeforeUnmount(() => { window.removeEventListener("hashchange", loadTypeReference); cleanups.reverse().forEach(cleanup => cleanup()); notificationHistory.dispose(); frame.dispose(); });
</script>
<template><FrameShell :frame="frame" :title-text="titleText" :show-search="showSearch"><template #overlays><NotificationPanel :frame="frame" :history="notificationHistory" /></template></FrameShell></template>
