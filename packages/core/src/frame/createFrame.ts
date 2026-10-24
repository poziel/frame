import { createHostController } from './host';
import { computed, inject, markRaw, nextTick, reactive, shallowReactive, shallowRef, watch } from "vue";
import type { InjectionKey } from "vue";
import { createPanelViewBar } from "./panelViewBar";
import { FeatureRegistry, ShellPresentation, ShellViewContainer, withPresentation } from './features';
import { CommandRegistry } from './commands';
import { installBuiltinCommands } from './builtinCommands';
import { connectPresentationCommands } from './presentationCommands';
import { createPanel } from './panel';
import { createSecondaryViewBar } from './secondaryViewBar';
import { createNavigationBar } from "./navigationBar";
import type { NavigationItem } from './navigationItems';
import { createPrimaryViewBar } from "./primaryViewBar";
import { createToolbar, validToolbarPlacement } from "./toolbar";
import { connectToolbarStatus } from './toolbarStatus';
import { createViewDrag } from "./viewDrag";
import { createSettings } from "./settings";
import { createStatus } from "./status";
import { createNotifications } from "./notifications";
import { createThemeController } from '../themes/controller';
import type { FrameOptions, FrameMenuItem } from "../types";
import { createWorkspace } from "./workspace";
import { createNavigation } from "./navigation";
import { defaultLayout, type LayoutState } from "./layout";
import type { ActivityEntry, Command, PanelDefinition, QuickPickItem, QuickPickOptions, SidePanelDefinition, ViewRegion, ToolbarAction, WorkspaceBannerDefinition, ModalDefinition } from "../types";

