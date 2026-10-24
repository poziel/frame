<script setup lang="ts">
import { computed, h, markRaw, watch, onBeforeUnmount, onMounted, provide, ref, useId } from "vue";
import type { Component } from "vue";
import type { Frame } from "../frame/createFrame";
import { frameKey } from "../frame/createFrame";
import { useWindowControls } from "../frame/useWindowControls";
import OverlayScrollbars from "./OverlayScrollbars.vue";
import FrameSettings from "./FrameSettings.vue";
import FrameIcon from "./FrameIcon.vue";
import FrameNotifications from "./FrameNotifications.vue";
import TitleBar from "./TitleBar.vue";
import StatusBar from "./StatusBar.vue";
import NavigationBar from "./NavigationBar.vue";
import ViewBar from "./ViewBar.vue";
import ViewVisibilityMenu from "./ViewVisibilityMenu.vue";
import ViewContent from "./ViewContent.vue";
import ViewSections from "./ViewSections.vue";
import SidePanel from "./SidePanel.vue";
import WorkspacePanes from "./WorkspacePanes.vue";
import BottomPanel from "./BottomPanel.vue";
import FrameQuickInput from "./FrameQuickInput.vue";
import WorkspaceUnsavedDialog from "./WorkspaceUnsavedDialog.vue";
import FrameModal from "./FrameModal.vue";
import ViewDragOverlay from "./ViewDragOverlay.vue";
import type { FrameMenuItem } from "../types";
import "../style.css";
import "../shell-sidebars.css";
import "../panel-docking.css";
import { layoutGeometry, maximizedRegionBounds } from "../frame/layout";
import LayoutCustomizer from "./LayoutCustomizer.vue";
import ResizeHandle from "./ResizeHandle.vue";
import ViewBarMenu from "./ViewBarMenu.vue";
import { registerShortcutOwner, matchesShortcut } from "../frame/shortcuts";
import { provideOverlayBoundary } from "../frame/overlays";

