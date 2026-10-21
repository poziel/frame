<script setup lang="ts">
import { computed, h, watch, nextTick, onBeforeUnmount, onMounted, provide, ref, useId } from "vue";
import type { Frame } from "../frame/createFrame";
import { frameKey } from "../frame/createFrame";
import { useWindowControls } from "../frame/useWindowControls";
import OverlayScrollbars from "./OverlayScrollbars.vue";
import FrameSettings from "./FrameSettings.vue";
import FrameIcon from "./FrameIcon.vue";
import NotificationCenter from "./NotificationCenter.vue";
import TitleBar from "./TitleBar.vue";
import ActivityRail from "./ActivityRail.vue";
import ViewSections from "./ViewSections.vue";
import SidePanel from "./SidePanel.vue";
import WorkspacePanes from "./WorkspacePanes.vue";
import BottomPanel from "./BottomPanel.vue";
import QuickInput from "./CommandPalette.vue";
import FrameModal from "./FrameModal.vue";
import ViewDragOverlay from "./ViewDragOverlay.vue";
import FrameTooltip from "./FrameTooltip.vue";
import type { Command, FrameMenuItem } from "../types";
import "../style.css";
import { layoutGeometry } from "../frame/layout";
import LayoutCustomizer from "./LayoutCustomizer.vue";
import ResizeHandle from "./ResizeHandle.vue";
import ActivityMenu from "./ActivityMenu.vue";

