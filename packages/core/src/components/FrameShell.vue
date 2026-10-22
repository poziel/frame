<script setup lang="ts">
import { computed, h, watch, onBeforeUnmount, onMounted, provide, ref, useId } from "vue";
import type { Frame } from "../frame/createFrame";
import { frameKey } from "../frame/createFrame";
import { useWindowControls } from "../frame/useWindowControls";
import OverlayScrollbars from "./OverlayScrollbars.vue";
import FrameSettings from "./FrameSettings.vue";
import FrameIcon from "./FrameIcon.vue";
import FrameNotifications from "./FrameNotifications.vue";
import TitleBar from "./TitleBar.vue";
import ActivityRail from "./ActivityRail.vue";
import ViewVisibilityMenu from "./ViewVisibilityMenu.vue";
import ViewSections from "./ViewSections.vue";
import SidePanel from "./SidePanel.vue";
import WorkspacePanes from "./WorkspacePanes.vue";
import BottomPanel from "./BottomPanel.vue";
import FrameQuickInput from "./FrameQuickInput.vue";
import FrameModal from "./FrameModal.vue";
import ViewDragOverlay from "./ViewDragOverlay.vue";
import type { Command, FrameMenuItem } from "../types";
import "../style.css";
import "../shell-sidebars.css";
import "../panel-docking.css";
import { layoutGeometry, maximizedRegionBounds } from "../frame/layout";
import LayoutCustomizer from "./LayoutCustomizer.vue";
import ResizeHandle from "./ResizeHandle.vue";
import ActivityMenu from "./ActivityMenu.vue";
import { provideOverlayBoundary } from "../frame/overlays";

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
function viewActive(id: string) { return frame.isViewVisible(id) && (!!frame.getViewParent(id) || [frame.state.activeSidePanel, frame.state.activeBottomTab, frame.state.activeSecondaryTab].includes(id)); }
const windowControls = useWindowControls();
const { sidePanels, bottomTabs, secondaryTabs, quickInput, quickInputItems } = frame;
const { maximized, fullscreen } = windowControls;
const root = ref<HTMLElement>();
const body = ref<HTMLElement>();
const overlayHost = ref<HTMLElement>();
const { bounds: overlayBounds, style: overlayStyle } = provideOverlayBoundary(body, overlayHost);
const bodyWidth = ref(1180);
const bodyHeight = ref(720);
const bodyPadding = ref({ left: 5, right: 5, top: 1, bottom: 0 });
const layoutOpen = ref(false);
let observer: ResizeObserver | undefined;
const activityMeasurements=ref<import('../frame/layout').ActivityMeasurements>({});
function measureActivity(region:'primary'|'secondary',size:{width:number;height:number}) {
 const horizontal=(region==='primary'?frame.layout.activityBarPosition:frame.layout.secondaryActivityBarPosition)!=='default';
 activityMeasurements.value[region]={...activityMeasurements.value[region],[horizontal?'height':'width']:horizontal?size.height:size.width};
}
const geometry = computed(() => layoutGeometry({ ...frame.layout, bannerVisible: frame.layout.bannerVisible && !!frame.workspaceBanner.value }, bodyWidth.value, bodyHeight.value, activityMeasurements.value));
const maximizedBounds = computed(() => maximizedRegionBounds(frame.layout, bodyWidth.value, bodyHeight.value, activityMeasurements.value));
function maximizedStyle(region: "secondary" | "bottom") {
  const bounds = maximizedBounds.value;
  if (!bounds || frame.layout.maximizedRegion !== region) return {};
  const padding = bodyPadding.value;
  return { position: "absolute" as const, gridColumn: "auto", gridRow: "auto", top: `${padding.top}px`, bottom: `${padding.bottom}px`, left: `${bounds.left + padding.left}px`, right: `${bounds.right + padding.right}px`, width: "auto", marginLeft: "0px", marginRight: "0px", zIndex: 10 };
}
const bodyStyle = computed(() => {
  const g = geometry.value;
  return { gridTemplateColumns: `${g.left}px ${g.leftGap}px minmax(0,1fr) ${g.rightGap}px ${g.right}px`, gridTemplateRows: g.panelTop ? `${g.banner}px ${g.banner ? g.gap : 0}px ${g.panel}px ${g.panel ? g.gap : 0}px minmax(0,1fr)` : `${g.banner}px ${g.banner ? g.gap : 0}px minmax(0,1fr) ${g.panel ? g.gap : 0}px ${g.panel}px`, rowGap: "0px" };
});
function sidebarTop(panelAbove:boolean,bannerAbove:boolean){const g=geometry.value;return panelAbove?g.banner+(g.banner?g.gap:0)+g.panel+g.gap:bannerAbove?g.banner+g.gap:0;}
const workspaceStyle=computed(()=>{const g=geometry.value;return {gridRow:g.panelTop?'5':'3',marginLeft:frame.layout.panelPosition==='left'&&g.panelWidth?`${g.panelWidth+g.gap}px`:undefined,marginRight:frame.layout.panelPosition==='right'&&g.panelWidth?`${g.panelWidth+g.gap}px`:undefined};});
const panelStyle=computed(()=>{const g=geometry.value;return g.panelVertical?{position:'absolute' as const,gridColumn:'auto',gridRow:'auto',left:`${bodyPadding.value.left+g.left+g.leftGap+(frame.layout.panelPosition==='right'?g.center+g.gap:0)}px`,top:`${bodyPadding.value.top+g.banner+(g.banner?g.gap:0)}px`,bottom:`${bodyPadding.value.bottom}px`,width:`${g.panelWidth}px`,marginLeft:'0px',marginRight:'0px'}:{gridColumn:g.panelColumn,gridRow:g.panelTop?'3':'5',marginLeft:`${g.panelLeftInset}px`,marginRight:`${g.panelRightInset}px`};});
const primaryStyle = computed(() => {
  const g = geometry.value;
  const top = g.rail ? sidebarTop(g.panelAbovePrimary,g.abovePrimary) : 0;
  const bottom = g.underPrimary && g.rail ? g.panel + g.gap : 0;
  return { gridColumn: frame.layout.primarySide === "left" ? "1" : "5", gridRow: `${!g.rail && g.panelAbovePrimary ? 5 : g.abovePrimary && !g.rail ? 3 : 1} / ${g.underPrimary && !g.rail ? 4 : 6}`, width: g.narrow ? `${g.primary + g.rail}px` : undefined, "--rail-width": `${g.rail}px`, "--activity-height": `${g.activityHeight}px`, "--workspace-top": `${top}px`, "--workspace-bottom": `${bottom}px`, "--workspace-height": `calc(100% - ${top + bottom}px)`, ...(g.narrow && !g.rail ? { top: `${sidebarTop(g.panelAbovePrimary,g.abovePrimary)}px`, bottom: `${g.underPrimary ? g.panel + g.gap : 0}px` } : {}) };
});
const secondaryStyle = computed(() => {
 const g=geometry.value;
 const top=g.secondaryRail?sidebarTop(g.panelAboveSecondary,g.aboveSecondary):0;
 const bottom=g.underSecondary&&g.secondaryRail?g.panel+g.gap:0;
 return {gridColumn:frame.layout.primarySide==='left'?'5':'1',gridRow:`${g.panelAboveSecondary&&!g.secondaryRail?5:g.aboveSecondary&&!g.secondaryRail?3:1} / ${g.underSecondary&&!g.secondaryRail?4:6}`,width:g.narrow?`${g.secondary+g.secondaryRail}px`:undefined,'--rail-width':`${g.secondaryRail}px`,'--activity-height':`${g.secondaryActivityHeight}px`,'--workspace-top':`${top}px`,'--workspace-bottom':`${bottom}px`,'--workspace-height':`calc(100% - ${top+bottom}px)`,...(g.narrow&&!g.secondaryRail?{top:`${sidebarTop(g.panelAboveSecondary,g.aboveSecondary)}px`,bottom:`${g.underSecondary?g.panel+g.gap:0}px`}:{})};
});
const primaryRail=ref<{openContext:(event:MouseEvent)=>void}>();
const secondaryRail=ref<{openContext:(event:MouseEvent)=>void}>();
const activeSecondary=computed(()=>secondaryTabs.value.find(tab=>tab.id===frame.state.activeSecondaryTab&&frame.secondaryBar.isVisible(tab.id)));
const primarySashStyle = computed(() => {
  const g = geometry.value;
  const top = sidebarTop(g.panelAbovePrimary,g.abovePrimary);
  const bottom = g.underPrimary ? g.panel + g.gap : 0;
  return { gridColumn: frame.layout.primarySide === "left" ? 2 : 4, gridRow: `${g.panelAbovePrimary ? 5 : g.abovePrimary ? 3 : 1} / ${g.underPrimary ? 4 : 6}`, ...(g.narrow ? { position: "absolute", top: `${top}px`, left: frame.layout.primarySide === "left" ? `${g.primary + g.rail - 6}px` : "auto", right: frame.layout.primarySide === "right" ? `${g.primary + g.rail - 6}px` : "auto", height: `${bodyHeight.value - top - bottom}px` } : {}) };
});
const activeSide = computed(() => sidePanels.value.find(panel => panel.id === frame.state.activeSidePanel));
const cleanups: (() => void)[] = [];
const settingsIcon = { render: () => h(FrameIcon, { name: "settings-gear" }) };
watch(frame.settingsRequest, () => { if (frame.settingsRequest.value && frame.features.settings) frame.openModal({ id: "frame.settings", title: "Settings", icon: settingsIcon, component: FrameSettings, width: 960, height: 660 }); }, { immediate: true });
const builtins: Command[] = [
  { id: "frame.settings", label: "Settings: Open application settings", shortcut: "Ctrl+,", enabled: () => frame.features.settings, run: frame.openSettings },
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
for (const [key, label] of [["menuBarVisible", "menu bar"], ["activityBarVisible", "primary activity bar"], ["secondaryActivityBarVisible", "secondary activity bar"], ["statusBarVisible", "status bar"], ["centered", "centered layout"]] as const) {
  builtins.push({ id: `frame.layout.${key}`, label: `Layout: Toggle ${label}`, run: () => { frame.layout[key] = !frame.layout[key]; } });
}
for (const value of ["left", "right"] as const) builtins.push({ id: `frame.layout.primary.${value}`, label: `Layout: Move primary sidebar ${value}`, run: () => { frame.layout.primarySide = value; } });
for (const value of ["left", "right", "center", "justify"] as const) builtins.push({ id: `frame.layout.panel.${value}`, label: `Layout: Align panel ${value}`, enabled: () => frame.panel.canAlign.value, run: () => { frame.panel.setAlignment(value); } });
for (const value of ["top", "bottom", "left", "right"] as const) builtins.push({ id: `frame.layout.panel.position.${value}`, label: `Layout: Position panel ${value}`, run: () => { frame.panel.setPosition(value); } });
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
function selectSide(id: string) { frame.selectSideView(id); }
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
  observer = new ResizeObserver(entries => {
    const rect = entries[0]?.contentRect;
    if (rect && body.value) {
      bodyWidth.value = rect.width; bodyHeight.value = rect.height;
      const style = getComputedStyle(body.value);
      bodyPadding.value = { left: parseFloat(style.paddingLeft) || 0, right: parseFloat(style.paddingRight) || 0, top: parseFloat(style.paddingTop) || 0, bottom: parseFloat(style.paddingBottom) || 0 };
    }
  });
  if (body.value) observer.observe(body.value);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey); observer?.disconnect();
  frame.cancelViewDrag(); frame.closeQuickInput();
  cleanups.reverse().forEach(cleanup => cleanup());
});
</script>
<template>
  <div ref="root" class="workbench" :data-frame-overlay-host="`${contentId}-overlays`" :inert="frame.modals.length > 0 || undefined" @contextmenu.prevent :class="{ 'dragging-views': frame.dragState.active, compact: frame.layout.density === 'compact', zen: frame.layout.zenMode }"
    :style="{ gridTemplateRows: `34px minmax(0,1fr) ${frame.layout.statusBarVisible ? (frame.layout.density === 'compact' ? 24 : 34) : 0}px` }">
    <a class="skip-link" href="#workspace">Skip to workspace</a>
    <TitleBar :sidebar-visible="frame.state.sidebarVisible" :secondary-visible="frame.layout.secondarySidebarVisible" :panel-visible="frame.state.panelVisible" :maximized="maximized"
      :native="windowControls.native" :menu-items="menuItems" :title-text="titleText" :show-search="showSearch" :menu-bar-visible="frame.layout.menuBarVisible"
      :zen-mode="frame.layout.zenMode" :primary-side="frame.layout.primarySide" @commands="layoutOpen = false; frame.openCommands()" @execute="frame.executeCommand" />
    <div ref="body" class="workbench-body layout-grid" :class="{ narrow: geometry.narrow, 'primary-right': frame.layout.primarySide === 'right' }" :style="bodyStyle">
      <div v-show="geometry.rail || frame.state.sidebarVisible" class="navigation-container primary-region shell-sidebar" :data-sidebar-side="frame.layout.primarySide"
        :class="{ expanded: frame.state.sidebarVisible, 'edge-regions': (geometry.underPrimary || geometry.abovePrimary) && geometry.rail > 0, 'without-rail': !geometry.rail, 'activity-top': geometry.activityHorizontal && frame.layout.activityBarVisible && frame.layout.activityBarPosition === 'top', 'activity-bottom': geometry.activityHorizontal && frame.layout.activityBarVisible && frame.layout.activityBarPosition === 'bottom', 'sidebar-horizontal': geometry.activityHorizontal }" :style="primaryStyle">
        <ActivityRail @resize="measureActivity('primary',$event)" ref="primaryRail" v-show="frame.layout.activityBarVisible && (frame.layout.activityBarPosition==='default' || frame.state.sidebarVisible)" :panels="sidePanels" :active-id="frame.state.activeSidePanel" :expanded="frame.state.sidebarVisible" @select="selectSide">
          <ActivityMenu v-if="!frame.layout.menuBarVisible" :items="menuItems" @execute="frame.executeCommand" />
        </ActivityRail>
        <SidePanel v-show="frame.state.sidebarVisible" :inert="maximizedBounds?.primary || undefined" :empty="!activeSide" :title="activeSide?.label ?? 'Views'" :actions="activeSide?.actions" :padded="activeSide?.children !== undefined ? false : activeSide?.padded" @context="primaryRail?.openContext($event)" @close="frame.closeSidePanel()">
          <template #actions><ViewVisibilityMenu v-if="activeSide?.children !== undefined" :view-id="activeSide.id"/></template>
          <div :id="`${contentId}-primary`" class="view-host"/>
        </SidePanel>
      </div>
        <ResizeHandle v-if="frame.state.sidebarVisible" class="primary-gap-resize" grip :style="primarySashStyle" label="Resize primary sidebar" axis="x" :value="geometry.primary" :min="160" :max="Math.max(160, bodyWidth - geometry.rail - 160)"
          :reverse="frame.layout.primarySide === 'right'" @change="frame.layout.primaryWidth = $event" @reset="frame.layout.primaryWidth = 236" />
      <section v-if="frame.workspaceBanner.value" v-show="frame.layout.bannerVisible" class="workspace-banner" :aria-label="frame.workspaceBanner.value.label" :style="{ gridColumn: geometry.bannerColumn, marginLeft: `${geometry.bannerLeftInset}px`, marginRight: `${geometry.bannerRightInset}px` }"><component :is="frame.workspaceBanner.value.component" v-bind="frame.workspaceBanner.value.props"/></section>
      <div class="canvas-container workspace-region" :style="workspaceStyle" :inert="!!maximizedBounds || undefined">
        <div class="canvas-centering" :class="{ centered: frame.layout.centered }" :style="{ '--center-width': `${frame.layout.centeredRatio * 100}%` }">
          <ResizeHandle v-if="frame.layout.centered" class="center-left" label="Resize centered content from left" axis="x" :value="frame.layout.centeredRatio" :min=".3" :max="1" reverse :scale="2 / Math.max(240, geometry.center)" :step=".02" @change="frame.layout.centeredRatio = $event" @reset="frame.layout.centeredRatio = .9" />
          <WorkspacePanes><template v-if="$slots.default" #default="scope"><slot :pane="scope.pane"/></template><template v-if="$slots['workspace-pane']" #pane="scope"><slot name="workspace-pane" :pane="scope.pane"/></template></WorkspacePanes>
          <ResizeHandle v-if="frame.layout.centered" class="center-right" label="Resize centered content from right" axis="x" :value="frame.layout.centeredRatio" :min=".3" :max="1" :scale="2 / Math.max(240, geometry.center)" :step=".02" @change="frame.layout.centeredRatio = $event" @reset="frame.layout.centeredRatio = .9" />
        </div>
      </div>
      <div v-show="geometry.secondaryRail || frame.layout.secondarySidebarVisible" class="navigation-container secondary-region shell-sidebar" :data-sidebar-side="frame.layout.primarySide==='left'?'right':'left'" :class="{expanded:frame.layout.secondarySidebarVisible,'without-rail':!geometry.secondaryRail,'sidebar-horizontal':geometry.secondaryActivityHorizontal,'activity-top':geometry.secondaryActivityHorizontal&&frame.layout.secondaryActivityBarVisible&&frame.layout.secondaryActivityBarPosition==='top','activity-bottom':geometry.secondaryActivityHorizontal&&frame.layout.secondaryActivityBarVisible&&frame.layout.secondaryActivityBarPosition==='bottom','region-maximized':frame.layout.maximizedRegion==='secondary'}" :inert="frame.layout.maximizedRegion==='bottom'&&maximizedBounds?.secondary||undefined" :style="{...secondaryStyle,...maximizedStyle('secondary')}">
        <ActivityRail @resize="measureActivity('secondary',$event)" ref="secondaryRail" region="secondary" v-show="frame.layout.secondaryActivityBarVisible && (frame.layout.secondaryActivityBarPosition==='default' || frame.layout.secondarySidebarVisible)" :panels="secondaryTabs" :active-id="frame.state.activeSecondaryTab" :expanded="frame.layout.secondarySidebarVisible" @select="frame.selectSecondaryView"/>
        <SidePanel region="secondary" v-show="frame.layout.secondarySidebarVisible" :empty="!activeSecondary" :title="activeSecondary?.label??'Secondary sidebar'" :actions="activeSecondary?.actions" :padded="activeSecondary?.children!==undefined?false:activeSecondary?.padded" @context="secondaryRail?.openContext($event)" @close="frame.closeSecondaryPanel()">
          <template #actions><ViewVisibilityMenu v-if="activeSecondary?.children!==undefined" :view-id="activeSecondary.id"/></template>
          <div :id="`${contentId}-secondary`" class="view-host"/>
        </SidePanel>
        <ResizeHandle v-show="frame.layout.secondarySidebarVisible && frame.layout.maximizedRegion !== 'secondary'" class="secondary-resize" grip label="Resize secondary sidebar" axis="x" :value="geometry.secondary" :min="160" :max="Math.max(160, bodyWidth - 160)" :reverse="frame.layout.primarySide === 'left'" @change="frame.layout.secondaryWidth = $event" @reset="frame.layout.secondaryWidth = 280" />
      </div>
      <div v-show="frame.state.panelVisible" class="bottom-region" :data-panel-position="frame.layout.panelPosition" :class="{ 'region-maximized': frame.layout.maximizedRegion === 'bottom' }" :inert="frame.layout.maximizedRegion === 'secondary' && !!maximizedBounds || undefined" :style="{...panelStyle,...maximizedStyle('bottom')}">
        <ResizeHandle v-show="frame.layout.maximizedRegion !== 'bottom'" class="panel-resize" grip label="Resize bottom panel" :axis="geometry.panelVertical?'x':'y'" :value="geometry.panelVertical?geometry.panelWidth:geometry.panel" :min="90" :max="geometry.panelVertical?Math.max(90,geometry.centerAvailable-120-geometry.gap):Math.max(90,bodyHeight-120)" :reverse="frame.layout.panelPosition==='bottom'||frame.layout.panelPosition==='right'" @change="geometry.panelVertical?frame.layout.panelWidth=$event:frame.layout.panelHeight=$event" @reset="geometry.panelVertical?frame.layout.panelWidth=320:frame.layout.panelHeight=240" />
        <BottomPanel managed :content-id="`${contentId}-bottom`" :tabs="bottomTabs" :active-id="frame.state.activeBottomTab" @select="frame.openBottomPanel" @close="frame.closeBottomPanel()" />
      </div>
    </div>
    <footer v-show="frame.layout.statusBarVisible" class="status-bar">
      <slot name="status-leading-actions"/>
      <span role="status"><span class="live-dot" /> {{ frame.state.message }}</span>
      <div class="status-spacer"/><slot name="status-actions"/>
    </footer>
    <Teleport to="body"><div :id="`${contentId}-overlays`" ref="overlayHost" class="frame-overlay-host" :style="overlayStyle"/></Teleport>
    <Teleport :to="overlayHost ?? 'body'"><FrameNotifications v-if="frame.features.notifications" :inert="frame.modals.length > 0 || undefined" :bottom="frame.layout.statusBarVisible ? (frame.layout.density === 'compact' ? 28 : 38) : 8"/><div class="frame-custom-overlays" :inert="frame.modals.length > 0 || undefined"><slot name="overlays" :bounds="overlayBounds" :target="overlayHost"/></div></Teleport>
    <OverlayScrollbars :root="root"/>
    <ViewDragOverlay/>
    <FrameModal v-for="(modal, index) in frame.modals" :key="modal.id" :title="modal.title" :icon="modal.icon" :actions="modal.actions" :bounds="body" :width="modal.width" :height="modal.height" :maximized="modal.maximized" :active="index === frame.modals.length - 1" :layer="index" @close="frame.closeModal(modal.id)"><component :is="modal.component" v-bind="modal.props"/></FrameModal>
    <div ref="contentParking" hidden/>
    <template v-if="contentReady && contentParking"><Teleport v-for="view in views" :key="view.id" :to="viewTarget(view.id)"><div v-show="viewActive(view.id)" class="view-content"><ViewSections v-if="view.children !== undefined" :view-id="view.id"/><component v-else :is="view.component" v-bind="view.props"/></div></Teleport></template>
    <FrameQuickInput v-if="quickInput" :key="quickInput.id" :items="quickInputItems" :title="quickInput.title" :placeholder="quickInput.placeholder" :position="frame.layout.quickInputPosition" @close="frame.closeQuickInput()" @accept="frame.acceptQuickInput" />
    <LayoutCustomizer v-if="layoutOpen" :fullscreen="fullscreen" :fullscreen-available="windowControls.fullscreenAvailable" @close="layoutOpen = false" @fullscreen="frame.executeCommand('frame.fullscreen')" />
  </div>
</template>





