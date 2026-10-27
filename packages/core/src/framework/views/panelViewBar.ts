import type {BarSeparator} from '../layout/barSeparators';
import type {ComputedRef, ShallowReactive, ShallowRef} from 'vue';
import {viewControllerKeys} from './withPresentation';
import {BarSeparators, type BarSeparatorOptions} from '../layout/barSeparators';
import {computed, shallowReactive, shallowRef} from 'vue';
import type {PanelDefinition} from './shellViewContainer';
import type {ViewBadge} from './primaryViewBar';

export type PanelDisplay = 'icons' | 'text' | 'both';

/** Panel View Bar Options contract used by its owning shell controller. */
export interface PanelViewBarOptions extends BarSeparatorOptions {

  /** Initial visibility preference; hiding retains the registration. */
  visible?: boolean;

  /** Initial bar density, restored by presentation reset. */
  size?: 'default' | 'compact';

  /** Initial icon and text display mode. */
  display?: PanelDisplay;

  /** Contribution IDs initially hidden without unregistering their content. */
  hidden?: readonly string[];

  /** Contribution IDs whose badges are initially hidden. */
  hiddenBadges?: readonly string[];
}

/** Panel View Item contract used by its owning shell controller. */
export interface PanelViewItem extends PanelDefinition {

  /** Initial visibility preference; hiding retains the registration. */
  visible: boolean;

  /** Whether the current badge presentation is enabled. */
  badgeVisible: boolean;
}

/** Panel Layout contract used by its owning shell controller. */
interface PanelLayout {

  /** Shared panel view-bar display preference. */
  panelViewBarDisplay: PanelDisplay;

  /** Shared layout visibility of the panel view bar. */
  panelViewBarVisible: boolean;

  /** Shared panel view-bar size preference. */
  panelViewBarSize: 'default' | 'compact';
}

/**
 * Owns panel view-bar display, badge, and separator preferences.
 * Registered panel content and its visibility remain owned by the supplied
 * registration services and shared layout state.
 */
export class PanelViewBar {

  /** Public projection used when composing this controller with shell availability. */
  readonly [viewControllerKeys] = [
    'canMoveSeparators',
    'allowAddSeparator',
    'separators',
    'registerSeparator',
    'addSeparator',
    'removeSeparator',
    'moveSeparator',
    'disposeSeparators',
    'visible',
    'size',
    'setSize',
    'setBarVisible',
    'display',
    'items',
    'setDisplay',
    'isVisible',
    'setVisible',
    'isBadgeVisible',
    'setBadgeVisible',
    'setBadge',
    'initialize',
    'forget',
    'resetPresentation',
    'dispose',
  ] as const;

  /** Reads current view registrations without taking ownership of their lifetime. */
  private readonly registrations: () => readonly PanelDefinition[];

  /** Reactive presentation visibility including the configured availability source. */
  private readonly sourceVisible: (id: string) => boolean;

  /** Coordinates content visibility with the owning registration service. */
  private readonly changeVisibility: (id: string, value: boolean) => void;

  /** Shared layout state; this controller never creates a parallel layout store. */
  private readonly layout: PanelLayout;

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly options: PanelViewBarOptions;

  /** Reads the owning region movement permission at operation time. */
  private readonly canMove: () => boolean;

  /** Owns separator registration, ordering, and editing permissions. */
  private readonly separatorController: BarSeparators;

  /** Per-item badge visibility overrides. */
  private readonly badges: ShallowReactive<Map<string, boolean>>;

  /** Per-item badge values or fallback presentation data. */
  private readonly values: ShallowReactive<Map<string, ViewBadge | undefined>>;

  /** Prevents operations after this controller has released its resources. */
  private readonly disposed: ShallowRef<boolean, boolean>;

  /** Reactive bar size read from the existing layout state. */
  readonly size: ComputedRef<'default' | 'compact'>;

  /** Reactive bar visibility from the shared layout state. */
  private readonly barVisible: ComputedRef<boolean>;

  /** Reactive configured bar display mode. */
  readonly display: ComputedRef<PanelDisplay>;

  /** Reactive projection of current registrations and effective presentation preferences. */
  readonly items: ComputedRef<PanelViewItem[]>;

  /** Reactive separator movement permission inherited from the owning region. */
  readonly canMoveSeparators: ComputedRef<boolean>;

  /** Whether a new separator can be registered under current editing permissions. */
  readonly allowAddSeparator: ComputedRef<boolean>;

  /** Reactive separator entries or the separator controller used to project them. */
  readonly separators: ComputedRef<readonly BarSeparator[]>;

