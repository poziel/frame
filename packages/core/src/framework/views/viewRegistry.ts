import type {CommandRegistry} from '../commands/commandRegistry';
import type {PanelViewBar} from './panelViewBar';
import type {SecondaryViewBar} from './secondaryViewBar';
import type {ShellPresentation} from './shellPresentation';
import type {PrimaryViewBar, ViewRegistration} from './primaryViewBar';
import type {FeatureRegistry} from '../features/featureRegistry';
import type {Status} from './status';
import type {
  PanelDefinition,
  SidePanelDefinition,
  ViewRegion,
} from './shellViewContainer';
import type {ComputedRef, ShallowReactive} from 'vue';
import {
  computed,
  effectScope,
  markRaw,
  nextTick,
  reactive,
  shallowReactive,
} from 'vue';
import {ViewDrag} from './viewDrag';
import type {ActivityEntry} from '../configuration/activityLog';
import type {ShellLayout} from '../layout/shellLayout';
import type {ActivityLog} from '../configuration/activityLog';
import type {ShellNavigation} from './shellNavigation';
import type {ResourceCommands} from '../commands/resourceCommands';

/** Narrow dependencies connected by the owning Frame instance. */
export interface ViewRegistryServices {

  /** Shared execution gate for view and container activation. */
  readonly commands: CommandRegistry;

  /** Owns feature-gated layout state, Zen restoration, and presentation reset. */
  readonly shellLayout: ShellLayout;

  /** Status contributions, separators, and transient messages. */
  readonly status: Status;

  /** Owns the bounded, timestamped application session log. */
  readonly activityLog: ActivityLog;

  /** Feature availability shared by shell presentation and execution guards. */
  readonly features: FeatureRegistry;

  /** Primary view selection, display, and separator preferences. */
  readonly primaryViewBar: PrimaryViewBar & ShellPresentation;

  /** Connects generic navigation history to workspace and view state. */
  readonly shellNavigation: ShellNavigation;

  /** Owns resource-derived command definitions and their presentation labels. */
  readonly resourceCommands: ResourceCommands;

  /** Secondary view selection, display, and separator preferences. */
  readonly secondaryViewBar: SecondaryViewBar & ShellPresentation;

  /** Panel selectors and their independent bar presentation. */
  readonly panelViewBar: PanelViewBar & ShellPresentation;

  /** Bound command registration shared by host and shell APIs. */
  readonly registerCommand: CommandRegistry['register'];
}

/**
 * Owns registered shell views, hierarchy, visibility, selection, and movement.
 * Content hosts and registration identities remain stable across presentation changes.
 */
export class ViewRegistry {

  /** Observers belong to this service rather than a caller's temporary scope. */
  private readonly scope = effectScope(true);

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: ViewRegistryServices;

  /** Host-controlled interaction permissions for shell view movement. */
  readonly interaction: {
    dragging: boolean;
    primary: boolean;
    secondary: boolean;
    bottom: boolean;
  };

  /** Secondary view registrations indexed by their root IDs. */
  readonly secondaryMap: ShallowReactive<Map<string, PanelDefinition>>;

  /** Primary view registrations indexed by their root IDs. */
  readonly sideMap: ShallowReactive<Map<string, SidePanelDefinition>>;

  /** Panel registrations indexed by their root IDs. */
  readonly tabMap: ShallowReactive<Map<string, PanelDefinition>>;

  /** All view definitions, including nested children. */
  readonly viewMap: ShallowReactive<Map<string, SidePanelDefinition>>;

  /** Command identity assigned to each registered view. */
  readonly viewCommands: ShallowReactive<Map<string, string>>;

  /** Parent identity for nested view definitions. */
  readonly viewParents: ShallowReactive<Map<string, string>>;

  /** Ordered children retained for each view registration. */
  readonly childIds: ShallowReactive<Map<string, string[]>>;

  /** Reactive hidden, collapsed, and height preferences for registered views. */
  readonly menuState: {
    hidden: Record<string, boolean>;
    collapsed: Record<string, boolean>;
    heights: Record<string, number>;
  };

  /** Mounted content hosts used to retain view identity across moves. */
  readonly contentHosts: ShallowReactive<Map<string, HTMLElement>>;

