import type {ViewBadge} from '../layout/barTypes';
import type {ComputedRef, ShallowRef} from 'vue';
import {viewControllerKeys} from './withPresentation';
import {computed, reactive, shallowRef} from 'vue';
import {
  NavigationItems,
  type NavigationItem,
  type NavigationServices,
} from './navigationItems';
import type {BarDisplay, BarSize} from '../layout/barTypes';

export type NavigationBarPosition = 'top' | 'bottom' | 'left' | 'right';

export type NavigationBarJustification = 'left' | 'center' | 'right';

/** Navigation Bar Options contract used by its owning shell controller. */
export interface NavigationBarOptions {

  /** Whether user-created editable separators are permitted. */
  allowAddSeparator?: boolean;

  /** Initial collapse preference for vertical navigation display. */
  collapsed?: boolean;

  /** Initial visibility preference; hiding retains the registration. */
  visible?: boolean;

  /** Initial alignment of navigation items. */
  justification?: NavigationBarJustification;

  /** Initial placement within the owning shell region. */
  position?: NavigationBarPosition;

  /** Initial icon and text display mode. */
  display?: BarDisplay;

  /** Initial bar density, restored by presentation reset. */
  size?: BarSize;

  /** Contribution IDs initially hidden without unregistering their content. */
  hidden?: readonly string[];

  /** Contribution IDs whose badges are initially hidden. */
  hiddenBadges?: readonly string[];
}

/**
 * Coordinates navigation-item registration with bar presentation preferences.
 * Layout state and item lifecycle remain separate; configuration establishes
 * initial visibility, display mode, placement, and user overrides.
 */
export class NavigationBar {

  /** Public projection used when composing this controller with shell availability. */
  readonly [viewControllerKeys] = [
    'allowAddSeparator',
    'addSeparator',
    'collapsed',
    'canCollapse',
    'setCollapsed',
    'justification',
    'setJustification',
    'removeSeparator',
    'items',
    'find',
    'getItemState',
    'enabled',
    'register',
    'activate',
    'moveItem',
    'setItemVisible',
    'setBadgeVisible',
    'setBadge',
    'dispose',
    'visible',
    'position',
    'display',
    'effectiveDisplay',
    'size',
    'setVisible',
    'setPosition',
    'setDisplay',
    'setSize',
    'resetPresentation',
  ] as const;

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly options: boolean | NavigationBarOptions | undefined;

  /** Host navigation and error reporting used by contributed actions and links. */
  private readonly services: NavigationServices;

  /** Reads feature availability independently of user presentation preferences. */
  private readonly sourceAvailable: () => boolean;

  /** Initial configuration retained for registration defaults and reset operations. */
  private readonly initial: NavigationBarOptions;

  /** Navigation registry owning the contributed items and their activation behavior. */
  private readonly registry: NavigationItems;

  /** Sequence used to allocate separator IDs without colliding with registrations. */
  private serial: number;

  /** Reactive presentation state shared with the owning shell. */
  private readonly state: {
    collapsed: boolean;
    justification: NavigationBarJustification;
    visible: boolean;
    position: NavigationBarPosition;
    display: BarDisplay;
    size: BarSize;
  };

  /** Initial presentation values restored by reset operations. */
  private readonly defaults: {
    collapsed: boolean;
    justification: NavigationBarJustification;
    visible: boolean;
    position: NavigationBarPosition;
    display: BarDisplay;
    size: BarSize;
  };

  /** Prevents operations after this controller has released its resources. */
  private readonly disposed: ShallowRef<boolean, boolean>;

  /** Whether the current orientation and display mode support collapsing. */
  readonly canCollapse: ComputedRef<boolean>;

  /** Whether a new separator can be registered under current editing permissions. */
  readonly allowAddSeparator: ComputedRef<boolean>;

  /** Reactive navigation collapse preference. */
  readonly collapsed: ComputedRef<boolean>;

  /** Reactive navigation alignment preference. */
  readonly justification: ComputedRef<NavigationBarJustification>;

  /** Reactive projection of current registrations and effective presentation preferences. */
  readonly items: ComputedRef<readonly NavigationItem[]>;

  /** Reactive presentation visibility including the configured availability source. */
  readonly visible: ComputedRef<boolean>;

  /** Reactive placement read from the existing layout state. */
  readonly position: ComputedRef<NavigationBarPosition>;

  /** Reactive configured bar display mode. */
  readonly display: ComputedRef<BarDisplay>;

  /** Reactive display mode after applying collapse and presentation rules. */
  readonly effectiveDisplay: ComputedRef<BarDisplay>;