  /** Reactive presentation visibility including the configured availability source. */
  readonly visible: ComputedRef<boolean>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(
    registrations: () => readonly PanelDefinition[],
    visible: (id: string) => boolean,
    changeVisibility: (id: string, value: boolean) => void,
    layout: PanelLayout,
    options: PanelViewBarOptions = {},
    canMove: () => boolean = () => true
  ) {
    this.registrations = registrations;
    this.sourceVisible = visible;
    this.changeVisibility = changeVisibility;
    this.layout = layout;
    this.options = options;
    this.canMove = canMove;
    this.find = this.find.bind(this);
    this.setSize = this.setSize.bind(this);
    this.setBarVisible = this.setBarVisible.bind(this);
    this.setDisplay = this.setDisplay.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.isBadgeVisible = this.isBadgeVisible.bind(this);
    this.setBadgeVisible = this.setBadgeVisible.bind(this);
    this.setBadge = this.setBadge.bind(this);
    this.initialize = this.initialize.bind(this);
    this.forget = this.forget.bind(this);
    this.resetPresentation = this.resetPresentation.bind(this);
    this.dispose = this.dispose.bind(this);
    this.separatorController = new BarSeparators(
      this.options,
      (id) => this.registrations().some((item) => item.id === id),
      this.canMove
    );
    this.badges = shallowReactive(new Map<string, boolean>());
    this.values = shallowReactive(new Map<string, ViewBadge | undefined>());
    this.disposed = shallowRef(false);
    this.size = computed(() => this.layout.panelViewBarSize);
    this.barVisible = computed(() => this.layout.panelViewBarVisible);
    this.display = computed(() => this.layout.panelViewBarDisplay);
    this.items = computed<PanelViewItem[]>(() =>
      this.disposed.value
        ? []
        : this.registrations().map((item) => ({
            ...item,
            visible: this.isVisible(item.id),
            badgeVisible: this.isBadgeVisible(item.id),
            badge: this.values.has(item.id)
              ? this.values.get(item.id)
              : item.badge,
          }))
    );
    this.resetPresentation();
    this.canMoveSeparators = this.separatorController.canMoveSeparators;
    this.allowAddSeparator = this.separatorController.allowAddSeparator;
    this.separators = this.separatorController.separators;
    this.registerSeparator = this.registerSeparator.bind(this);
    this.addSeparator = this.addSeparator.bind(this);
    this.removeSeparator = this.removeSeparator.bind(this);
    this.moveSeparator = this.moveSeparator.bind(this);
    this.disposeSeparators = this.disposeSeparators.bind(this);
    this.visible = this.barVisible;
  }

  /** Changes the bar size while respecting configuration locks. */
  setSize(value: 'default' | 'compact') {
    if (this.disposed.value || !['default', 'compact'].includes(value))
      return false;
    this.layout.panelViewBarSize = value;
    return true;
  }

  /** Changes bar visibility without altering feature availability. */
  setBarVisible(value: boolean) {
    if (this.disposed.value) return false;
    this.layout.panelViewBarVisible = value;
    return true;
  }

  /** Changes the bar display mode while respecting configuration locks. */
  setDisplay(value: PanelDisplay) {
    if (this.disposed.value || !['icons', 'text', 'both'].includes(value))
      return false;
    this.layout.panelViewBarDisplay = value;
    return true;
  }

  /** Reads the effective visibility preference of a registered contribution. */
  isVisible(id: string) {
    return !!this.find(id) && this.sourceVisible(id);
  }

  /** Changes visibility through the existing registration or presentation state. */
  setVisible(id: string, value: boolean) {
    if (!this.find(id)) return false;
    this.changeVisibility(id, value);
    return true;
  }

  /** Reads effective badge visibility for a current registration. */
  isBadgeVisible(id: string) {
    return (
      !!this.find(id) &&
      (this.badges.get(id) ?? !this.options.hiddenBadges?.includes(id))
    );
  }

  /** Updates the badge visibility preference for an existing contribution. */
  setBadgeVisible(id: string, value: boolean) {
    if (!this.find(id)) return false;
    this.badges.set(id, value);
    return true;
  }

  /** Overrides the badge value without changing contribution registration. */
  setBadge(id: string, value?: ViewBadge) {
    if (!this.find(id)) return false;
    this.values.set(id, value);
    return true;
  }

  /** Applies configured visibility defaults to an existing registration. */
  initialize(id: string) {
    if (this.options.hidden?.includes(id) && this.find(id))
      this.changeVisibility(id, false);
  }

  /** Removes presentation overrides belonging to an ended registration. */
  forget(id: string) {
    this.badges.delete(id);
    this.values.delete(id);
  }

  /** Restores configured presentation defaults without unregistering content. */
  resetPresentation() {
    if (this.disposed.value) return;
    this.setDisplay(this.options.display ?? 'both');
    this.setSize(this.options.size ?? 'default');
    this.setBarVisible(this.options.visible ?? true);
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.separatorController.disposeSeparators();
    this.disposed.value = true;
    this.badges.clear();
    this.values.clear();
  }

  /** Registers a host-owned separator and returns its identity-safe cleanup. */
  registerSeparator(input: BarSeparator): () => void {
    return this.separatorController.registerSeparator(input);
  }

  /** Adds an editable separator at the requested insertion boundary. */
  addSeparator(before?: string): string | undefined {
    return this.separatorController.addSeparator(before);
  }

  /** Removes a registered separator when its editing permissions allow removal. */
  removeSeparator(id: string): boolean {
    return this.separatorController.removeSeparator(id);
  }

  /** Moves an existing separator between insertion boundaries when permitted. */
  moveSeparator(id: string, before?: string): boolean {
    return this.separatorController.moveSeparator(id, before);
  }

  /** Releases separator state and prevents future separator registration. */
  disposeSeparators(): void {
    return this.separatorController.disposeSeparators();
  }

  /** Looks up a current registration without creating or replacing its identity. */
  private find(id: string) {
    return this.disposed.value
      ? undefined
      : this.registrations().find((item) => item.id === id);
  }
}

export type PanelViewBarController = PanelViewBar &
  import('./shellPresentation').PresentationController;