  /** Computed projection of all registered views. */
  readonly views: ComputedRef<SidePanelDefinition[]>;

  /** Region-indexed root registration collections. */
  private readonly maps: {
    primary: ShallowReactive<Map<string, SidePanelDefinition>>;
    secondary: ShallowReactive<Map<string, PanelDefinition>>;
    bottom: ShallowReactive<Map<string, PanelDefinition>>;
  };

  /** Reactive active-view selections and local session log. */
  readonly state: {
    sidebarVisible: boolean;
    panelVisible: boolean;
    activeSidePanel: string;
    activeBottomTab: string;
    activeSecondaryTab: string;
    entries: ActivityEntry[];
    message: string;
  };

  /** Computed primary root view definitions. */
  readonly sidePanels: ComputedRef<SidePanelDefinition[]>;

  /** Computed secondary root view definitions. */
  readonly secondaryTabs: ComputedRef<PanelDefinition[]>;

  /** Computed panel root view definitions. */
  readonly bottomTabs: ComputedRef<PanelDefinition[]>;

  /** Owns interactive view dragging and its insertion preview. */
  readonly viewDrag: ViewDrag;

  /** Bound view-drag entry point retaining its controller ownership. */
  readonly beginViewDrag: (
    event: PointerEvent,
    id: string,
    region: ViewRegion
  ) => void;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: ViewRegistryServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.primaryRegistrations = this.primaryRegistrations.bind(this);
    this.onPrimaryVisibilityChange = this.onPrimaryVisibilityChange.bind(this);
    this.executeViewCommand = this.executeViewCommand.bind(this);
    this.getViewCommand = this.getViewCommand.bind(this);
    this.getViewChildren = this.getViewChildren.bind(this);
    this.isViewVisible = this.isViewVisible.bind(this);
    this.setViewVisible = this.setViewVisible.bind(this);
    this.getViewParent = this.getViewParent.bind(this);
    this.viewRegion = this.viewRegion.bind(this);
    this.canMoveView = this.canMoveView.bind(this);
    this.moveView = this.moveView.bind(this);
    this.viewKey = this.viewKey.bind(this);
    this.dragView = this.dragView.bind(this);
    this.dropView = this.dropView.bind(this);
    this.openView = this.openView.bind(this);
    this.registerView = this.registerView.bind(this);
    this.registerSidePanel = this.registerSidePanel.bind(this);
    this.registerBottomTab = this.registerBottomTab.bind(this);
    this.registerSecondaryTab = this.registerSecondaryTab.bind(this);
    this.openSecondaryPanel = this.openSecondaryPanel.bind(this);
    this.selectSecondaryView = this.selectSecondaryView.bind(this);
    this.closeSecondaryPanel = this.closeSecondaryPanel.bind(this);
    this.toggleSecondaryPanel = this.toggleSecondaryPanel.bind(this);
    this.openSidePanel = this.openSidePanel.bind(this);
    this.selectSideView = this.selectSideView.bind(this);
    this.closeSidePanel = this.closeSidePanel.bind(this);
    this.toggleSidePanel = this.toggleSidePanel.bind(this);
    this.openBottomPanel = this.openBottomPanel.bind(this);
    this.closeBottomPanel = this.closeBottomPanel.bind(this);
    this.toggleBottomPanel = this.toggleBottomPanel.bind(this);
    this.regionFeature = this.regionFeature.bind(this);
    this.repairSelections = this.repairSelections.bind(this);
    this.detachView = this.detachView.bind(this);
    this.revealRegion = this.revealRegion.bind(this);
    const owner = this;
    this.interaction = reactive({
      dragging: true,
      primary: true,
      secondary: true,
      bottom: true,
    });
    this.secondaryMap = shallowReactive(new Map<string, PanelDefinition>());
    this.sideMap = shallowReactive(new Map<string, SidePanelDefinition>());
    this.tabMap = shallowReactive(new Map<string, PanelDefinition>());
    this.viewMap = shallowReactive(new Map<string, SidePanelDefinition>());
    this.viewCommands = shallowReactive(new Map<string, string>());
    this.viewParents = shallowReactive(new Map<string, string>());
    this.childIds = shallowReactive(new Map<string, string[]>());
    this.menuState = reactive({
      hidden: {} as Record<string, boolean>,
      collapsed: {} as Record<string, boolean>,
      heights: {} as Record<string, number>,
    });
    this.contentHosts = shallowReactive(new Map<string, HTMLElement>());
    this.views = this.scope.run(() =>
      computed(() => [...this.viewMap.values()])
    )!;
    this.maps = {
      primary: this.sideMap,
      secondary: this.secondaryMap,
      bottom: this.tabMap,
    };
    this.state = reactive({
      get sidebarVisible() {
        return owner.services.shellLayout.layout.primarySidebarVisible;
      },
      set sidebarVisible(value: boolean) {
        owner.services.shellLayout.layout.primarySidebarVisible = value;
      },
      get panelVisible() {
        return owner.services.shellLayout.layout.panelVisible;
      },
      set panelVisible(value: boolean) {
        owner.services.shellLayout.layout.panelVisible = value;
      },
      activeSidePanel: '',
      activeBottomTab: '',
      activeSecondaryTab: '',
      entries: this.services.activityLog.entries,
      get message() {
        return owner.services.status.message.value.text;
      },
      set message(value: string) {
        owner.services.status.set(value);
      },
    });
    this.sidePanels = this.scope.run(() =>
      computed(() => [...this.sideMap.values()])
    )!;
    this.secondaryTabs = this.scope.run(() =>
      computed(() => [...this.secondaryMap.values()])
    )!;
    this.bottomTabs = this.scope.run(() =>
      computed(() => [...this.tabMap.values()])
    )!;
    this.viewDrag = new ViewDrag({
      view: (id) => this.viewMap.get(id),
      siblings: (region, parent) =>
        parent
          ? [...(this.childIds.get(parent) ?? [])]
          : [...this.maps[region].keys()],
      canMove: this.canMoveView,
      move: this.moveView,
      activate: this.openView,
      reveal: this.revealRegion,
      closed: (region) =>
        region === 'primary'
          ? !this.services.shellLayout.layout.primarySidebarVisible
          : region === 'secondary'
            ? !this.services.shellLayout.layout.secondarySidebarVisible
            : !this.services.shellLayout.layout.panelVisible,
      primarySide: () => this.services.shellLayout.layout.primarySide,
      enabled: (region) =>
        this.interaction.dragging && this.interaction[region],
    });
    this.beginViewDrag = this.viewDrag.begin;
  }

  /** Projects registered primary views into selector entries. */
  primaryRegistrations(): readonly ViewRegistration[] {
    return [...this.sideMap.values()].map((view) => ({
      id: view.id,
      label: view.label,
      badge: view.badge,
      defaultVisible: view.showInRail !== false,
    }));
  }

  /** Repairs selection and closes an empty sidebar after hiding its active view. */
  onPrimaryVisibilityChange(id: string, visible: boolean): void {
    if (!visible && this.state.activeSidePanel === id) {
      this.repairSelections();
      if (!this.state.activeSidePanel)
        this.services.shellLayout.layout.primarySidebarVisible = false;
    }
  }

  /** Activates a view through the shared command restrictions. */
  executeViewCommand(id: string): void {
    void this.services.commands.execute(this.getViewCommand(id) ?? '');
  }

  /** Opens a shell container or one of its registered views through commands. */
  openContainer(region: ViewRegion, id?: string): void {
    if (id && this.viewRegion(id) !== region) return;
    const prefix = {
      primary: 'sidebar',
      secondary: 'secondary',
      bottom: 'panel',
    }[region];
    void this.services.commands.execute(
      id ? (this.getViewCommand(id) ?? '') : `frame.${prefix}.open`
    );
  }

  /** Returns the command assigned to a registered view. */
  getViewCommand(id: string) {
    return this.viewCommands.get(id);
  }

  /** Returns ordered registered children for a view. */
  getViewChildren(id: string) {
    return (this.childIds.get(id) ?? [])
      .map((child) => this.viewMap.get(child)!)
      .filter(Boolean);
  }

  /** Reads effective view visibility independently of registration. */
  isViewVisible(id: string) {
    return this.viewMap.has(id) && !this.menuState.hidden[id];
  }

  /** Changes view visibility through its current owning region. */
  setViewVisible(id: string, visible: boolean) {
    if (!this.viewMap.has(id)) throw new Error(`Unknown view: ${id}`);
    this.menuState.hidden[id] = !visible;
    if (this.secondaryMap.has(id) || this.tabMap.has(id)) {
      this.repairSelections();
      if (
        this.secondaryMap.has(id) &&
        !visible &&
        !this.state.activeSecondaryTab
      )
        this.services.shellLayout.layout.secondarySidebarVisible = false;
    }
  }

  /** Returns the registered parent view, if any. */
  getViewParent(id: string) {
    return this.viewParents.get(id);
  }

  /** Resolves the current region of a root or nested view. */
  viewRegion(id: string): ViewRegion | undefined {
    while (this.viewParents.has(id)) id = this.viewParents.get(id)!;
    return (Object.keys(this.maps) as ViewRegion[]).find((region) =>
      this.maps[region].has(id)
    );
  }

  /** Checks feature, region, parent, and host movement restrictions. */
  canMoveView(id: string, destination: ViewRegion, parentId?: string) {
    const source = this.viewRegion(id);
    const view = this.viewMap.get(id);
    if (
      !view ||
      !source ||
      !this.services.features.isAvailable(this.regionFeature(source)) ||
      !this.services.features.isAvailable(this.regionFeature(destination)) ||
      !this.interaction.dragging ||
      !this.interaction[source] ||
      !this.interaction[destination]
    )
      return false;
    const parent = this.viewParents.get(id);
    if (
      view.draggable === false ||
      ((source !== destination || parent !== parentId) &&
        view.movable === false)
    )
      return false;
    if (parentId) {
      if (
        !this.childIds.has(parentId) ||
        this.viewRegion(parentId) !== destination
      )
        return false;
      let ancestor: string | undefined = parentId;
      while (ancestor) {
        if (ancestor === id) return false;
        ancestor = this.viewParents.get(ancestor);
      }
    }
    return true;
  }

  /** Relocates a registered view while retaining its content and identity. */
  moveView(
    id: string,
    destination: ViewRegion,
    before?: string,
    parentId?: string
  ) {
    if (!this.canMoveView(id, destination, parentId)) return false;
    const source = this.viewRegion(id)!;
    const parent = this.viewParents.get(id);
    const view = this.viewMap.get(id)!;
    if (before === id && parent === parentId && source === destination)
      return true;
    if (
      source === 'primary' &&
      !parent &&
      (destination !== 'primary' || parentId)
    )
      this.services.primaryViewBar.forget(id);
    this.detachView(id);
    if (parentId) {
      const ids = [...this.childIds.get(parentId)!];
      const index = before ? ids.indexOf(before) : -1;
      ids.splice(index < 0 ? ids.length : index, 0, id);
      this.childIds.set(parentId, ids);
      this.viewParents.set(id, parentId);
    } else {
      const entries = [...this.maps[destination].entries()];
      const index = before ? entries.findIndex(([key]) => key === before) : -1;
      entries.splice(index < 0 ? entries.length : index, 0, [id, view]);
      this.maps[destination].clear();
      entries.forEach(([key, item]) => this.maps[destination].set(key, item));
    }
    const hidden = this.menuState.hidden[id];
    this.repairSelections();
    this.openView(id);
    this.menuState.hidden[id] = hidden;
    this.repairSelections();
    return true;
  }

  /** Handles keyboard movement and activation for a registered view. */
  async viewKey(event: KeyboardEvent, id: string, region: ViewRegion) {
    if (!event.altKey) return;
    if (
      event.shiftKey &&
      ['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)
    ) {
      event.preventDefault();
      event.stopPropagation();
      const moved = this.moveView(
        id,
        event.key === 'ArrowLeft'
          ? 'primary'
          : event.key === 'ArrowRight'
            ? 'secondary'
            : 'bottom'
      );
      if (moved) {
        await nextTick();
        [...document.querySelectorAll<HTMLElement>('[data-view-id]')]
          .find((element) => element.dataset.viewId === id)
          ?.focus();
      }
    } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      const parent = this.viewParents.get(id);
      const ids = parent
        ? this.childIds.get(parent)!
        : [...this.maps[region].keys()];
      const index = ids.indexOf(id);
      if (event.key === 'ArrowUp' && index > 0)
        this.moveView(id, region, ids[index - 1], parent);
      if (event.key === 'ArrowDown' && index < ids.length - 1)
        this.moveView(id, region, ids[index + 2], parent);
    }
  }

  /** Begins legacy drag-event integration through the existing view controller. */
  dragView(event: DragEvent, id: string, region: ViewRegion) {
    const view = this.viewMap.get(id);
    if (
      !this.interaction.dragging ||
      !this.interaction[region] ||
      view?.draggable === false
    ) {
      event.preventDefault();
      return;
    }
    event.dataTransfer?.setData('application/x-frame-view', id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  /** Completes a permitted legacy drag-event view relocation. */
  dropView(event: DragEvent, region: ViewRegion, before?: string) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.dataTransfer?.getData('application/x-frame-view');
    if (id)
      this.moveView(
        id,
        region,
        before,
        (event.target as HTMLElement)?.closest<HTMLElement>(
          '[data-view-parent]'
        )?.dataset.viewParent
      );
  }

  /** Reveals a view through its current region and ancestor hierarchy. */
  openView(id: string) {
    if (
      !this.services.features.isAvailable(
        this.regionFeature(this.viewRegion(id))
      )
    )
      return;
    return this.services.shellNavigation.navigation.record(() => {
      if (!this.viewMap.has(id)) throw new Error(`Unknown view: ${id}`);
      let root = id;
      this.menuState.hidden[root] = false;
      this.menuState.collapsed[root] = false;
      while (this.viewParents.has(root)) {
        root = this.viewParents.get(root)!;
        this.menuState.hidden[root] = false;
        this.menuState.collapsed[root] = false;
      }
      if (this.sideMap.has(root)) this.openSidePanel(root);
      else if (this.tabMap.has(root)) this.openBottomPanel(root);
      else if (this.secondaryMap.has(root)) this.openSecondaryPanel(root);
    });
  }

  /** Registers a view tree, commands, and current region membership. */
  registerView(input: SidePanelDefinition, region: ViewRegion) {
    const owner = this;
    const inputs: {
      view: SidePanelDefinition;
      parent?: string;
      command: string;
    }[] = [];
    const seen = new Set<string>();
    function validate(view: SidePanelDefinition, parent?: string) {
      if (seen.has(view.id) || owner.viewMap.has(view.id))
        throw new Error(`View already registered: ${view.id}`);
      seen.add(view.id);
      if (!!view.component === (view.children !== undefined))
        throw new Error(
          `View ${view.id} must supply either component or children`
        );
      const prefix = parent
        ? 'frame.view'
        : region === 'primary'
          ? 'frame.side'
          : region === 'bottom'
            ? 'frame.tab'
            : 'frame.secondary';
      const command = `${prefix}.${view.id}`;
      if (owner.services.resourceCommands.commandMap.has(command))
        throw new Error(`Command already registered: ${command}`);
      inputs.push({view, parent, command});
      view.children?.forEach((child) => validate(child, view.id));
    }
    validate(input);
    const owned: {
      definition: SidePanelDefinition;
      removeCommand: () => void;
    }[] = [];
    for (const {view, parent, command} of inputs) {
      if (view.children !== undefined)
        this.childIds.set(
          view.id,
          view.children.map((child) => child.id)
        );
      const definition: SidePanelDefinition = {
        ...view,
        get label() {
          return view.label;
        },
        get titleColor() {
          return view.titleColor;
        },
        component: view.component ? markRaw(view.component) : undefined,
        icon: view.icon ? markRaw(view.icon) : undefined,
        get children() {
          return owner.childIds.has(view.id)
            ? owner.getViewChildren(view.id)
            : undefined;
        },
      };
      this.viewMap.set(view.id, definition);
      this.viewCommands.set(view.id, command);
      this.menuState.collapsed[view.id] = view.collapsed ?? false;
      this.menuState.hidden[view.id] = view.visible === false;
      if (parent) this.viewParents.set(view.id, parent);
      else this.maps[region].set(view.id, definition);
      if (!parent && region === 'secondary')
        this.services.secondaryViewBar.initialize(view.id);
      if (!parent && region === 'bottom')
        this.services.panelViewBar.initialize(view.id);
      const removeCommand = this.services.registerCommand({
        id: command,
        feature: () => this.regionFeature(this.viewRegion(view.id)),
        scope: 'frame',
        label: `View: ${view.label}`,
        run: () => this.openView(view.id),
      });
      owned.push({definition, removeCommand});
    }
    this.repairSelections();
    return () => {
      const removing = new Set(
        owned
          .filter(
            ({definition}) => this.viewMap.get(definition.id) === definition
          )
          .map(({definition}) => definition.id)
      );
      if (!removing.size) return;
      // Foreign menus dropped into this contribution keep their own registration.
      for (const id of removing)
        for (const child of this.childIds.get(id) ?? []) {
          if (!removing.has(child)) {
            const region = this.viewRegion(id) ?? 'primary';
            this.detachView(child);
            this.maps[region].set(child, this.viewMap.get(child)!);
          }
        }
      for (const {definition, removeCommand} of owned)
        if (removing.has(definition.id)) {
          this.services.primaryViewBar.forget(definition.id);
          this.services.secondaryViewBar.forget(definition.id);
          this.services.panelViewBar.forget(definition.id);
          this.detachView(definition.id);
          this.viewMap.delete(definition.id);
          this.viewCommands.delete(definition.id);
          this.childIds.delete(definition.id);
          this.contentHosts.delete(definition.id);
          delete this.menuState.collapsed[definition.id];
          delete this.menuState.heights[definition.id];
          delete this.menuState.hidden[definition.id];
          removeCommand();
        }
      this.repairSelections();
    };
  }

  /** Registers a root view in the primary sidebar. */
  registerSidePanel(panel: SidePanelDefinition) {
    return this.registerView(panel, 'primary');
  }

  /** Registers a root view in the panel. */
  registerBottomTab(tab: PanelDefinition) {
    return this.registerView(tab, 'bottom');
  }

  /** Registers a root view in the secondary sidebar. */
  registerSecondaryTab(tab: PanelDefinition) {
    return this.registerView(tab, 'secondary');
  }

  /** Reveals the secondary sidebar and selects an eligible view. */
  openSecondaryPanel(id = this.state.activeSecondaryTab) {
    if (!this.services.features.isAvailable('secondarySidebar')) return;
    return this.services.shellNavigation.navigation.record(() => {
      if (!id && !this.secondaryMap.size) {
        this.services.shellLayout.layout.secondarySidebarVisible = true;
        return;
      }
      if (!id)
        id =
          [...this.secondaryMap.keys()].find(this.isViewVisible) ??
          this.secondaryMap.keys().next().value ??
          '';
      if (!this.secondaryMap.has(id))
        throw new Error(`Unknown secondary tab: ${id}`);
      this.setViewVisible(id, true);
      this.state.activeSecondaryTab = id;
      this.services.shellLayout.layout.secondarySidebarVisible = true;
    });
  }

  /** Selects a secondary view through navigation and presentation guards. */
  selectSecondaryView(id: string) {
    if (
      this.services.shellLayout.layout.secondaryViewBarPosition === 'default' &&
      this.services.shellLayout.layout.secondarySidebarVisible &&
      this.state.activeSecondaryTab === id
    )
      this.closeSecondaryPanel();
    else this.openSecondaryPanel(id);
  }

  /** Hides the secondary sidebar without unregistering content. */
  closeSecondaryPanel() {
    this.services.shellLayout.layout.secondarySidebarVisible = false;
  }

  /** Toggles the secondary sidebar through its existing presentation path. */
  toggleSecondaryPanel() {
    if (this.services.shellLayout.layout.secondarySidebarVisible)
      this.closeSecondaryPanel();
    else this.openSecondaryPanel();
  }

  /** Reveals the primary sidebar and selects an eligible view. */
  openSidePanel(id = this.state.activeSidePanel) {
    if (!this.services.features.isAvailable('primarySidebar')) return;
    return this.services.shellNavigation.navigation.record(() => {
      if (!id && !this.sideMap.size) {
        this.state.sidebarVisible = true;
        return;
      }
      if (!id)
        id =
          [...this.sideMap.keys()].find((candidate) =>
            this.services.primaryViewBar.isVisible(candidate)
          ) ??
          this.sideMap.keys().next().value ??
          '';
      if (!this.sideMap.has(id)) throw new Error(`Unknown side panel: ${id}`);
      this.services.primaryViewBar.setVisible(id, true);
      this.state.activeSidePanel = id;
      this.state.sidebarVisible = true;
    });
  }

  /** Selects a primary view through navigation and presentation guards. */
  selectSideView(id: string) {
    if (
      this.services.shellLayout.layout.primaryViewBarPosition === 'default' &&
      this.state.sidebarVisible &&
      this.state.activeSidePanel === id
    )
      this.closeSidePanel();
    else this.openSidePanel(id);
  }

  /** Hides the primary sidebar while retaining its content. */
  closeSidePanel() {
    this.state.sidebarVisible = false;
  }

  /** Toggles the primary sidebar through its presentation path. */
  toggleSidePanel() {
    if (!this.state.sidebarVisible) this.repairSelections();
    this.state.sidebarVisible = !this.state.sidebarVisible;
  }

  /** Reveals the panel and selects an eligible registered view. */
  openBottomPanel(id = this.state.activeBottomTab) {
    if (!this.services.features.isAvailable('panel')) return;
    return this.services.shellNavigation.navigation.record(() => {
      if (!id && !this.tabMap.size) {
        this.state.panelVisible = true;
        return;
      }
      if (!id)
        id =
          [...this.tabMap.keys()].find(this.isViewVisible) ??
          this.tabMap.keys().next().value ??
          '';
      if (!this.tabMap.has(id)) throw new Error(`Unknown bottom tab: ${id}`);
      this.setViewVisible(id, true);
      this.state.activeBottomTab = id;
      this.state.panelVisible = true;
    });
  }

  /** Hides the panel without disposing its views. */
  closeBottomPanel() {
    this.state.panelVisible = false;
  }

  /** Toggles the panel through its existing presentation path. */
  toggleBottomPanel() {
    if (!this.state.panelVisible) this.openBottomPanel();
    else this.closeBottomPanel();
  }

  /** Maps a view region to the feature controlling its availability. */
  regionFeature(region?: ViewRegion) {
    return region === 'secondary'
      ? 'secondarySidebar'
      : region === 'bottom'
        ? 'panel'
        : 'primarySidebar';
  }

  /** Repairs active view selections after registration or visibility changes. */
  repairSelections() {
    if (
      !this.sideMap.has(this.state.activeSidePanel) ||
      !this.services.primaryViewBar.isVisible(this.state.activeSidePanel)
    )
      this.state.activeSidePanel =
        [...this.sideMap.keys()].find((id) =>
          this.services.primaryViewBar.isVisible(id)
        ) ?? '';
    if (
      !this.tabMap.has(this.state.activeBottomTab) ||
      !this.isViewVisible(this.state.activeBottomTab)
    )
      this.state.activeBottomTab =
        [...this.tabMap.keys()].find(this.isViewVisible) ?? '';
    if (
      !this.secondaryMap.has(this.state.activeSecondaryTab) ||
      !this.isViewVisible(this.state.activeSecondaryTab)
    )
      this.state.activeSecondaryTab =
        [...this.secondaryMap.keys()].find(this.isViewVisible) ?? '';
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.viewDrag.cancel();
    for (const map of [
      this.sideMap,
      this.tabMap,
      this.secondaryMap,
      this.viewMap,
      this.viewCommands,
      this.viewParents,
      this.childIds,
      this.contentHosts,
    ])
      map.clear();
    for (const values of [
      this.menuState.hidden,
      this.menuState.collapsed,
      this.menuState.heights,
    ])
      for (const id of Object.keys(values)) delete values[id];
    this.scope.stop();
  }

  /** Removes region membership before relocating a retained view. */
  private detachView(id: string) {
    const parent = this.viewParents.get(id);
    if (parent)
      this.childIds.set(
        parent,
        (this.childIds.get(parent) ?? []).filter((child) => child !== id)
      );
    else for (const map of Object.values(this.maps)) map.delete(id);
    this.viewParents.delete(id);
  }

  /** Reveals the shell region used by an interactive view operation. */
  private revealRegion(region: ViewRegion) {
    if (region === 'primary')
      this.services.shellLayout.layout.primarySidebarVisible = true;
    else if (region === 'secondary')
      this.services.shellLayout.layout.secondarySidebarVisible = true;
    else this.services.shellLayout.layout.panelVisible = true;
  }
}