const props = withDefaults(defineProps<{ frame: Frame; titleText?: string; showSearch?: boolean; menuItems?: readonly FrameMenuItem[] }>(), { titleText: "Frame (Workspace)", showSearch: true });
const frame = props.frame;
provide(frameKey, frame);
function preventBrowserMenu(event: MouseEvent) { event.preventDefault(); }
onMounted(() => window.addEventListener("contextmenu", preventBrowserMenu));
onBeforeUnmount(() => window.removeEventListener("contextmenu", preventBrowserMenu));
const contentReady = ref(false);
onMounted(() => { contentReady.value = true; });
const contentId = `frame-content-${useId()}`;
const views = frame.views;
const contentParking = ref<HTMLElement>();
function viewTarget(id: string) {
  if (frame.getViewParent(id)) return frame.contentHosts.get(id) ?? contentParking.value!;
  if (sidePanels.value.some(view => view.id === id)) return `#${contentId}-primary`;
  if (bottomTabs.value.some(view => view.id === id)) return `#${contentId}-bottom`;
  return `#${contentId}-secondary`;
}
function viewActive(id: string) { return !!frame.getViewParent(id) || [frame.state.activeSidePanel, frame.state.activeBottomTab, frame.state.activeSecondaryTab].includes(id); }
const windowControls = useWindowControls();
const { sidePanels, bottomTabs, secondaryTabs, quickInput, quickInputItems } = frame;
const { maximized, fullscreen } = windowControls;
const root = ref<HTMLElement>();
const body = ref<HTMLElement>();
const bodyWidth = ref(1180);
const bodyHeight = ref(720);
const layoutOpen = ref(false);
let observer: ResizeObserver | undefined;
const geometry = computed(() => layoutGeometry({ ...frame.layout, bannerVisible: frame.layout.bannerVisible && !!frame.workspaceBanner.value }, bodyWidth.value, bodyHeight.value));
const bodyStyle = computed(() => {
  const g = geometry.value;
  return { gridTemplateColumns: `${g.left}px ${g.leftGap}px minmax(0,1fr) ${g.rightGap}px ${g.right}px`, gridTemplateRows: `${g.banner}px ${g.banner ? g.gap : 0}px minmax(0,1fr) ${g.panel ? g.gap : 0}px ${g.panel}px`, rowGap: "0px" };
});
const primaryStyle = computed(() => {
  const g = geometry.value;
  const top = g.abovePrimary && g.rail ? g.banner + g.gap : 0;
  const bottom = g.underPrimary && g.rail ? g.panel + g.gap : 0;
  return { gridColumn: frame.layout.primarySide === "left" ? "1" : "5", gridRow: `${g.abovePrimary && !g.rail ? 3 : 1} / ${g.underPrimary && !g.rail ? 4 : 6}`, width: g.narrow ? `${g.primary + g.rail}px` : undefined, "--rail-width": `${g.rail}px`, "--workspace-top": `${top}px`, "--workspace-bottom": `${bottom}px`, "--workspace-height": `calc(100% - ${top + bottom}px)`, ...(g.narrow && !g.rail ? { top: `${g.abovePrimary ? g.banner + g.gap : 0}px`, bottom: `${g.underPrimary ? g.panel + g.gap : 0}px` } : {}) };
});
const secondaryStyle = computed(() => ({ gridColumn: frame.layout.primarySide === "left" ? "5" : "1", gridRow: `${geometry.value.aboveSecondary ? 3 : 1} / ${geometry.value.underSecondary ? 4 : 6}`, width: geometry.value.narrow ? `${geometry.value.secondary}px` : undefined, ...(geometry.value.narrow ? { top: `${geometry.value.aboveSecondary ? geometry.value.banner + geometry.value.gap : 0}px`, bottom: `${geometry.value.underSecondary ? geometry.value.panel + geometry.value.gap : 0}px` } : {}) }));
const primarySashStyle = computed(() => {
  const g = geometry.value;
  const top = g.abovePrimary ? g.banner + g.gap : 0;
  const bottom = g.underPrimary ? g.panel + g.gap : 0;
  return { gridColumn: frame.layout.primarySide === "left" ? 2 : 4, gridRow: `${g.abovePrimary ? 3 : 1} / ${g.underPrimary ? 4 : 6}`, ...(g.narrow ? { position: "absolute", top: `${top}px`, left: frame.layout.primarySide === "left" ? `${g.primary + g.rail - 6}px` : "auto", right: frame.layout.primarySide === "right" ? `${g.primary + g.rail - 6}px` : "auto", height: `${bodyHeight.value - top - bottom}px` } : {}) };
});
const activeSide = computed(() => sidePanels.value.find(panel => panel.id === frame.state.activeSidePanel));
const cleanups: (() => void)[] = [];
const notificationButton = ref<HTMLButtonElement>();
const settingsIcon = { render: () => h(FrameIcon, { name: "settings-gear" }) };
watch(frame.settingsRequest, () => { if (frame.settingsRequest.value && frame.features.settings) frame.openModal({ id: "frame.settings", title: "Settings", icon: settingsIcon, component: FrameSettings, width: 960, height: 660 }); }, { immediate: true });
function hideNotifications() { frame.notifications.state.open = false; void nextTick(() => notificationButton.value?.focus()); }
const builtins: Command[] = [
  { id: "frame.settings", label: "Settings: Open application settings", shortcut: "Ctrl+,", enabled: () => frame.features.settings, run: frame.openSettings },
  { id: "frame.notifications", label: "Notifications: Toggle notification center", enabled: () => frame.features.notifications, run: () => { frame.notifications.state.open = !frame.notifications.state.open; } },
  { id: "frame.layout.customize", label: "Layout: Customize layout", run: () => { frame.closeQuickInput(); layoutOpen.value = true; } },
  ...(["left", "right", "up", "down"] as const).map(direction => ({ id: `frame.workspace.split.${direction}`, label: `Workspace: Split ${direction}`, group: "Workspace", run: () => { frame.splitWorkspace(direction); } })),
  { id: "frame.workspace.close", label: "Workspace: Close active pane", enabled: () => frame.workspace.panes.value.length > 1, run: () => { frame.closeWorkspacePane(); } },
  { id: "frame.banner.toggle", label: "Layout: Toggle banner", enabled: () => !!frame.workspaceBanner.value, run: frame.toggleWorkspaceBanner },
  { id: "frame.secondary.toggle", label: "Layout: Toggle secondary sidebar", shortcut: "Ctrl+Alt+B", run: frame.toggleSecondaryPanel },
  { id: "frame.zen.toggle", label: "Layout: Toggle Zen Mode", run: () => frame.setZenMode(!frame.layout.zenMode) },
  { id: "frame.fullscreen", label: "Window: Toggle full screen", shortcut: "F11", enabled: () => windowControls.fullscreenAvailable, run: () => windowControls.toggleFullscreen(root.value) },
  { id: "frame.sidebar.open", label: "Layout: Open primary sidebar", run: () => { if (!frame.state.sidebarVisible) frame.toggleSidePanel(); } },
  { id: "frame.sidebar.close", label: "Layout: Close primary sidebar", enabled: () => frame.state.sidebarVisible, run: frame.closeSidePanel },
  { id: "frame.sidebar.toggle", label: "Layout: Toggle primary sidebar", group: "View", shortcut: "Ctrl+B", run: frame.toggleSidePanel },
  { id: "frame.panel.open", label: "Layout: Open bottom panel", run: () => frame.openBottomPanel() },
  { id: "frame.panel.close", label: "Layout: Close bottom panel", enabled: () => frame.state.panelVisible, run: frame.closeBottomPanel },
  { id: "frame.panel.toggle", label: "Layout: Toggle bottom panel", group: "View", shortcut: "Ctrl+J", run: frame.toggleBottomPanel },
  { id: "frame.layout.reset", label: "Layout: Reset layout", run: async () => { if (fullscreen.value) await windowControls.toggleFullscreen(root.value); frame.resetLayout(); frame.record("Layout reset"); } },
  { id: "frame.commands", label: "Show all commands", group: "View", shortcut: "Ctrl+Shift+P", run: frame.openCommands },
  ...(["minimize", "maximize", "close"] as const).map(action => ({
    id: `frame.window.${action}`, label: `Window: ${action === "maximize" ? "Maximize or restore" : action === "minimize" ? "Minimize" : "Close application"}`,
    enabled: () => windowControls.native, run: () => windowControls.execute(action),
  })),
];
for (const [key, label] of [["menuBarVisible", "menu bar"], ["activityBarVisible", "activity bar"], ["statusBarVisible", "status bar"], ["centered", "centered layout"]] as const) {
  builtins.push({ id: `frame.layout.${key}`, label: `Layout: Toggle ${label}`, run: () => { frame.layout[key] = !frame.layout[key]; } });
}
for (const value of ["left", "right"] as const) builtins.push({ id: `frame.layout.primary.${value}`, label: `Layout: Move primary sidebar ${value}`, run: () => { frame.layout.primarySide = value; } });
for (const value of ["left", "right", "center", "justify"] as const) builtins.push({ id: `frame.layout.panel.${value}`, label: `Layout: Align panel ${value}`, run: () => { frame.layout.panelAlignment = value; } });
for (const value of ["left", "right", "center", "justify"] as const) builtins.push({ id: `frame.layout.banner.${value}`, label: `Layout: Align banner ${value}`, run: () => { frame.layout.bannerAlignment = value; } });
for (const value of ["top", "center"] as const) builtins.push({ id: `frame.layout.quick.${value}`, label: `Layout: Position quick input ${value}`, run: () => { frame.layout.quickInputPosition = value; } });
for (const value of ["default", "compact"] as const) builtins.push({ id: `frame.layout.density.${value}`, label: `Layout: Use ${value} density`, run: () => { frame.layout.density = value; } });
for (const command of builtins) cleanups.push(frame.registerCommand(command));
const menuItems = computed<readonly FrameMenuItem[]>(() => props.menuItems ?? [
  { id: "view", label: "View", children: [
    { id: "commands", label: "Quick actions…", command: "frame.commands", shortcut: "Ctrl+Shift+P" },
    { id: "views", label: "Open view", children: sidePanels.value.map(panel => ({ id: panel.id, label: panel.label, command: frame.getViewCommand(panel.id) })) },
    ...frame.commands.value.filter(command => command.group === "View" && !command.id.startsWith("frame.")).map(command => ({ id: command.id, label: command.label, command: command.id, shortcut: command.shortcut, disabled: command.enabled ? !command.enabled() : false })),
  ] },
  { id: "layout", label: "Layout", children: [
    { id: "customize", label: "Customize layout…", command: "frame.layout.customize" },
    { id: "separator-layout", type: "separator" },
    { id: "sidebar", label: "Primary sidebar", command: "frame.sidebar.toggle", checked: frame.state.sidebarVisible, shortcut: "Ctrl+B" },
    { id: "secondary", label: "Secondary sidebar", command: "frame.secondary.toggle", checked: frame.layout.secondarySidebarVisible, shortcut: "Ctrl+Alt+B" },
    { id: "bottom", label: "Bottom panel", command: "frame.panel.toggle", checked: frame.state.panelVisible, shortcut: "Ctrl+J" },
  ] },
  { id: "window", label: "Window", children: [
    { id: "fullscreen", label: "Full screen", command: "frame.fullscreen", checked: fullscreen.value, disabled: !windowControls.fullscreenAvailable, shortcut: "F11" },
    { id: "minimize", label: "Minimize", command: "frame.window.minimize", disabled: !windowControls.native },
    { id: "maximize", label: "Maximize or restore", command: "frame.window.maximize", disabled: !windowControls.native },
    { id: "close", label: "Close window", command: "frame.window.close", disabled: !windowControls.native },
  ] },
]);
function selectSide(id: string) {
  if (frame.state.sidebarVisible && frame.state.activeSidePanel === id) frame.closeSidePanel();
  else frame.openSidePanel(id);
}
function matchesShortcut(event: KeyboardEvent, shortcut: string) {
  if (shortcut === "F11") return event.key === "F11" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
  const parts = shortcut.toLowerCase().split("+");
  return (event.ctrlKey || event.metaKey) === parts.includes("ctrl")
    && event.shiftKey === parts.includes("shift") && event.altKey === parts.includes("alt")
    && event.key.toLowerCase() === parts[parts.length - 1];
}
function onKey(event: KeyboardEvent) {
  if (event.isComposing || event.defaultPrevented) return;
  if ((event.ctrlKey || event.metaKey) && event.key === "," && frame.features.settings) { event.preventDefault(); frame.openSettings(); return; }
  if (event.isComposing || event.defaultPrevented || frame.dragState.active || frame.modals.length) return;
  if (event.key === "F11") { event.preventDefault(); void frame.executeCommand("frame.fullscreen"); return; }
  if (event.key === "Escape" && !quickInput.value && !layoutOpen.value && frame.layout.zenMode) { frame.setZenMode(false); return; }
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && !event.altKey && ((event.key.toLowerCase() === "p") || (!event.shiftKey && event.key.toLowerCase() === "t"))) {
    event.preventDefault();
    layoutOpen.value = false; if (!quickInput.value) frame.openCommands();
    return;
  }
  if (quickInput.value || layoutOpen.value) return;
  const command = frame.commands.value.find(item => item.shortcut && matchesShortcut(event, item.shortcut));
  if (command) { event.preventDefault(); void frame.executeCommand(command.id); }
}
onMounted(() => {
  window.addEventListener("keydown", onKey); frame.record("Workspace ready");
  observer = new ResizeObserver(entries => { const rect = entries[0]?.contentRect; if (rect) { bodyWidth.value = rect.width; bodyHeight.value = rect.height; } });
  if (body.value) observer.observe(body.value);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey); observer?.disconnect();
  frame.cancelViewDrag(); frame.closeQuickInput();
  cleanups.reverse().forEach(cleanup => cleanup());
});
</script>
<template>
  <div ref="root" class="workbench" :inert="frame.modals.length > 0 || undefined" @contextmenu.prevent :class="{ 'dragging-views': frame.dragState.active, compact: frame.layout.density === 'compact', zen: frame.layout.zenMode }"
    :style="{ gridTemplateRows: `34px minmax(0,1fr) ${frame.layout.statusBarVisible ? (frame.layout.density === 'compact' ? 24 : 34) : 0}px` }">
    <a class="skip-link" href="#workspace">Skip to workspace</a>
    <TitleBar :sidebar-visible="frame.state.sidebarVisible" :secondary-visible="frame.layout.secondarySidebarVisible" :panel-visible="frame.state.panelVisible" :maximized="maximized"
      :native="windowControls.native" :menu-items="menuItems" :title-text="titleText" :show-search="showSearch" :menu-bar-visible="frame.layout.menuBarVisible"
      :zen-mode="frame.layout.zenMode" :primary-side="frame.layout.primarySide" @commands="layoutOpen = false; frame.openCommands()" @execute="frame.executeCommand" />
    <div ref="body" class="workbench-body layout-grid" :class="{ narrow: geometry.narrow, 'primary-right': frame.layout.primarySide === 'right' }" :style="bodyStyle">
      <div v-show="geometry.rail || frame.state.sidebarVisible" class="navigation-container primary-region"
        :class="{ expanded: frame.state.sidebarVisible, 'edge-regions': (geometry.underPrimary || geometry.abovePrimary) && geometry.rail > 0, 'without-rail': !geometry.rail }" :style="primaryStyle">
        <ActivityRail v-show="frame.layout.activityBarVisible" :panels="sidePanels" :active-id="frame.state.activeSidePanel" :expanded="frame.state.sidebarVisible" @select="selectSide">
          <ActivityMenu v-if="!frame.layout.menuBarVisible" :items="menuItems" @execute="frame.executeCommand" />
        </ActivityRail>
        <SidePanel v-show="frame.state.sidebarVisible" :empty="!activeSide" :title="activeSide?.label ?? 'Views'" :actions="activeSide?.actions" :padded="activeSide?.children !== undefined ? false : activeSide?.padded" @close="frame.closeSidePanel()">
          <div :id="`${contentId}-primary`" class="view-host"/>
        </SidePanel>
      </div>
        <ResizeHandle v-if="frame.state.sidebarVisible" class="primary-gap-resize" grip :style="primarySashStyle" label="Resize primary sidebar" axis="x" :value="geometry.primary" :min="160" :max="Math.max(160, bodyWidth - geometry.rail - 160)"
          :reverse="frame.layout.primarySide === 'right'" @change="frame.layout.primaryWidth = $event" @reset="frame.layout.primaryWidth = 236" />
      <section v-if="frame.workspaceBanner.value" v-show="frame.layout.bannerVisible" class="workspace-banner" :aria-label="frame.workspaceBanner.value.label" :style="{ gridColumn: geometry.bannerColumn, marginLeft: `${geometry.bannerLeftInset}px`, marginRight: `${geometry.bannerRightInset}px` }"><component :is="frame.workspaceBanner.value.component" v-bind="frame.workspaceBanner.value.props"/></section>
      <div class="canvas-container workspace-region">
        <div class="canvas-centering" :class="{ centered: frame.layout.centered }" :style="{ '--center-width': `${frame.layout.centeredRatio * 100}%` }">
          <ResizeHandle v-if="frame.layout.centered" class="center-left" label="Resize centered content from left" axis="x" :value="frame.layout.centeredRatio" :min=".3" :max="1" reverse :scale="2 / Math.max(240, geometry.center)" :step=".02" @change="frame.layout.centeredRatio = $event" @reset="frame.layout.centeredRatio = .9" />
          <WorkspacePanes><template v-if="$slots.default" #default="scope"><slot :pane="scope.pane"/></template><template v-if="$slots['workspace-pane']" #pane="scope"><slot name="workspace-pane" :pane="scope.pane"/></template></WorkspacePanes>
          <ResizeHandle v-if="frame.layout.centered" class="center-right" label="Resize centered content from right" axis="x" :value="frame.layout.centeredRatio" :min=".3" :max="1" :scale="2 / Math.max(240, geometry.center)" :step=".02" @change="frame.layout.centeredRatio = $event" @reset="frame.layout.centeredRatio = .9" />
        </div>
      </div>
      <div v-show="frame.layout.secondarySidebarVisible" class="secondary-region" :style="secondaryStyle">
        <BottomPanel managed :content-id="`${contentId}-secondary`" :tabs="secondaryTabs" :active-id="frame.state.activeSecondaryTab" region-id="secondary-panel" label="Secondary sidebar" close-label="Hide secondary sidebar"
          @select="frame.openSecondaryPanel" @close="frame.layout.secondarySidebarVisible = false" />
        <ResizeHandle class="secondary-resize" grip label="Resize secondary sidebar" axis="x" :value="geometry.secondary" :min="160" :max="Math.max(160, bodyWidth - 160)" :reverse="frame.layout.primarySide === 'left'" @change="frame.layout.secondaryWidth = $event" @reset="frame.layout.secondaryWidth = 280" />
      </div>
      <div v-show="frame.state.panelVisible" class="bottom-region" :style="{ gridColumn: geometry.panelColumn, marginLeft: `${geometry.panelLeftInset}px`, marginRight: `${geometry.panelRightInset}px` }">
        <ResizeHandle class="panel-resize" grip label="Resize bottom panel" axis="y" :value="geometry.panel" :min="90" :max="Math.max(90, bodyHeight - 120)" reverse @change="frame.layout.panelHeight = $event" @reset="frame.layout.panelHeight = 240" />
        <BottomPanel managed :content-id="`${contentId}-bottom`" :tabs="bottomTabs" :active-id="frame.state.activeBottomTab" @select="frame.openBottomPanel" @close="frame.closeBottomPanel()" />
      </div>
    </div>
    <footer v-show="frame.layout.statusBarVisible" class="status-bar">
      <span role="status"><span class="live-dot" /> {{ frame.state.message }}</span>
      <div class="status-spacer"/><slot name="status-actions"/>
      <FrameTooltip v-if="frame.features.notifications" text="Notifications" placement="top" v-slot="{ describedby }"><button ref="notificationButton" class="notification-toggle icon-button" :aria-label="`Notifications (${frame.notifications.state.items.length})`" :aria-expanded="frame.notifications.state.open" :aria-describedby="describedby" @click="frame.notifications.state.open = !frame.notifications.state.open"><FrameIcon :name="frame.notifications.state.items.length ? 'bell-dot' : 'bell'" :size="16"/></button></FrameTooltip>
    </footer>
    <NotificationCenter v-if="frame.features.notifications" :bottom="frame.layout.statusBarVisible ? (frame.layout.density === 'compact' ? 28 : 38) : 8" @close="hideNotifications"/>
    <OverlayScrollbars :root="root"/>
    <ViewDragOverlay/>
    <FrameModal v-for="(modal, index) in frame.modals" :key="modal.id" :title="modal.title" :icon="modal.icon" :actions="modal.actions" :bounds="body" :width="modal.width" :height="modal.height" :maximized="modal.maximized" :active="index === frame.modals.length - 1" :layer="index" @close="frame.closeModal(modal.id)"><component :is="modal.component" v-bind="modal.props"/></FrameModal>
    <div ref="contentParking" hidden/>
    <template v-if="contentReady && contentParking"><Teleport v-for="view in views" :key="view.id" :to="viewTarget(view.id)"><div v-show="viewActive(view.id)" class="view-content"><ViewSections v-if="view.children !== undefined" :view-id="view.id"/><component v-else :is="view.component" v-bind="view.props"/></div></Teleport></template>
    <QuickInput v-if="quickInput" :key="quickInput.id" :items="quickInputItems" :title="quickInput.title" :placeholder="quickInput.placeholder" :searchable="quickInput.searchable" :position="frame.layout.quickInputPosition" @close="frame.closeQuickInput()" @accept="frame.acceptQuickInput" />
    <LayoutCustomizer v-if="layoutOpen" :fullscreen="fullscreen" :fullscreen-available="windowControls.fullscreenAvailable" @close="layoutOpen = false" @fullscreen="frame.executeCommand('frame.fullscreen')" />
  </div>
</template>