  /** Reactive bar size read from the existing layout state. */
  readonly size: ComputedRef<BarSize>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(
    options: boolean | NavigationBarOptions | undefined,
    services: NavigationServices,
    available: () => boolean = () => true
  ) {
    this.options = options;
    this.services = services;
    this.sourceAvailable = available;
    this.register = this.register.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.setDisplay = this.setDisplay.bind(this);
    this.setSize = this.setSize.bind(this);
    this.setJustification = this.setJustification.bind(this);
    this.setCollapsed = this.setCollapsed.bind(this);
    this.addSeparator = this.addSeparator.bind(this);
    this.dispose = this.dispose.bind(this);
    this.resetPresentation = this.resetPresentation.bind(this);
    this.initial = typeof this.options === 'object' ? this.options : {};
    this.registry = new NavigationItems(this.services);
    this.serial = 0;
    this.state = reactive({
      collapsed: this.initial.collapsed ?? false,
      justification: this.initial.justification ?? 'left',
      visible:
        this.sourceAvailable() &&
        this.options !== undefined &&
        this.options !== false &&
        (this.initial.visible ?? true),
      position: this.initial.position ?? 'top',
      display: this.initial.display ?? 'icons',
      size: this.initial.size ?? 'default',
    });
    this.defaults = {...this.state};
    this.disposed = shallowRef(false);
    this.canCollapse = computed(
      () =>
        !this.disposed.value &&
        ['left', 'right'].includes(this.state.position) &&
        this.state.display === 'both'
    );
    this.allowAddSeparator = computed(
      () => !this.disposed.value && !!this.initial.allowAddSeparator
    );
    this.collapsed = computed(() => this.state.collapsed);
    this.justification = computed(() => this.state.justification);
    this.removeSeparator = this.removeSeparator.bind(this);
    this.items = this.registry.items;
    this.find = this.find.bind(this);
    this.getItemState = this.getItemState.bind(this);
    this.enabled = this.enabled.bind(this);
    this.activate = this.activate.bind(this);
    this.moveItem = this.moveItem.bind(this);
    this.setItemVisible = this.setItemVisible.bind(this);
    this.setBadgeVisible = this.setBadgeVisible.bind(this);
    this.setBadge = this.setBadge.bind(this);
    this.visible = computed(() => this.sourceAvailable() && this.state.visible);
    this.position = computed(() => this.state.position);
    this.display = computed(() => this.state.display);
    this.effectiveDisplay = computed(() =>
      this.canCollapse.value && this.state.collapsed
        ? 'icons'
        : this.state.display
    );
    this.size = computed(() => this.state.size);
  }

  /** Registers a contribution and returns cleanup scoped to that exact registration. */
  register(item: NavigationItem) {
    const owner = this;
    const remove = owner.registry.register(item);
    function initialize(entry: NavigationItem) {
      if (owner.initial.hidden?.includes(entry.id))
        owner.registry.setItemVisible(entry.id, false);
      if (owner.initial.hiddenBadges?.includes(entry.id))
        owner.registry.setBadgeVisible(entry.id, false);
      if (entry.type === 'dropdown') entry.items.forEach(initialize);
    }
    initialize(item);
    return remove;
  }

  /** Changes visibility through the existing registration or presentation state. */
  setVisible(value: boolean) {
    if (this.disposed.value) return false;
    this.state.visible = value && this.sourceAvailable();
    return true;
  }

  /** Changes presentation placement when the controller and layout permit it. */
  setPosition(value: NavigationBarPosition) {
    if (
      this.disposed.value ||
      !['top', 'bottom', 'left', 'right'].includes(value)
    )
      return false;
    this.state.position = value;
    return true;
  }

  /** Changes the bar display mode while respecting configuration locks. */
  setDisplay(value: BarDisplay) {
    if (this.disposed.value || !['icons', 'text', 'both'].includes(value))
      return false;
    this.state.display = value;
    return true;
  }

  /** Changes the bar size while respecting configuration locks. */
  setSize(value: BarSize) {
    if (this.disposed.value || !['default', 'compact'].includes(value))
      return false;
    this.state.size = value;
    return true;
  }

  /** Changes navigation alignment without re-registering items. */
  setJustification(value: NavigationBarJustification) {
    if (this.disposed.value || !['left', 'center', 'right'].includes(value))
      return false;
    this.state.justification = value;
    return true;
  }

  /** Updates the navigation bar collapse preference. */
  setCollapsed(value: boolean) {
    if (this.disposed.value) return false;
    this.state.collapsed = value;
    return true;
  }

  /** Adds an editable separator at the requested insertion boundary. */
  addSeparator(before?: string) {
    if (
      this.disposed.value ||
      !this.initial.allowAddSeparator ||
      (before !== undefined &&
        !this.registry.items.value.some((item) => item.id === before))
    )
      return undefined;
    let id: string;
    do {
      id = `separator-${++this.serial}`;
    } while (this.registry.find(id));
    this.register({id, type: 'separator', allowRemove: true});
    this.registry.moveItem(id, before);
    return id;
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.disposed.value = true;
    this.state.visible = false;
    this.registry.dispose();
  }

  /** Restores configured presentation defaults without unregistering content. */
  resetPresentation() {
    if (!this.disposed.value) {
      Object.assign(this.state, this.defaults);
      this.state.visible = this.state.visible && this.sourceAvailable();
    }
  }

  /** Removes a registered separator when its editing permissions allow removal. */
  removeSeparator(id: string): boolean {
    return this.registry.removeSeparator(id);
  }

  /** Looks up a current registration without creating or replacing its identity. */
  find(id: string): NavigationItem | undefined {
    return this.registry.find(id);
  }

  /** Reads effective item visibility and badge preferences without exposing mutable maps. */
  getItemState(id: string):
    | Readonly<{
        visible: boolean;
        badgeVisible: boolean;
        badge: ViewBadge | undefined;
      }>
    | undefined {
    return this.registry.getItemState(id);
  }

  /** Checks this item and its ancestors before allowing activation. */
  enabled(id: string): boolean {
    return this.registry.enabled(id);
  }

  /** Executes an available item through its registered action or host navigation service. */
  activate(id: string): Promise<boolean> {
    return this.registry.activate(id);
  }

  /** Reorders a registered root item while respecting drag restrictions. */
  moveItem(id: string, beforeId?: string): boolean {
    return this.registry.moveItem(id, beforeId);
  }

  /** Updates the visibility preference for a registered navigation item. */
  setItemVisible(id: string, value: boolean): boolean {
    return this.registry.setItemVisible(id, value);
  }

  /** Updates the badge visibility preference for an existing contribution. */
  setBadgeVisible(id: string, value: boolean): boolean {
    return this.registry.setBadgeVisible(id, value);
  }

  /** Overrides the badge value without changing contribution registration. */
  setBadge(id: string, value?: ViewBadge): boolean {
    return this.registry.setBadge(id, value);
  }
}