/** One isolated workbench per shell. Contributions return an unregister function. */
export function createFrame(options: FrameOptions = {}) {
  const theme = createThemeController(options.theme);
  const host = createHostController(options.host);
  const features = new FeatureRegistry({ settings: options.settings ?? true, notifications: options.notifications ?? true, navigation: options.navigation ?? false, ...options.features });
  const settings = createSettings();
  const notifications = createNotifications();
  const settingsRequest = shallowRef(0);
  const manageMenuItems = shallowRef<readonly FrameMenuItem[]>([{ id: "settings", label: "Settings", command: "frame.settings", shortcut: "Ctrl+," }]);
  function openSettings() { if (features.settings) { closeQuickInput(); settingsRequest.value++; } }

  const workspace = createWorkspace(options.workspace);
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
    else { definition = { ...options.modal, ...modal, footer: modal.footer ? markRaw(modal.footer) : undefined, component: markRaw(modal.component), icon: modal.icon ? markRaw(modal.icon) : undefined }; modals.push(definition); }
    const current = definition;
    return { id: current.id, close: () => { if (modals.includes(current)) closeModal(current.id); } };
  }
  const interaction = reactive({ dragging: true, primary: true, secondary: true, bottom: true });
  const toolbarActions = shallowReactive<ToolbarAction[]>([]);
  const toolbar = createToolbar(options.toolbar, () => toolbarActions);
  function registerToolbarAction(action: ToolbarAction) {
    if (toolbarActions.some(item => item.id === action.id)) throw new Error(`Toolbar action already registered: ${action.id}`);
    if (action.placement && !validToolbarPlacement(action.placement)) throw new Error(`Invalid toolbar placement: ${action.id}`);
    const definition = reactive({ ...action, placement: action.placement ? Object.freeze({ ...action.placement }) : undefined, icon: action.icon ? markRaw(action.icon) : undefined, visible: action.visible ?? false });
    const removeCommand = commands.get(action.id) ? undefined : commands.register({
      id: action.id, label: action.label, feature: action.id.startsWith('frame.') ? 'shell' : 'application',
      quickInput: action.id.startsWith('frame.') ? '>' : true,
      available: () => definition.feature?.enabled !== false,
      enabled: () => !definition.disabled,
      run: action.run,
    });
    definition.run = () => { void commands.execute(action.id); };
    let removeStatus: () => void;
    try { removeStatus = toolbarStatus.registerAction(definition); } catch (error) { removeCommand?.(); throw error; }
    toolbarActions.push(definition);
    return () => { const index = toolbarActions.indexOf(definition); if (index >= 0) { removeStatus(); toolbar.forgetAction(action.id); toolbarActions.splice(index, 1); removeCommand?.(); } };
  }
  const layoutFeatures: Partial<Record<keyof LayoutState, string>> = {
    primarySidebarVisible: 'primarySidebar', secondarySidebarVisible: 'secondarySidebar', panelVisible: 'panel',
    primaryViewBarVisible: 'primaryViewBar', secondaryViewBarVisible: 'secondaryViewBar', panelViewBarVisible: 'panelViewBar',
    menuBarVisible: 'menuBar', statusBarVisible: 'statusBar', navigationVisible: 'navigation', bannerVisible: 'banner',
  };
  const layout = reactive(new Proxy(defaultLayout(), {
    set(target, key, value) {
      const feature = layoutFeatures[key as keyof LayoutState];
      return Reflect.set(target, key, feature && !features.isAvailable(feature) && value === true ? false : value);
    },
  }));
  const stopFeatureLayout = features.subscribe(() => {
    for (const [key, feature] of Object.entries(layoutFeatures)) if (!features.isAvailable(feature)) Reflect.set(layout, key, false);
  });
  for (const [key, feature] of Object.entries(layoutFeatures)) if (!features.isAvailable(feature)) Reflect.set(layout, key, false);
  layout.manageButtonPosition = options.manageButtonPosition ?? "bottom";
  const status = createStatus(layout, options.status, id => { if (id === 'frame.manage') layout.manageButtonPosition = 'bottom'; });
  status.register({ id: 'frame.manage', kind: 'button', label: 'Manage', icon: 'settings-gear', side: 'right', order: 1000,
    available: () => features.settings, showInStatusBar: () => layout.manageButtonPosition === 'bottom', menu: () => manageMenuItems.value });
  let beforeZenBars: {nav:boolean;navPosition:import("./navigationBar").NavigationBarPosition;panelBar:boolean}|undefined;
  let beforeZen: Pick<LayoutState, "menuBarVisible" | "primaryViewBarVisible" | "secondaryViewBarVisible" | "primarySidebarVisible" | "secondarySidebarVisible" | "panelVisible" | "statusBarVisible" | "bannerVisible" | "centered"> | undefined;
  const secondaryMap = shallowReactive(new Map<string, PanelDefinition>());
  const commandMap = shallowReactive(new Map<string, Command>());
  const sideMap = shallowReactive(new Map<string, SidePanelDefinition>());
  const tabMap = shallowReactive(new Map<string, PanelDefinition>());
  const viewMap = shallowReactive(new Map<string, SidePanelDefinition>());
  const viewCommands = shallowReactive(new Map<string, string>());
  function getViewCommand(id: string) { return viewCommands.get(id); }
  const viewParents = shallowReactive(new Map<string, string>());
  const childIds = shallowReactive(new Map<string, string[]>());
  const menuState = reactive({ hidden: {} as Record<string, boolean>, collapsed: {} as Record<string, boolean>, heights: {} as Record<string, number> });
  const contentHosts = shallowReactive(new Map<string, HTMLElement>());
  const views = computed(() => [...viewMap.values()]);
  const maps = { primary: sideMap, secondary: secondaryMap, bottom: tabMap };
  function getViewChildren(id: string) { return (childIds.get(id) ?? []).map(child => viewMap.get(child)!).filter(Boolean); }
  /** Presentation visibility; registrations and component state are retained. */
  function isViewVisible(id: string) { return viewMap.has(id) && !menuState.hidden[id]; }
  function setViewVisible(id: string, visible: boolean) {
    if (!viewMap.has(id)) throw new Error(`Unknown view: ${id}`);
    menuState.hidden[id] = !visible;
    if (secondaryMap.has(id) || tabMap.has(id)) {
      repairSelections();
      if (secondaryMap.has(id) && !visible && !state.activeSecondaryTab) layout.secondarySidebarVisible = false;
    }
  }
  function getViewParent(id: string) { return viewParents.get(id); }
  function regionFeature(region?: ViewRegion) { return region === 'secondary' ? 'secondarySidebar' : region === 'bottom' ? 'panel' : 'primarySidebar'; }
  function viewRegion(id: string): ViewRegion | undefined {
    while (viewParents.has(id)) id = viewParents.get(id)!;
    return (Object.keys(maps) as ViewRegion[]).find(region => maps[region].has(id));
  }
  const primaryViewBar = withPresentation(createPrimaryViewBar(() => [
    ...[...sideMap.values()].map(view => ({ id: view.id, label: view.label, badge: view.badge, defaultVisible: view.showInRail !== false })),
  ], options.primaryViewBar, (id, visible) => {
    if (!visible && state.activeSidePanel === id) {
      repairSelections();
      if (!state.activeSidePanel) layout.primarySidebarVisible = false;
    }
  }, layout, () => interaction.dragging && interaction.primary), new ShellPresentation(features, 'primaryViewBar', () => layout.primaryViewBarVisible, () => { layout.primaryViewBarVisible = true; }, () => { layout.primaryViewBarVisible = false; }));
  const rawNavigationBar = createNavigationBar(options.navigationBar, {
    navigate(href, target, rel) { if (typeof window === 'undefined') return; if (target && target !== '_self') window.open(href, target, rel?.split(/\s+/).includes('noreferrer') ? 'noopener,noreferrer' : 'noopener'); else window.location.assign(href); },
    reportError(label, error) { status.show(`Could not run ${label}`, {severity:'error'}); record(`${label}: ${error instanceof Error ? error.message : String(error)}`); },
  }, () => features.isAvailable('navigationBar'));
  const navigationBar = withPresentation(rawNavigationBar, new ShellPresentation(features, 'navigationBar', () => rawNavigationBar.visible.value, () => { rawNavigationBar.setVisible(true); }, () => { rawNavigationBar.setVisible(false); }));
  const stopFeaturePresentation = features.subscribe(() => {
    if (!features.isAvailable('navigationBar')) rawNavigationBar.setVisible(false);
    if (!features.settings) closeModal('frame.settings');
  });
  function repairSelections() {
    if (!sideMap.has(state.activeSidePanel) || !primaryViewBar.isVisible(state.activeSidePanel)) state.activeSidePanel = [...sideMap.keys()].find(id => primaryViewBar.isVisible(id)) ?? "";
    if (!tabMap.has(state.activeBottomTab) || !isViewVisible(state.activeBottomTab)) state.activeBottomTab = [...tabMap.keys()].find(isViewVisible) ?? "";
    if (!secondaryMap.has(state.activeSecondaryTab) || !isViewVisible(state.activeSecondaryTab)) state.activeSecondaryTab = [...secondaryMap.keys()].find(isViewVisible) ?? "";
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
    get message() { return status.message.value.text; },
    set message(value: string) { status.set(value); },
  });
  const panelViewBar = withPresentation(createPanelViewBar(() => [...tabMap.values()], isViewVisible, setViewVisible, layout, options.panelViewBar, () => interaction.dragging && interaction.bottom), new ShellPresentation(features, 'panelViewBar', () => layout.panelViewBarVisible, () => { layout.panelViewBarVisible = true; }, () => { layout.panelViewBarVisible = false; }));
  const panel = withPresentation(createPanel(layout, options.panel), new ShellViewContainer(features, 'panel', () => layout.panelVisible, id => { if (!id || viewRegion(id) === 'bottom') void executeCommand(id ? getViewCommand(id) ?? '' : 'frame.panel.open'); }, () => { void executeCommand('frame.panel.close'); }, () => [...tabMap.values()], registerBottomTab, id => { void executeCommand(getViewCommand(id) ?? ''); }));
  const secondaryViewBar = withPresentation(createSecondaryViewBar(() => [...secondaryMap.values()], isViewVisible, setViewVisible, layout, options.secondaryViewBar, () => interaction.dragging && interaction.secondary), new ShellPresentation(features, 'secondaryViewBar', () => layout.secondaryViewBarVisible, () => { layout.secondaryViewBarVisible = true; }, () => { layout.secondaryViewBarVisible = false; }));
  const primarySidebar = new ShellViewContainer(features, 'primarySidebar', () => layout.primarySidebarVisible, id => { if (!id || viewRegion(id) === 'primary') void executeCommand(id ? getViewCommand(id) ?? '' : 'frame.sidebar.open'); }, () => { void executeCommand('frame.sidebar.close'); }, () => [...sideMap.values()], registerSidePanel, id => { void executeCommand(getViewCommand(id) ?? ''); });
  const secondarySidebar = new ShellViewContainer(features, 'secondarySidebar', () => layout.secondarySidebarVisible, id => { if (!id || viewRegion(id) === 'secondary') void executeCommand(id ? getViewCommand(id) ?? '' : 'frame.secondary.open'); }, () => { void executeCommand('frame.secondary.close'); }, () => [...secondaryMap.values()], registerSecondaryTab, id => { void executeCommand(getViewCommand(id) ?? ''); });
  const menuBar = new ShellPresentation(features, 'menuBar', () => layout.menuBarVisible, () => { layout.menuBarVisible = true; }, () => { layout.menuBarVisible = false; });
  function captureLocation() {
    return { panes: [...workspace.panes.value], active: workspace.activePane.value, activeTabs: { ...workspace.activeTabs.value },
      primary: state.activeSidePanel, secondary: state.activeSecondaryTab, bottom: state.activeBottomTab,
      primaryVisible: layout.primarySidebarVisible, secondaryVisible: layout.secondarySidebarVisible, bottomVisible: layout.panelVisible,
      collapsed: { ...menuState.collapsed } };
  }
  const navigation = createNavigation({
    enabled: () => features.navigation,
    capture: captureLocation,
    equal: (a, b) => a.active === b.active && JSON.stringify(a.activeTabs) === JSON.stringify(b.activeTabs) && a.primary === b.primary && a.secondary === b.secondary && a.bottom === b.bottom
      && a.primaryVisible === b.primaryVisible && a.secondaryVisible === b.secondaryVisible && a.bottomVisible === b.bottomVisible
      && a.panes.length === b.panes.length && a.panes.every((pane, i) => {
        const other = b.panes[i];
        return other && pane.id === other.id && pane.component === other.component && pane.label === other.label
          && Object.keys(pane.props ?? {}).length === Object.keys(other.props ?? {}).length
          && Object.entries(pane.props ?? {}).every(([key, value]) => Object.is(value, other.props?.[key]));
      }) && Object.keys(a.collapsed).every(id => a.collapsed[id] === b.collapsed[id]),
    restore: location => {
      // Navigate content without undoing splits, resizing, or closing panes.
      for (const pane of location.panes) if (workspace.panes.value.some(current => current.id === pane.id) && workspace.paneMode(pane.id) === 'plain') setPane(pane.id, pane);
      for (const [paneId, tabId] of Object.entries(location.activeTabs)) if (tabId && workspace.tabs.value.some(tab => tab.id === tabId && tab.paneId === paneId)) workspace.activateTab(tabId);
      workspace.focus(location.active);
      if (sideMap.has(location.primary)) state.activeSidePanel = location.primary;
      if (secondaryMap.has(location.secondary)) state.activeSecondaryTab = location.secondary;
      if (tabMap.has(location.bottom)) state.activeBottomTab = location.bottom;
      layout.primarySidebarVisible = location.primaryVisible;
      layout.secondarySidebarVisible = location.secondaryVisible;
      layout.panelVisible = location.bottomVisible;
      for (const id of Object.keys(location.collapsed)) if (viewMap.has(id)) menuState.collapsed[id] = location.collapsed[id]!;
      repairSelections();
    },
  });
  const setPane = workspace.setPane;
  const activateWorkspaceTab = workspace.activateTab;
  workspace.activateTab = (id, source) => navigation.record(() => activateWorkspaceTab(id, source));
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
    mode: "application" | "frame" | "pick";
    category?: string;
    items: readonly QuickPickItem[] | null;
    finish: (item?: QuickPickItem) => void;
  } | null>(null);
  let logId = 0;
  let requestId = 0;
  const generatedCommands = computed<Command[]>(() => [
    ...[...viewMap.values()].map(view => ({ id: `frame.view.select.${view.id}`, label: `View: Select ${view.label}`, feature: () => regionFeature(viewRegion(view.id)), quickInput: false, enabled: () => commands.isEnabled(getViewCommand(view.id) ?? ''), run: () => {
      if (getViewParent(view.id)) openView(view.id);
      else if (viewRegion(view.id) === 'primary') selectSideView(view.id);
      else if (viewRegion(view.id) === 'secondary') selectSecondaryView(view.id);
      else openBottomPanel(view.id);
    } })),
    ...theme.available.value.map(definition => ({ id: `frame.theme.select.${definition.id}`, label: `Theme: ${definition.name}`, feature: "theme", scope: "frame" as const, run: () => theme.set(definition) })),
    ...workspace.tabs.value.map(tab => ({ id: `frame.workspace.activate.${tab.id}`, label: `Workspace: Activate ${tab.title}`, icon: tab.icon, feature: "workspace", scope: "frame" as const, run: () => { workspace.activateTab(tab.id, "api"); } })),
  ]);
  const commandDefinitions = computed(() => {
    const names = new Map<string, string[]>();
    for (const view of viewMap.values()) {
      const name = view.label.trim().toLowerCase();
      names.set(name, [...(names.get(name) ?? []), view.id]);
    }
    const presentations = new Map<string, { label: string; icon?: import("vue").Component }>();
    const regions = { primary: "Primary sidebar", secondary: "Secondary sidebar", bottom: "Panel" };
    for (const view of viewMap.values()) {
      const peers = names.get(view.label.trim().toLowerCase())!;
      let suffix = "";
      if (peers.length > 1) {
        const region = viewRegion(view.id)!;
        let location = regions[region];
        if (peers.filter(id => viewRegion(id) === region).length > 1) {
          const parents: string[] = [];
          let parent = viewParents.get(view.id);
          while (parent) { parents.unshift(viewMap.get(parent)!.label); parent = viewParents.get(parent); }
          // Include the parent path and stable ID for duplicates within one region.
          location += ` / ${[...parents, view.id].join(" / ")}`;
        }
        suffix = ` (${location})`;
      }
      presentations.set(viewCommands.get(view.id)!, { label: `View: ${view.label}${suffix}`, icon: view.icon });
    }
    return [...commandMap.values()].map(command => ({ ...command, ...presentations.get(command.id) }))
      .concat(generatedCommands.value.filter(command => !commandMap.has(command.id)));
  });
  const sidePanels = computed(() => [...sideMap.values()]);
  const secondaryTabs = computed(() => [...secondaryMap.values()]);
  const bottomTabs = computed(() => [...tabMap.values()]);
  const commands: CommandRegistry = new CommandRegistry(commandDefinitions, registerCommandDefinition, features, (command, error) => {
    status.show(`Could not run ${command.label}`, { severity: 'error' });
    record(`${state.message}: ${error instanceof Error ? error.message : String(error)}`);
  });
  const registerCommand = commands.register;
  const registerNavigationSource = navigationBar.register;
  function registerNavigationItem(input: NavigationItem) {
    const removers: (() => void)[] = [];
    const visiting = new Set<NavigationItem>();
    function bind(item: NavigationItem): NavigationItem {
      if (visiting.has(item)) throw new Error('Navigation items must not contain cycles');
      if (item.type === 'dropdown') {
        visiting.add(item); const result = { ...item, items: item.items.map(bind) }; visiting.delete(item); return result;
      }
      if (item.type !== 'action') return item;
      if (typeof item.run !== 'function') throw new Error(`Invalid navigation behavior: ${item.id}`);
      if (!commands.get(item.id)) removers.push(commands.register({ id: item.id, label: item.label, feature: 'navigationBar', enabled: () => !item.disabled, run: item.run }));
      return { ...item, run: () => commands.execute(item.id) };
    }
    try {
      const remove = registerNavigationSource(bind(input));
      return () => { remove(); removers.forEach(remove => remove()); };
    } catch (error) { removers.forEach(remove => remove()); throw error; }
  }
  navigationBar.register = registerNavigationItem;
  const navigationItemEnabled = navigationBar.enabled;
  navigationBar.enabled = id => navigationItemEnabled(id) && (navigationBar.find(id)?.type !== 'action' || commands.isEnabled(id));
  const navigationItemState = navigationBar.getItemState;
  navigationBar.getItemState = id => {
    const state = navigationItemState(id);
    return state && { ...state, visible: state.visible && (navigationBar.find(id)?.type !== 'action' || commands.isVisible(id)) };
  };
  const commandItems = computed<QuickPickItem[]>(() => commands.list().filter(command => commands.isVisible(command.id) && commands.category(command) !== false && commands.category(command) === (quickInput.value?.category ?? (quickInput.value?.mode === 'frame' ? '>' : '')) && (!commands.category(command) || !!commands.categories.get(commands.category(command) as string))).map(command => ({
    id: command.id, icon: command.icon, label: command.label, detail: command.detail, shortcut: command.shortcut,
    disabled: !commands.isEnabled(command.id),
  })));
  const quickInputItems = computed(() => quickInput.value?.items ?? commandItems.value);

  function canMoveView(id: string, destination: ViewRegion, parentId?: string) {
    const source = viewRegion(id);
    const view = viewMap.get(id);
    if (!view || !source || !features.isAvailable(regionFeature(source)) || !features.isAvailable(regionFeature(destination)) || !interaction.dragging || !interaction[source] || !interaction[destination]) return false;
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
    if (source === "primary" && !parent && (destination !== "primary" || parentId)) primaryViewBar.forget(id);
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
    const hidden = menuState.hidden[id];
    repairSelections(); openView(id);
    menuState.hidden[id] = hidden;
    repairSelections();
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
  function registerCommandDefinition(command: Command) {
    if (commandMap.has(command.id)) throw new Error(`Command already registered: ${command.id}`);
    const definition = { ...command, feature: command.feature ?? 'application' };
    commandMap.set(command.id, definition);
    return () => { if (commandMap.get(command.id) === definition) commandMap.delete(command.id); };
  }
  function openView(id: string) {
    if (!features.isAvailable(regionFeature(viewRegion(id)))) return;
    return navigation.record(() => {
      if (!viewMap.has(id)) throw new Error(`Unknown view: ${id}`);
      let root = id;
      menuState.hidden[root] = false; menuState.collapsed[root] = false;
      while (viewParents.has(root)) { root = viewParents.get(root)!; menuState.hidden[root] = false; menuState.collapsed[root] = false; }
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
      menuState.hidden[view.id] = view.visible === false;
      if (parent) viewParents.set(view.id, parent); else maps[region].set(view.id, definition);
      if (!parent && region === "secondary") secondaryViewBar.initialize(view.id);
      if (!parent && region === "bottom") panelViewBar.initialize(view.id);
      const removeCommand = registerCommand({ id: command, feature: () => regionFeature(viewRegion(view.id)), scope: "frame", label: `View: ${view.label}`, group: "View", run: () => openView(view.id) });
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
        primaryViewBar.forget(definition.id); secondaryViewBar.forget(definition.id); panelViewBar.forget(definition.id); detachView(definition.id); viewMap.delete(definition.id); viewCommands.delete(definition.id); childIds.delete(definition.id); contentHosts.delete(definition.id); delete menuState.collapsed[definition.id]; delete menuState.heights[definition.id]; delete menuState.hidden[definition.id]; removeCommand();
      }
      repairSelections();
    };
  }
  function registerSidePanel(panel: SidePanelDefinition) { return registerView(panel, "primary"); }
  function registerBottomTab(tab: PanelDefinition) { return registerView(tab, "bottom"); }
  function registerSecondaryTab(tab: PanelDefinition) { return registerView(tab, "secondary"); }
  function openSecondaryPanel(id = state.activeSecondaryTab) {
    if (!features.isAvailable('secondarySidebar')) return;
    return navigation.record(() => {
      if (!id && !secondaryMap.size) { layout.secondarySidebarVisible = true; return; }
      if (!id) id = [...secondaryMap.keys()].find(isViewVisible) ?? secondaryMap.keys().next().value ?? "";
      if (!secondaryMap.has(id)) throw new Error(`Unknown secondary tab: ${id}`);
      setViewVisible(id, true);
      state.activeSecondaryTab = id; layout.secondarySidebarVisible = true;
    });
  }
  function selectSecondaryView(id: string) {
    if (layout.secondaryViewBarPosition === 'default' && layout.secondarySidebarVisible && state.activeSecondaryTab === id) closeSecondaryPanel();
    else openSecondaryPanel(id);
  }
  function closeSecondaryPanel() { layout.secondarySidebarVisible = false; }
  function toggleSecondaryPanel() {
    if (layout.secondarySidebarVisible) closeSecondaryPanel();
    else openSecondaryPanel();
  }
  function setZenMode(enabled: boolean) {
    if (enabled === layout.zenMode) return;
    if (enabled) {
      beforeZenBars = {nav:navigationBar.visible.value,navPosition:navigationBar.position.value,panelBar:panelViewBar.visible.value};
      navigationBar.setVisible(false);panelViewBar.setBarVisible(false);
      beforeZen = {
        menuBarVisible: layout.menuBarVisible, primaryViewBarVisible: layout.primaryViewBarVisible, secondaryViewBarVisible: layout.secondaryViewBarVisible,
        primarySidebarVisible: layout.primarySidebarVisible, secondarySidebarVisible: layout.secondarySidebarVisible,
        panelVisible: layout.panelVisible, bannerVisible: layout.bannerVisible, statusBarVisible: layout.statusBarVisible, centered: layout.centered,
      };
      Object.assign(layout, { menuBarVisible: false, primaryViewBarVisible: false, secondaryViewBarVisible: false, primarySidebarVisible: false, secondarySidebarVisible: false, panelVisible: false, bannerVisible: false, statusBarVisible: false, centered: true, zenMode: true });
    } else {
      if (beforeZen) Object.assign(layout, beforeZen);
      if(beforeZenBars){navigationBar.setPosition(beforeZenBars.navPosition);navigationBar.setVisible(beforeZenBars.nav);panelViewBar.setBarVisible(beforeZenBars.panelBar);beforeZenBars=undefined;}
      layout.zenMode = false; beforeZen = undefined;
    }
  }
  function resetLayout() { beforeZen = undefined; beforeZenBars=undefined; Object.assign(layout, defaultLayout(), { manageButtonPosition: options.manageButtonPosition ?? "bottom" }); status.resetPresentation(); toolbar.reset(); navigationBar.resetPresentation(); primaryViewBar.resetPresentation(); secondaryViewBar.resetPresentation(); panel.resetPresentation(); panelViewBar.resetPresentation(); }
  function openSidePanel(id = state.activeSidePanel) {
    if (!features.isAvailable('primarySidebar')) return;
    return navigation.record(() => {
      if (!id && !sideMap.size) { state.sidebarVisible = true; return; }
      if (!id) id = [...sideMap.keys()].find(candidate => primaryViewBar.isVisible(candidate)) ?? sideMap.keys().next().value ?? "";
      if (!sideMap.has(id)) throw new Error(`Unknown side panel: ${id}`);
      primaryViewBar.setVisible(id, true);
      state.activeSidePanel = id;
      state.sidebarVisible = true;
    });
  }
  function selectSideView(id: string) {
    if (layout.primaryViewBarPosition === 'default' && state.sidebarVisible && state.activeSidePanel === id) closeSidePanel();
    else openSidePanel(id);
  }
  function closeSidePanel() { state.sidebarVisible = false; }
  function toggleSidePanel() {
    if (!state.sidebarVisible) repairSelections();
    state.sidebarVisible = !state.sidebarVisible;
  }
  function openBottomPanel(id = state.activeBottomTab) {
    if (!features.isAvailable('panel')) return;
    return navigation.record(() => {
      if (!id && !tabMap.size) { state.panelVisible = true; return; }
      if (!id) id = [...tabMap.keys()].find(isViewVisible) ?? tabMap.keys().next().value ?? "";
      if (!tabMap.has(id)) throw new Error(`Unknown bottom tab: ${id}`);
      setViewVisible(id, true);
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
  const executeCommand = commands.execute;
  function openQuickInput(destination: string = 'application') {
    if (!features.isAvailable('shell')) return;
    const category = destination === 'frame' ? '>' : destination === 'application' ? '' : destination;
    const definition = category ? commands.categories.get(category) : undefined;
    if (category && !definition) throw new Error('Unknown command category: ' + category);
    const mode = category === '>' ? 'frame' : 'application';
    closeQuickInput();
    quickInput.value = {
      id: ++requestId, mode, category, title: definition?.label ?? 'Quick input', placeholder: definition?.placeholder ?? (category ? 'Search ' + definition!.label + '…' : 'Search application…'), items: null,
      finish: item => { if (item) void executeCommand(item.id); },
    };
  }
  function openCommands() { openQuickInput("frame"); }
  function setQuickInputMode(destination: string) {
    if (!quickInput.value || quickInput.value.mode === 'pick') return;
    const category = destination === 'frame' ? '>' : destination === 'application' ? '' : destination;
    const definition = category ? commands.categories.get(category) : undefined;
    if (category && !definition) return;
    quickInput.value = { ...quickInput.value, mode: category === '>' ? 'frame' : 'application', category, title: definition?.label ?? 'Quick input', placeholder: definition?.placeholder ?? (category ? 'Search ' + definition!.label + '…' : 'Search application…') };
  }
  function showQuickPick<T extends QuickPickItem>(items: readonly T[], options: QuickPickOptions = {}): Promise<T | undefined> {
    if (new Set(items.map(item => item.id)).size !== items.length) throw new Error("Quick pick item IDs must be unique");
    closeQuickInput();
    return new Promise(resolve => {
      quickInput.value = {
        id: ++requestId, mode: "pick", title: options.title ?? "Choose an action", placeholder: options.placeholder ?? "Type to filter…", items,
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
    toolbarStatus.dispose();
    commands.dispose(); features.dispose(); stopFeatureLayout(); stopFeaturePresentation();
    host.dispose();
    theme.dispose();
    status.dispose();
    stopMaximizedWatch();
    stopNavigationWatch();
    navigation.clear();
    viewDrag.cancel();
    closeQuickInput();
    workspaceBanner.value = undefined; layout.bannerVisible = false; workspace.dispose();
    Object.keys(menuState.collapsed).forEach(id => delete menuState.collapsed[id]);
    Object.keys(menuState.hidden).forEach(id => delete menuState.hidden[id]);
    Object.keys(menuState.heights).forEach(id => delete menuState.heights[id]);
    navigationBar.dispose();
    primaryViewBar.dispose(); secondaryViewBar.dispose(); panel.dispose(); panelViewBar.dispose(); settings.dispose(); notifications.dispose();
    modals.splice(0);
    toolbar.dispose(); toolbarActions.splice(0);
    commandMap.clear(); sideMap.clear(); tabMap.clear(); secondaryMap.clear(); viewMap.clear(); viewCommands.clear(); viewParents.clear(); childIds.clear(); contentHosts.clear();
  }
  const layoutCustomizerOpen = shallowRef(false);
  function resolveMenuItems(items: readonly FrameMenuItem[]): FrameMenuItem[] {
    return items.flatMap<FrameMenuItem>(item => {
      if (item.type === 'separator') return [item];
      if (item.command && !commands.isVisible(item.command)) return [];
      const children = item.children ? resolveMenuItems(item.children) : undefined;
      if (item.children && !children?.length) return [];
      return [{ ...item, ...(children ? { children } : {}), disabled: item.disabled || (item.command ? !commands.isEnabled(item.command) : false) }];
    });
  }
  const frame = {
    primarySidebar, secondarySidebar, menuBar, layoutCustomizerOpen, resolveMenuItems,
    host,
    theme,
    status,
    navigation,
    navigationBar, registerNavigationItem,
    panel, panelViewBar, secondaryViewBar, primaryViewBar, features, settings, settingsRequest, openSettings, registerSettingsSection: settings.register, manageMenuItems, notifications, notify: notifications.notify,
    modals, openModal, closeModal, dragState: viewDrag.state, cancelViewDrag: viewDrag.cancel, canMoveView,
    viewState: menuState, registerView, openView, selectSideView, selectSecondaryView, closeSecondaryPanel,
    banner: workspaceBanner, registerBanner: registerWorkspaceBanner, openBanner: openWorkspaceBanner, closeBanner: closeWorkspaceBanner, toggleBanner: toggleWorkspaceBanner,
    menuState, registerMenu: registerView, openMenu: openView,
    views, isViewVisible, setViewVisible, getViewCommand, getViewChildren, getViewParent, viewRegion, contentHosts,
    workspace, workspaceBanner, registerWorkspaceBanner, openWorkspaceBanner, closeWorkspaceBanner, toggleWorkspaceBanner,
    resetWorkspace, splitWorkspace: workspace.split, closeWorkspacePane: workspace.close, setWorkspacePane: workspace.setPane,
    interaction, toolbar, toolbarActions, registerToolbarAction, viewKey, beginViewDrag, moveView, dragView, dropView, state, layout, commands, sidePanels, bottomTabs, secondaryTabs, quickInput, quickInputItems,
    registerCommand, registerSidePanel, registerBottomTab, registerSecondaryTab, openSecondaryPanel, toggleSecondaryPanel, setZenMode, resetLayout, executeCommand,
    openSidePanel, closeSidePanel, toggleSidePanel, openBottomPanel, closeBottomPanel, toggleBottomPanel,
    openQuickInput, setQuickInputMode, openCommands, showQuickPick, acceptQuickInput, closeQuickInput, record, dispose,
  };
  installBuiltinCommands(frame);
  connectPresentationCommands(frame);
  const toolbarStatus = connectToolbarStatus(frame);
  return frame;
}
export type Frame = ReturnType<typeof createFrame>;
export const frameKey: InjectionKey<Frame> = Symbol("Frame");
export function useFrame(): Frame {
  const frame = inject(frameKey);
  if (!frame) throw new Error("useFrame() must be called inside FrameShell");
  return frame;
}