const props = withDefaults(defineProps<{ frame: Frame; titleText?: string; appIcon?: Component; appName?: string; showSearch?: boolean; menuItems?: readonly FrameMenuItem[] }>(), { titleText: "Frame (Workspace)", showSearch: true });
const frame = props.frame;
watch(() => frame.workspace.closeConfirmation.value, request => {
  const id = 'frame.workspace.unsaved';
  if (request) frame.openModal({ id, title: 'Unsaved changes', component: markRaw(WorkspaceUnsavedDialog), width: 440, height: 220,
    props: { titles: request.tabs.map(tab => tab.title), respond: request.respond } });
  else frame.closeModal(id);
}, { flush: 'sync', immediate: true });
onBeforeUnmount(() => frame.workspace.closeConfirmation.value?.respond(false));
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
const windowControls = useWindowControls(frame);
const { sidePanels, bottomTabs, secondaryTabs, quickInput, quickInputItems } = frame;
const { maximized, fullscreen } = windowControls;
const root = ref<HTMLElement>();
const body = ref<HTMLElement>();
const shellLayout = ref<HTMLElement>();
const overlayHost = ref<HTMLElement>();
// Vue owns these nodes; Frame owns only the theme declarations attached to them.
watch([root, overlayHost], ([shell, overlays], _, onCleanup) => {
  const detach = [shell, overlays].filter((node): node is HTMLElement => !!node).map(node => frame.theme.attach(node));
  onCleanup(() => detach.forEach(remove => remove()));
}, { flush: 'post' });
const { bounds: overlayBounds, style: overlayStyle } = provideOverlayBoundary(shellLayout, overlayHost);
const bodyWidth = ref(1180);
const bodyHeight = ref(720);
const bodyPadding = ref({ left: 5, right: 5, top: 1, bottom: 0 });
const layoutOpen = frame.layoutCustomizerOpen;
let observer: ResizeObserver | undefined;
const viewBarMeasurements=ref<import('../frame/layout').ViewBarMeasurements>({});
function measureViewBar(region:'primary'|'secondary',size:{width:number;height:number}) {
 const horizontal=(region==='primary'?frame.layout.primaryViewBarPosition:frame.layout.secondaryViewBarPosition)!=='default';
 viewBarMeasurements.value[region]={...viewBarMeasurements.value[region],[horizontal?'height':'width']:horizontal?size.height:size.width};
}
const geometry = computed(() => layoutGeometry({ ...frame.layout, bannerVisible: frame.layout.bannerVisible && !!frame.workspaceBanner.value }, bodyWidth.value, bodyHeight.value, viewBarMeasurements.value));
const maximizedBounds = computed(() => maximizedRegionBounds(frame.layout, bodyWidth.value, bodyHeight.value, viewBarMeasurements.value));
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
  return { gridColumn: frame.layout.primarySide === "left" ? "1" : "5", gridRow: `${!g.rail && g.panelAbovePrimary ? 5 : g.abovePrimary && !g.rail ? 3 : 1} / ${g.underPrimary && !g.rail ? 4 : 6}`, width: g.narrow ? `${g.primary + g.rail}px` : undefined, "--rail-width": `${g.rail}px`, "--view-bar-height": `${g.viewBarHeight}px`, "--workspace-top": `${top}px`, "--workspace-bottom": `${bottom}px`, "--workspace-height": `calc(100% - ${top + bottom}px)`, ...(g.narrow && !g.rail ? { top: `${sidebarTop(g.panelAbovePrimary,g.abovePrimary)}px`, bottom: `${g.underPrimary ? g.panel + g.gap : 0}px` } : {}) };
});
const secondaryStyle = computed(() => {
 const g=geometry.value;
 const top=g.secondaryRail?sidebarTop(g.panelAboveSecondary,g.aboveSecondary):0;
 const bottom=g.underSecondary&&g.secondaryRail?g.panel+g.gap:0;
 return {gridColumn:frame.layout.primarySide==='left'?'5':'1',gridRow:`${g.panelAboveSecondary&&!g.secondaryRail?5:g.aboveSecondary&&!g.secondaryRail?3:1} / ${g.underSecondary&&!g.secondaryRail?4:6}`,width:g.narrow?`${g.secondary+g.secondaryRail}px`:undefined,'--rail-width':`${g.secondaryRail}px`,'--view-bar-height':`${g.secondaryViewBarHeight}px`,'--workspace-top':`${top}px`,'--workspace-bottom':`${bottom}px`,'--workspace-height':`calc(100% - ${top+bottom}px)`,...(g.narrow&&!g.secondaryRail?{top:`${sidebarTop(g.panelAboveSecondary,g.aboveSecondary)}px`,bottom:`${g.underSecondary?g.panel+g.gap:0}px`}:{})};
});
const primaryRail=ref<{openContext:(event:MouseEvent)=>void}>();
const secondaryRail=ref<{openContext:(event:MouseEvent)=>void}>();
const activeSecondary=computed(()=>secondaryTabs.value.find(tab=>tab.id===frame.state.activeSecondaryTab&&frame.secondaryViewBar.isVisible(tab.id)));
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
const menuItems = computed<readonly FrameMenuItem[]>(() => frame.resolveMenuItems(props.menuItems ?? [
  { id: "view", label: "View", children: [
    { id: "commands", label: "Frame commands…", command: "frame.commands", shortcut: "Ctrl+Shift+P" },
    { id: "views", label: "Open view", children: sidePanels.value.map(panel => ({ id: panel.id, label: panel.label, command: frame.getViewCommand(panel.id) })) },
    ...frame.commands.value.filter(command => command.group === "View" && !command.id.startsWith("frame.")).map(command => ({ id: command.id, label: command.label, command: command.id, shortcut: command.shortcut, disabled: !frame.commands.isEnabled(command.id) })),
  ] },
  { id: "layout", label: "Layout", children: [
    { id: "customize", label: "Customize layout…", command: "frame.layout.customize" },
    {id:'primary-view-bar',label:'Primary View Bar',command:'frame.primaryViewBar.toggle',checked:frame.layout.primaryViewBarVisible},
    {id:'secondary-view-bar',label:'Secondary View Bar',command:'frame.secondaryViewBar.toggle',checked:frame.layout.secondaryViewBarVisible},
    {id:'panel-view-bar',label:'Panel View Bar',command:'frame.panelViewBar.toggle',checked:frame.panelViewBar.visible.value},
    {id:'navigation-bar',label:'Navigation Bar',command:'frame.navigationBar.toggle',checked:frame.navigationBar.visible.value},
    { id: "separator-layout", type: "separator" },
    { id: "sidebar", label: "Primary sidebar", command: "frame.sidebar.toggle", checked: frame.state.sidebarVisible, shortcut: "Ctrl+B" },
    { id: "secondary", label: "Secondary sidebar", command: "frame.secondary.toggle", checked: frame.layout.secondarySidebarVisible, shortcut: "Ctrl+Alt+B" },
    { id: "bottom", label: "Panel", command: "frame.panel.toggle", checked: frame.state.panelVisible, shortcut: "Ctrl+J" },
  ] },
  { id: "window", label: "Window", children: [
    { id: "fullscreen", label: "Full screen", command: "frame.fullscreen", checked: fullscreen.value, disabled: !windowControls.fullscreenAvailable.value, shortcut: "F11" },
    { id: "minimize", label: "Minimize", command: "frame.window.minimize", disabled: !windowControls.supports("minimize") },
    { id: "maximize", label: "Maximize or restore", command: "frame.window.maximize", disabled: !windowControls.supports("maximize") },
    { id: "close", label: "Close window", command: "frame.window.close", disabled: !windowControls.supports("close") },
  ] },
]));
function selectSide(id: string) { void frame.commands.execute(`frame.view.select.${id}`); }
function onKey(event: KeyboardEvent) {
  if (event.isComposing || event.defaultPrevented) return;
  const target = event.target instanceof Element ? event.target : document.activeElement;
  if (!target) return;
  if (frame.dragState.active) return;
  if (event.key === "Escape" && !quickInput.value && !layoutOpen.value && frame.layout.zenMode) { frame.setZenMode(false); return; }
  const choice = quickInput.value?.mode === "pick" && quickInputItems.value.find(item => !item.disabled && item.shortcut && matchesShortcut(event, item.shortcut));
  if (choice) { event.preventDefault(); event.stopPropagation(); frame.acceptQuickInput(choice.id); return; }
  const command = frame.commands.value.find(item => item.shortcut && matchesShortcut(event, item.shortcut) && frame.commands.isEnabled(item.id));
  if (command && frame.commands.isEnabled(command.id)) { event.preventDefault(); event.stopPropagation(); layoutOpen.value = false; frame.closeQuickInput(); void frame.executeCommand(command.id); }
}
onMounted(() => {
  cleanups.push(registerShortcutOwner({ owns: target => !!root.value?.contains(target) || !!overlayHost.value?.contains(target), handle: onKey }, document)); frame.record("Workspace ready");
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
  observer?.disconnect();
  frame.cancelViewDrag(); frame.closeQuickInput();
  cleanups.reverse().forEach(cleanup => cleanup());
});
</script>
<template>
  <div ref="root" class="workbench" :data-frame-overlay-host="`${contentId}-overlays`" :inert="frame.modals.length > 0 || undefined" @contextmenu.prevent :class="{ 'dragging-views': frame.dragState.active, compact: frame.layout.density === 'compact', zen: frame.layout.zenMode }"
    :style="{ gridTemplateRows: `34px minmax(0,1fr) ${frame.layout.statusBarVisible ? (frame.layout.density === 'compact' ? 24 : 34) : 0}px` }">
    <a class="skip-link" href="#workspace">Skip to workspace</a>
    <TitleBar :sidebar-visible="frame.state.sidebarVisible" :secondary-visible="frame.layout.secondarySidebarVisible" :panel-visible="frame.state.panelVisible" :maximized="maximized"
      :app-icon="appIcon" :app-name="appName" :menu-items="menuItems" :title-text="titleText" :show-search="showSearch" :menu-bar-visible="frame.layout.menuBarVisible"
      :zen-mode="frame.layout.zenMode" :primary-side="frame.layout.primarySide" @commands="layoutOpen = false; frame.openQuickInput()" @execute="frame.executeCommand" />
    <div ref="shellLayout" class="workbench-layout" :data-nav-position="frame.navigationBar.position.value" :class="{'has-navigation-bar':frame.navigationBar.visible.value}">
    <div v-show="frame.navigationBar.visible.value" class="navigation-bar-container"><NavigationBar/></div>
    <div ref="body" class="workbench-body layout-grid" :class="{ narrow: geometry.narrow, 'primary-right': frame.layout.primarySide === 'right' }" :style="bodyStyle">
      <div v-show="geometry.rail || frame.state.sidebarVisible" class="navigation-container primary-region shell-sidebar" :data-sidebar-side="frame.layout.primarySide"
        :class="{ expanded: frame.state.sidebarVisible, 'edge-regions': (geometry.underPrimary || geometry.abovePrimary) && geometry.rail > 0, 'without-rail': !geometry.rail, 'view-bar-top': geometry.viewBarHorizontal && frame.layout.primaryViewBarVisible && frame.layout.primaryViewBarPosition === 'top', 'view-bar-bottom': geometry.viewBarHorizontal && frame.layout.primaryViewBarVisible && frame.layout.primaryViewBarPosition === 'bottom', 'sidebar-horizontal': geometry.viewBarHorizontal }" :style="primaryStyle">
        <ViewBar @resize="measureViewBar('primary',$event)" ref="primaryRail" v-show="frame.layout.primaryViewBarVisible && (frame.layout.primaryViewBarPosition==='default' || frame.state.sidebarVisible)" :panels="sidePanels" :active-id="frame.state.activeSidePanel" :expanded="frame.state.sidebarVisible" @select="selectSide">
          <ViewBarMenu v-if="frame.menuBar.available && !frame.layout.menuBarVisible" :items="menuItems" @execute="frame.executeCommand" />
        </ViewBar>
        <SidePanel v-show="frame.state.sidebarVisible" :inert="maximizedBounds?.primary || undefined" :empty="!activeSide" :title="activeSide?.label ?? 'Views'" :actions="activeSide?.actions" :padded="activeSide?.children !== undefined || activeSide?.top || activeSide?.bottom ? false : activeSide?.padded" @context="primaryRail?.openContext($event)" @close="frame.commands.execute('frame.sidebar.close')">
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
          <WorkspacePanes><template v-if="$slots.default" #default="scope"><slot :pane="scope.pane"/></template><template v-if="$slots['workspace-pane']" #pane="scope"><slot name="workspace-pane" :pane="scope.pane"/></template><template v-if="$slots['workspace-tab']" #tab="scope"><slot name="workspace-tab" v-bind="scope"/></template><template v-if="$slots['workspace-tab-empty']" #empty="scope"><slot name="workspace-tab-empty" v-bind="scope"/></template><template v-if="$slots['workspace-tab-actions']" #actions="scope"><slot name="workspace-tab-actions" v-bind="scope"/></template></WorkspacePanes>
          <ResizeHandle v-if="frame.layout.centered" class="center-right" label="Resize centered content from right" axis="x" :value="frame.layout.centeredRatio" :min=".3" :max="1" :scale="2 / Math.max(240, geometry.center)" :step=".02" @change="frame.layout.centeredRatio = $event" @reset="frame.layout.centeredRatio = .9" />
        </div>
      </div>
      <div v-show="geometry.secondaryRail || frame.layout.secondarySidebarVisible" class="navigation-container secondary-region shell-sidebar" :data-sidebar-side="frame.layout.primarySide==='left'?'right':'left'" :class="{expanded:frame.layout.secondarySidebarVisible,'without-rail':!geometry.secondaryRail,'sidebar-horizontal':geometry.secondaryViewBarHorizontal,'view-bar-top':geometry.secondaryViewBarHorizontal&&frame.layout.secondaryViewBarVisible&&frame.layout.secondaryViewBarPosition==='top','view-bar-bottom':geometry.secondaryViewBarHorizontal&&frame.layout.secondaryViewBarVisible&&frame.layout.secondaryViewBarPosition==='bottom','region-maximized':frame.layout.maximizedRegion==='secondary'}" :inert="frame.layout.maximizedRegion==='bottom'&&maximizedBounds?.secondary||undefined" :style="{...secondaryStyle,...maximizedStyle('secondary')}">
        <ViewBar @resize="measureViewBar('secondary',$event)" ref="secondaryRail" region="secondary" v-show="frame.layout.secondaryViewBarVisible && (frame.layout.secondaryViewBarPosition==='default' || frame.layout.secondarySidebarVisible)" :panels="secondaryTabs" :active-id="frame.state.activeSecondaryTab" :expanded="frame.layout.secondarySidebarVisible" @select="id => frame.commands.execute(`frame.view.select.${id}`)"/>
        <SidePanel region="secondary" v-show="frame.layout.secondarySidebarVisible" :empty="!activeSecondary" :title="activeSecondary?.label??'Secondary sidebar'" :actions="activeSecondary?.actions" :padded="activeSecondary?.children!==undefined || activeSecondary?.top || activeSecondary?.bottom ? false : activeSecondary?.padded" @context="secondaryRail?.openContext($event)" @close="frame.commands.execute('frame.secondary.close')">
          <template #actions><ViewVisibilityMenu v-if="activeSecondary?.children!==undefined" :view-id="activeSecondary.id"/></template>
          <div :id="`${contentId}-secondary`" class="view-host"/>
        </SidePanel>
        <ResizeHandle v-show="frame.layout.secondarySidebarVisible && frame.layout.maximizedRegion !== 'secondary'" class="secondary-resize" grip label="Resize secondary sidebar" axis="x" :value="geometry.secondary" :min="160" :max="Math.max(160, bodyWidth - 160)" :reverse="frame.layout.primarySide === 'left'" @change="frame.layout.secondaryWidth = $event" @reset="frame.layout.secondaryWidth = 280" />
      </div>
      <div v-show="frame.state.panelVisible" class="bottom-region" :data-panel-position="frame.layout.panelPosition" :class="{ 'region-maximized': frame.layout.maximizedRegion === 'bottom' }" :inert="frame.layout.maximizedRegion === 'secondary' && !!maximizedBounds || undefined" :style="{...panelStyle,...maximizedStyle('bottom')}">
        <ResizeHandle v-show="frame.layout.maximizedRegion !== 'bottom'" class="panel-resize" grip label="Resize panel" :axis="geometry.panelVertical?'x':'y'" :value="geometry.panelVertical?geometry.panelWidth:geometry.panel" :min="90" :max="geometry.panelVertical?Math.max(90,geometry.centerAvailable-120-geometry.gap):Math.max(90,bodyHeight-120)" :reverse="frame.layout.panelPosition==='bottom'||frame.layout.panelPosition==='right'" @change="geometry.panelVertical?frame.layout.panelWidth=$event:frame.layout.panelHeight=$event" @reset="geometry.panelVertical?frame.layout.panelWidth=320:frame.layout.panelHeight=240" />
        <BottomPanel managed :content-id="`${contentId}-bottom`" :tabs="bottomTabs" :active-id="frame.state.activeBottomTab" @select="id => frame.commands.execute(`frame.view.select.${id}`)" @close="frame.commands.execute('frame.panel.close')" />
      </div>
    </div>
    </div>
    <StatusBar><template #leading><slot name="status-leading-actions" /></template><template #actions><slot name="status-actions" /></template></StatusBar>
    <Teleport to="body"><div :id="`${contentId}-overlays`" ref="overlayHost" class="frame-overlay-host" :style="overlayStyle"/></Teleport>
    <Teleport :to="overlayHost ?? 'body'"><FrameNotifications v-if="frame.features.notifications" :inert="frame.modals.length > 0 || undefined" :bottom="frame.layout.statusBarVisible ? (frame.layout.density === 'compact' ? 28 : 38) : 8"/><div class="frame-custom-overlays" :inert="frame.modals.length > 0 || undefined"><slot name="overlays" :bounds="overlayBounds" :target="overlayHost"/></div></Teleport>
    <OverlayScrollbars :root="root"/>
    <ViewDragOverlay/>
    <FrameModal v-for="(modal, index) in frame.modals" :key="modal.id" :title="modal.title" :icon="modal.icon" :actions="modal.actions" :bounds="body" :width="modal.width" :height="modal.height" :min-height="modal.minHeight" :maximized="modal.maximized" :content-padding="modal.contentPadding" :draggable="modal.draggable" :resizable="modal.resizable" :maximizable="modal.maximizable" :active="index === frame.modals.length - 1" :layer="index" @close="frame.closeModal(modal.id)"><component :is="modal.component" v-bind="modal.props"/><template v-if="modal.footer" #footer><component :is="modal.footer" v-bind="modal.footerProps"/></template></FrameModal>
    <div ref="contentParking" hidden/>
    <template v-if="contentReady && contentParking"><Teleport v-for="view in views" :key="view.id" :to="viewTarget(view.id)"><div v-show="viewActive(view.id)" class="view-content" :class="{ 'view-content-slotted': view.top || view.bottom }"><ViewContent v-if="view.top || view.bottom" :view="view"><ViewSections v-if="view.children !== undefined" :view-id="view.id"/><component v-else :is="view.component" v-bind="view.props"/></ViewContent><ViewSections v-else-if="view.children !== undefined" :view-id="view.id"/><component v-else :is="view.component" v-bind="view.props"/></div></Teleport></template>
    <FrameQuickInput v-if="quickInput" :key="quickInput.id" :items="quickInputItems" :mode="quickInput.mode" :category="quickInput.category" :categories="frame.commands.categories.list()" @mode="frame.setQuickInputMode" :title="quickInput.title" :placeholder="quickInput.placeholder" :position="frame.layout.quickInputPosition" @close="frame.closeQuickInput()" @accept="frame.acceptQuickInput" />
    <LayoutCustomizer v-if="layoutOpen" :fullscreen="fullscreen" :fullscreen-available="windowControls.fullscreenAvailable.value" @close="layoutOpen = false" @fullscreen="frame.executeCommand('frame.fullscreen')" />
  </div>
</template>





