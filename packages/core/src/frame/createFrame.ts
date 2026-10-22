import { computed, inject, markRaw, nextTick, reactive, shallowReactive, shallowRef, watch } from "vue";
import type { InjectionKey } from "vue";
import { createViewDrag } from "./viewDrag";
import { createSettings } from "./settings";
import { createNotifications } from "./notifications";
import type { ActivityAction, FrameOptions, FrameMenuItem } from "../types";
import { createWorkspace } from "./workspace";
import { createNavigation } from "./navigation";
import { defaultLayout, type LayoutState } from "./layout";
import type { ActivityEntry, Command, PanelDefinition, QuickPickItem, QuickPickOptions, SidePanelDefinition, ViewRegion, ToolbarAction, WorkspaceBannerDefinition, ModalDefinition } from "../types";

/** One isolated workbench per shell. Contributions return an unregister function. */
export function createFrame(options: FrameOptions = {}) {
  const activityActions = shallowReactive<ActivityAction[]>([]);
  function registerActivityAction(action: ActivityAction) {
    if (activityActions.some(item => item.id === action.id)) throw new Error(`Duplicate activity action: ${action.id}`);
    const definition = { ...action, icon: action.icon ? markRaw(action.icon) : undefined };
    activityActions.push(definition);
    return () => { const index = activityActions.indexOf(definition); if (index >= 0) activityActions.splice(index, 1); };
  }
  const features = reactive({ settings: options.settings ?? true, notifications: options.notifications ?? true, navigation: options.navigation ?? false });
  const settings = createSettings();
  const notifications = createNotifications();
  const settingsRequest = shallowRef(0);
  const manageMenuItems = shallowRef<readonly FrameMenuItem[]>([{ id: "settings", label: "Settings", command: "frame.settings", shortcut: "Ctrl+," }]);
  function openSettings() { if (features.settings) { closeQuickInput(); settingsRequest.value++; } }

  const workspace = createWorkspace();
  const workspaceBanner = shallowRef<WorkspaceBannerDefinition>();
  function registerWorkspaceBanner(banner: WorkspaceBannerDefinition) {
    if (workspaceBanner.value) throw new Error("A banner is already registered");
    const definition = { ...banner, component: markRaw(banner.component) };
    workspaceBanner.value = definition;
    return () => { if (workspaceBanner.value === definition) { workspaceBanner.value = undefined; layout.bannerVisible = false; } };
  }
  function openWorkspaceBanner() { if (workspaceBanner.value) layout.bannerVisible = true; }
  function closeWorkspaceBanner() { layout.bannerVisible = false; }
  function toggleWorkspaceBanner() { if (workspaceBanner.value) layout.bannerVisible = !layout.bannerVisible; }
  const modals = shallowReactive<ModalDefinition[]>([]);
  function closeModal(id = modals[modals.length - 1]?.id) {
    const index = modals.findIndex(modal => modal.id === id);
    if (index >= 0) modals.splice(index, 1);
  }
  function openModal(modal: ModalDefinition) {
    viewDrag.cancel(); closeQuickInput();
    let definition = modals.find(item => item.id === modal.id);
    if (definition) { modals.splice(modals.indexOf(definition), 1); modals.push(definition); }
    else { definition = { ...modal, component: markRaw(modal.component), icon: modal.icon ? markRaw(modal.icon) : undefined }; modals.push(definition); }
    const current = definition;
    return { id: current.id, close: () => { if (modals.includes(current)) closeModal(current.id); } };
  }
  const interaction = reactive({ dragging: true, primary: true, secondary: true, bottom: true });
  const toolbarActions = shallowReactive<ToolbarAction[]>([]);
  function registerToolbarAction(action: ToolbarAction) {
    if (toolbarActions.some(item => item.id === action.id)) throw new Error(`Toolbar action already registered: ${action.id}`);
    const definition = reactive({ ...action, icon: action.icon ? markRaw(action.icon) : undefined, visible: action.visible ?? false });
    toolbarActions.push(definition);
    return () => { const index = toolbarActions.indexOf(definition); if (index >= 0) toolbarActions.splice(index, 1); };
  }
  const layout = reactive(defaultLayout());
  let beforeZen: Pick<LayoutState, "menuBarVisible" | "activityBarVisible" | "primarySidebarVisible" | "secondarySidebarVisible" | "panelVisible" | "statusBarVisible" | "bannerVisible" | "centered"> | undefined;
  const secondaryMap = shallowReactive(new Map<string, PanelDefinition>());
  const commandMap = shallowReactive(new Map<string, Command>());
  const sideMap = shallowReactive(new Map<string, SidePanelDefinition>());
  const tabMap = shallowReactive(new Map<string, PanelDefinition>());
  const viewMap = shallowReactive(new Map<string, SidePanelDefinition>());
  const viewCommands = shallowReactive(new Map<string, string>());
  function getViewCommand(id: string) { return viewCommands.get(id); }
  const viewParents = shallowReactive(new Map<string, string>());
  const childIds = shallowReactive(new Map<string, string[]>());
  const menuState = reactive({ collapsed: {} as Record<string, boolean>, heights: {} as Record<string, number> });
  const contentHosts = shallowReactive(new Map<string, HTMLElement>());
  const views = computed(() => [...viewMap.values()]);
  const maps = { primary: sideMap, secondary: secondaryMap, bottom: tabMap };
  function getViewChildren(id: string) { return (childIds.get(id) ?? []).map(child => viewMap.get(child)!).filter(Boolean); }
  function getViewParent(id: string) { return viewParents.get(id); }
  function viewRegion(id: string): ViewRegion | undefined {
    while (viewParents.has(id)) id = viewParents.get(id)!;
    return (Object.keys(maps) as ViewRegion[]).find(region => maps[region].has(id));
  }
  function repairSelections() {
    if (!sideMap.has(state.activeSidePanel)) state.activeSidePanel = sideMap.keys().next().value ?? "";
    if (!tabMap.has(state.activeBottomTab)) state.activeBottomTab = tabMap.keys().next().value ?? "";
    if (!secondaryMap.has(state.activeSecondaryTab)) state.activeSecondaryTab = secondaryMap.keys().next().value ?? "";
  }
  function detachView(id: string) {
    const parent = viewParents.get(id);
    if (parent) childIds.set(parent, (childIds.get(parent) ?? []).filter(child => child !== id));
    else for (const map of Object.values(maps)) map.delete(id);
    viewParents.delete(id);
  }
  const state = reactive({
    get sidebarVisible() { return layout.primarySidebarVisible; },
    set sidebarVisible(value: boolean) { layout.primarySidebarVisible = value; },
    get panelVisible() { return layout.panelVisible; },
    set panelVisible(value: boolean) { layout.panelVisible = value; },
    activeSidePanel: "",
    activeBottomTab: "",
    activeSecondaryTab: "",
    entries: [] as ActivityEntry[],
    message: "Ready",
  });
  function captureLocation() {
    return { panes: [...workspace.panes.value], active: workspace.activePane.value,
      primary: state.activeSidePanel, secondary: state.activeSecondaryTab, bottom: state.activeBottomTab,
      primaryVisible: layout.primarySidebarVisible, secondaryVisible: layout.secondarySidebarVisible, bottomVisible: layout.panelVisible,
      collapsed: { ...menuState.collapsed } };
  }
  const navigation = createNavigation({
    enabled: () => features.navigation,
    capture: captureLocation,
    equal: (a, b) => a.active === b.active && a.primary === b.primary && a.secondary === b.secondary && a.bottom === b.bottom
      && a.primaryVisible === b.primaryVisible && a.secondaryVisible === b.secondaryVisible && a.bottomVisible === b.bottomVisible
      && a.panes.length === b.panes.length && a.panes.every((pane, i) => {
        const other = b.panes[i];
        return other && pane.id === other.id && pane.component === other.component && pane.label === other.label
          && Object.keys(pane.props ?? {}).length === Object.keys(other.props ?? {}).length
          && Object.entries(pane.props ?? {}).every(([key, value]) => Object.is(value, other.props?.[key]));
      }) && Object.keys(a.collapsed).every(id => a.collapsed[id] === b.collapsed[id]),
    restore: location => {
      // Navigate content without undoing splits, resizing, or closing panes.
      for (const pane of location.panes) if (workspace.panes.value.some(current => current.id === pane.id)) setPane(pane.id, pane);
      workspace.focus(location.active);
      if (sideMap.has(location.primary)) state.activeSidePanel = location.primary;
      if (secondaryMap.has(location.secondary)) state.activeSecondaryTab = location.secondary;
      if (tabMap.has(location.bottom)) state.activeBottomTab = location.bottom;
      layout.primarySidebarVisible = location.primaryVisible;
      layout.secondarySidebarVisible = location.secondaryVisible;
      layout.panelVisible = location.bottomVisible;
      for (const id of Object.keys(location.collapsed)) if (viewMap.has(id)) menuState.collapsed[id] = location.collapsed[id]!;
    },
  });
  const setPane = workspace.setPane;
  workspace.setPane = (id, content) => navigation.record(() => setPane(id, content));
  const resetWorkspace = () => navigation.record(workspace.reset);
  const stopNavigationWatch = watch(() => features.navigation, enabled => { if (!enabled) navigation.clear(); }, { flush: "sync" });
  const stopMaximizedWatch = watch(() => [layout.panelVisible, layout.secondarySidebarVisible], () => {
    if ((layout.maximizedRegion === "bottom" && !layout.panelVisible) || (layout.maximizedRegion === "secondary" && !layout.secondarySidebarVisible)) layout.maximizedRegion = null;
  }, { flush: "sync" });
  const quickInput = shallowRef<{
    id: number;
    title: string;
    placeholder: string;
    searchable: boolean;
    items: readonly QuickPickItem[] | null;
    finish: (item?: QuickPickItem) => void;
  } | null>(null);
  let logId = 0;
  let requestId = 0;
  const commands = computed(() => [...commandMap.values()]);
  const sidePanels = computed(() => [...sideMap.values()]);
  const secondaryTabs = computed(() => [...secondaryMap.values()]);
  const bottomTabs = computed(() => [...tabMap.values()]);
  const commandItems = computed<QuickPickItem[]>(() => commands.value.map(command => ({
    id: command.id, label: command.label, detail: command.detail, shortcut: command.shortcut,
    disabled: command.enabled ? !command.enabled() : false,
  })));
  const quickInputItems = computed(() => quickInput.value?.items ?? commandItems.value);

  function canMoveView(id: string, destination: ViewRegion, parentId?: string) {
    const source = viewRegion(id);
    const view = viewMap.get(id);
    if (!view || !source || !interaction.dragging || !interaction[source] || !interaction[destination]) return false;
    const parent = viewParents.get(id);
    if (view.draggable === false || ((source !== destination || parent !== parentId) && view.movable === false)) return false;
    if (parentId) {
      if (!childIds.has(parentId) || viewRegion(parentId) !== destination) return false;
      let ancestor: string | undefined = parentId;
      while (ancestor) { if (ancestor === id) return false; ancestor = viewParents.get(ancestor); }
    }
    return true;
  }
  function moveView(id: string, destination: ViewRegion, before?: string, parentId?: string) {
    if (!canMoveView(id, destination, parentId)) return false;
    const source = viewRegion(id)!;
    const parent = viewParents.get(id);
    const view = viewMap.get(id)!;
    if (before === id && parent === parentId && source === destination) return true;
    detachView(id);
    if (parentId) {
      const ids = [...childIds.get(parentId)!];
      const index = before ? ids.indexOf(before) : -1;
      ids.splice(index < 0 ? ids.length : index, 0, id);
      childIds.set(parentId, ids); viewParents.set(id, parentId);
    } else {
      const entries = [...maps[destination].entries()];
      const index = before ? entries.findIndex(([key]) => key === before) : -1;
      entries.splice(index < 0 ? entries.length : index, 0, [id, view]);
      maps[destination].clear(); entries.forEach(([key, item]) => maps[destination].set(key, item));
    }
    repairSelections(); openView(id);
    return true;
  }
  async function viewKey(event: KeyboardEvent, id: string, region: ViewRegion) {
    if (!event.altKey) return;
    if (event.shiftKey && ["ArrowLeft", "ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      const moved = moveView(id, event.key === "ArrowLeft" ? "primary" : event.key === "ArrowRight" ? "secondary" : "bottom");
      if (moved) {
        await nextTick();
        [...document.querySelectorAll<HTMLElement>("[data-view-id]")].find(element => element.dataset.viewId === id)?.focus();
      }
    } else if (["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      const parent = viewParents.get(id);
      const ids = parent ? childIds.get(parent)! : [...maps[region].keys()]; const index = ids.indexOf(id);
      if (event.key === "ArrowUp" && index > 0) moveView(id, region, ids[index - 1], parent);
      if (event.key === "ArrowDown" && index < ids.length - 1) moveView(id, region, ids[index + 2], parent);
    }
  }
  function revealRegion(region: ViewRegion) {
    if (region === "primary") layout.primarySidebarVisible = true;
    else if (region === "secondary") layout.secondarySidebarVisible = true;
    else layout.panelVisible = true;
  }
  const viewDrag = createViewDrag({
    view: id => viewMap.get(id), siblings: (region, parent) => parent ? [...childIds.get(parent) ?? []] : [...maps[region].keys()],
    canMove: canMoveView, move: moveView, activate: openView, reveal: revealRegion,
    closed: region => region === "primary" ? !layout.primarySidebarVisible : region === "secondary" ? !layout.secondarySidebarVisible : !layout.panelVisible,
    primarySide: () => layout.primarySide, enabled: region => interaction.dragging && interaction[region],
  });
  const beginViewDrag = viewDrag.begin;
  function dragView(event: DragEvent, id: string, region: ViewRegion) {
    const view = viewMap.get(id);
    if (!interaction.dragging || !interaction[region] || view?.draggable === false) { event.preventDefault(); return; }
    event.dataTransfer?.setData("application/x-frame-view", id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  }
  function dropView(event: DragEvent, region: ViewRegion, before?: string) {
    event.preventDefault(); event.stopPropagation();
    const id = event.dataTransfer?.getData("application/x-frame-view");
    if (id) moveView(id, region, before, (event.target as HTMLElement)?.closest<HTMLElement>("[data-view-parent]")?.dataset.viewParent);
  }
  function record(message: string) {
    state.entries.push({ id: ++logId, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), message });
    if (state.entries.length > 100) state.entries.shift();
  }
  function registerCommand(command: Command) {
    if (commandMap.has(command.id)) throw new Error(`Command already registered: ${command.id}`);
    const definition = { ...command };
    commandMap.set(command.id, definition);
    return () => { if (commandMap.get(command.id) === definition) commandMap.delete(command.id); };
  }
  function openView(id: string) {
    return navigation.record(() => {
      if (!viewMap.has(id)) throw new Error(`Unknown view: ${id}`);
      let root = id;
      menuState.collapsed[root] = false;
      while (viewParents.has(root)) { root = viewParents.get(root)!; menuState.collapsed[root] = false; }
      if (sideMap.has(root)) openSidePanel(root);
      else if (tabMap.has(root)) openBottomPanel(root);
      else if (secondaryMap.has(root)) openSecondaryPanel(root);
    });
  }
  function registerView(input: SidePanelDefinition, region: ViewRegion) {
    const inputs: { view: SidePanelDefinition; parent?: string; command: string }[] = [];
    const seen = new Set<string>();
    function validate(view: SidePanelDefinition, parent?: string) {
      if (seen.has(view.id) || viewMap.has(view.id)) throw new Error(`View already registered: ${view.id}`);
      seen.add(view.id);
      if (!!view.component === (view.children !== undefined)) throw new Error(`View ${view.id} must supply either component or children`);
      const prefix = parent ? "frame.view" : region === "primary" ? "frame.side" : region === "bottom" ? "frame.tab" : "frame.secondary";
      const command = `${prefix}.${view.id}`;
      if (commandMap.has(command)) throw new Error(`Command already registered: ${command}`);
      inputs.push({ view, parent, command });
      view.children?.forEach(child => validate(child, view.id));
    }
    validate(input);
    const owned: { definition: SidePanelDefinition; removeCommand: () => void }[] = [];
    for (const { view, parent, command } of inputs) {
      if (view.children !== undefined) childIds.set(view.id, view.children.map(child => child.id));
      const definition: SidePanelDefinition = {
        ...view, component: view.component ? markRaw(view.component) : undefined, icon: view.icon ? markRaw(view.icon) : undefined,
        get children() { return childIds.has(view.id) ? getViewChildren(view.id) : undefined; },
      };
      viewMap.set(view.id, definition); viewCommands.set(view.id, command);
      menuState.collapsed[view.id] = view.collapsed ?? false;
      if (parent) viewParents.set(view.id, parent); else maps[region].set(view.id, definition);
      const removeCommand = registerCommand({ id: command, label: `${parent || region === "primary" ? "View: " : region === "bottom" ? "Panel: Show " : "Secondary panel: Show "}${view.label}`, group: "View", run: () => openView(view.id) });
      owned.push({ definition, removeCommand });
    }
    repairSelections();
    return () => {
      const removing = new Set(owned.filter(({ definition }) => viewMap.get(definition.id) === definition).map(({ definition }) => definition.id));
      if (!removing.size) return;
      // Foreign menus dropped into this contribution keep their own registration.
      for (const id of removing) for (const child of childIds.get(id) ?? []) {
        if (!removing.has(child)) {
          const region = viewRegion(id) ?? "primary";
          detachView(child); maps[region].set(child, viewMap.get(child)!);
        }
      }
      for (const { definition, removeCommand } of owned) if (removing.has(definition.id)) {
        detachView(definition.id); viewMap.delete(definition.id); viewCommands.delete(definition.id); childIds.delete(definition.id); contentHosts.delete(definition.id); delete menuState.collapsed[definition.id]; delete menuState.heights[definition.id]; removeCommand();
      }
      repairSelections();
    };
  }
  function registerSidePanel(panel: SidePanelDefinition) { return registerView(panel, "primary"); }
  function registerBottomTab(tab: PanelDefinition) { return registerView(tab, "bottom"); }
  function registerSecondaryTab(tab: PanelDefinition) { return registerView(tab, "secondary"); }
  function openSecondaryPanel(id = state.activeSecondaryTab) {
    return navigation.record(() => {
      if (!id && !secondaryMap.size) { layout.secondarySidebarVisible = true; return; }
      if (!secondaryMap.has(id)) throw new Error(`Unknown secondary tab: ${id}`);
      state.activeSecondaryTab = id; layout.secondarySidebarVisible = true;
    });
  }
  function toggleSecondaryPanel() {
    if (layout.secondarySidebarVisible) layout.secondarySidebarVisible = false;
    else openSecondaryPanel();
  }
  function setZenMode(enabled: boolean) {
    if (enabled === layout.zenMode) return;
    if (enabled) {
      beforeZen = {
        menuBarVisible: layout.menuBarVisible, activityBarVisible: layout.activityBarVisible,
        primarySidebarVisible: layout.primarySidebarVisible, secondarySidebarVisible: layout.secondarySidebarVisible,
        panelVisible: layout.panelVisible, bannerVisible: layout.bannerVisible, statusBarVisible: layout.statusBarVisible, centered: layout.centered,
      };
      Object.assign(layout, { menuBarVisible: false, activityBarVisible: false, primarySidebarVisible: false, secondarySidebarVisible: false, panelVisible: false, bannerVisible: false, statusBarVisible: false, centered: true, zenMode: true });
    } else {
      if (beforeZen) Object.assign(layout, beforeZen);
      layout.zenMode = false; beforeZen = undefined;
    }
  }
  function resetLayout() { beforeZen = undefined; Object.assign(layout, defaultLayout()); }
  function openSidePanel(id = state.activeSidePanel) {
    return navigation.record(() => {
      if (!id && !sideMap.size) { state.sidebarVisible = true; return; }
      if (!sideMap.has(id)) throw new Error(`Unknown side panel: ${id}`);
      state.activeSidePanel = id;
      state.sidebarVisible = true;
    });
  }
  function closeSidePanel() { state.sidebarVisible = false; }
  function toggleSidePanel() {
    if (!state.sidebarVisible && !sideMap.has(state.activeSidePanel)) state.activeSidePanel = sideMap.keys().next().value ?? "";
    state.sidebarVisible = !state.sidebarVisible;
  }
  function openBottomPanel(id = state.activeBottomTab) {
    return navigation.record(() => {
      if (!id && !tabMap.size) { state.panelVisible = true; return; }
      if (!tabMap.has(id)) throw new Error(`Unknown bottom tab: ${id}`);
      state.activeBottomTab = id;
      state.panelVisible = true;
    });
  }
  function closeBottomPanel() { state.panelVisible = false; }
  function toggleBottomPanel() {
    if (!state.panelVisible) openBottomPanel();
    else closeBottomPanel();
  }
  function closeQuickInput() {
    const current = quickInput.value;
    quickInput.value = null;
    current?.finish();
  }
  async function executeCommand(id: string) {
    const command = commandMap.get(id);
    if (!command || (command.enabled && !command.enabled())) return;
    try {
      await command.run();
    } catch (error) {
      state.message = `Could not run ${command.label}`;
      record(`${state.message}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  function openCommands() {
    closeQuickInput();
    quickInput.value = {
      id: ++requestId, title: "Quick actions", placeholder: "Type a command…", searchable: true, items: null,
      finish: item => { if (item) void executeCommand(item.id); },
    };
  }
  function showQuickPick<T extends QuickPickItem>(items: readonly T[], options: QuickPickOptions = {}): Promise<T | undefined> {
    if (new Set(items.map(item => item.id)).size !== items.length) throw new Error("Quick pick item IDs must be unique");
    closeQuickInput();
    return new Promise(resolve => {
      quickInput.value = {
        id: ++requestId, title: options.title ?? "Choose an action", placeholder: options.placeholder ?? "Type to filter…", searchable: options.searchable ?? true, items,
        finish: item => resolve(items.find(candidate => candidate.id === item?.id)),
      };
    });
  }
  function acceptQuickInput(id: string) {
    const item = quickInputItems.value.find(candidate => candidate.id === id);
    if (!item || item.disabled) return;
    const current = quickInput.value;
    quickInput.value = null;
    current?.finish(item);
  }
  function dispose() {
    stopMaximizedWatch();
    stopNavigationWatch();
    navigation.clear();
    viewDrag.cancel();
    closeQuickInput();
    workspaceBanner.value = undefined; layout.bannerVisible = false; workspace.dispose();
    Object.keys(menuState.collapsed).forEach(id => delete menuState.collapsed[id]);
    Object.keys(menuState.heights).forEach(id => delete menuState.heights[id]);
    activityActions.splice(0); settings.dispose(); notifications.dispose();
    modals.splice(0);
    toolbarActions.splice(0);
    commandMap.clear(); sideMap.clear(); tabMap.clear(); secondaryMap.clear(); viewMap.clear(); viewCommands.clear(); viewParents.clear(); childIds.clear(); contentHosts.clear();
  }
  return {
    navigation,
    activityActions, registerActivityAction, features, settings, settingsRequest, openSettings, registerSettingsSection: settings.register, manageMenuItems, notifications, notify: notifications.notify,
    modals, openModal, closeModal, dragState: viewDrag.state, cancelViewDrag: viewDrag.cancel, canMoveView,
    viewState: menuState, registerView, openView,
    banner: workspaceBanner, registerBanner: registerWorkspaceBanner, openBanner: openWorkspaceBanner, closeBanner: closeWorkspaceBanner, toggleBanner: toggleWorkspaceBanner,
    menuState, registerMenu: registerView, openMenu: openView,
    views, getViewCommand, getViewChildren, getViewParent, viewRegion, contentHosts,
    workspace, workspaceBanner, registerWorkspaceBanner, openWorkspaceBanner, closeWorkspaceBanner, toggleWorkspaceBanner,
    resetWorkspace, splitWorkspace: workspace.split, closeWorkspacePane: workspace.close, setWorkspacePane: workspace.setPane,
    interaction, toolbarActions, registerToolbarAction, viewKey, beginViewDrag, moveView, dragView, dropView, state, layout, commands, sidePanels, bottomTabs, secondaryTabs, quickInput, quickInputItems,
    registerCommand, registerSidePanel, registerBottomTab, registerSecondaryTab, openSecondaryPanel, toggleSecondaryPanel, setZenMode, resetLayout, executeCommand,
    openSidePanel, closeSidePanel, toggleSidePanel, openBottomPanel, closeBottomPanel, toggleBottomPanel,
    openCommands, showQuickPick, acceptQuickInput, closeQuickInput, record, dispose,
  };
}
export type Frame = ReturnType<typeof createFrame>;
export const frameKey: InjectionKey<Frame> = Symbol("Frame");
export function useFrame(): Frame {
  const frame = inject(frameKey);
  if (!frame) throw new Error("useFrame() must be called inside FrameShell");
  return frame;
}




