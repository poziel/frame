import type {BarSeparator} from '../layout/barSeparators';
import type {ComputedRef, ShallowReactive, ShallowRef} from 'vue';
import {viewControllerKeys} from './withPresentation';
import {BarSeparators, type BarSeparatorOptions} from '../layout/barSeparators';
import {computed, shallowReactive, shallowRef} from 'vue';
import type {
  ViewBadge,
  ViewBarPosition,
  ViewBarDisplay,
} from './primaryViewBar';
import type {PanelDefinition} from './shellViewContainer';

export type SecondaryViewBarDisplay = ViewBarDisplay;

export type SecondaryViewBarSize = 'default' | 'compact';

/** Secondary View Bar Options contract used by its owning shell controller. */
export interface SecondaryViewBarOptions extends BarSeparatorOptions {

  /** Initial icon and text display mode. */
  display?: SecondaryViewBarDisplay;

  /** Initial placement within the owning shell region. */
  position?: ViewBarPosition;

  /** Initial bar density, restored by presentation reset. */
  size?: SecondaryViewBarSize;

  /** Initially hide these root secondary views without unregistering them. */
  hidden?: readonly string[];

  /** Contribution IDs whose badges are initially hidden. */
  hiddenBadges?: readonly string[];

  /** Allow users and controller APIs to change size/display after initialization. */
  allowSizeChange?: boolean;

  /** Whether users and controller APIs may change display mode after initialization. */
  allowDisplayChange?: boolean;
}

/** Secondary View Bar Item contract used by its owning shell controller. */
export interface SecondaryViewBarItem extends PanelDefinition {

  /** Initial visibility preference; hiding retains the registration. */
  visible: boolean;

  /** Whether the current badge presentation is enabled. */
  badgeVisible: boolean;
}

/** Bar Layout contract used by its owning shell controller. */
interface BarLayout {

  /** Shared secondary view-bar display preference. */
  secondaryViewBarDisplay: SecondaryViewBarDisplay;

  /** Shared layout visibility of the secondary view bar. */
  secondaryViewBarVisible: boolean;

  /** Shared secondary bar placement while it is visible. */
  secondaryViewBarPosition: Exclude<ViewBarPosition, 'hidden'>;

  /** Shared secondary view-bar size preference. */
  secondaryViewBarSize: SecondaryViewBarSize;

  /** Physical side occupied by the primary sidebar. */
  primarySide: 'left' | 'right';
}

/**
 * Owns secondary view-bar presentation preferences for registered views.
 * Coordinates visibility and opposite-side placement through existing shell
 * services without creating a second view registry.
 */
export class SecondaryViewBar {

  /** Public projection used when composing this controller with shell availability. */
  readonly [viewControllerKeys] = [
    'allowSizeChange',
    'allowDisplayChange',
    'canMoveSeparators',
    'allowAddSeparator',
    'separators',
    'registerSeparator',
    'addSeparator',
    'removeSeparator',
    'moveSeparator',
    'disposeSeparators',
    'display',
    'effectiveDisplay',
    'position',
    'setPosition',
    'size',
    'side',
    'items',
    'setDisplay',
    'setSize',
    'moveSide',
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
  private readonly changeVisibility: (id: string, visible: boolean) => void;

  /** Shared layout state; this controller never creates a parallel layout store. */
  private readonly layout: BarLayout;

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly options: SecondaryViewBarOptions;

  /** Reads the owning region movement permission at operation time. */
  private readonly canMove: () => boolean;

  /** Whether configured size changes are permitted after initialization. */
  readonly allowSizeChange: boolean;

  /** Whether configured display changes are permitted after initialization. */
  readonly allowDisplayChange: boolean;

  /** Owns separator registration, ordering, and editing permissions. */
  private readonly separatorController: BarSeparators;

  /** Per-view badge visibility overrides. */
  private readonly badgeVisibility: ShallowReactive<Map<string, boolean>>;

  /** Per-view badge values overriding the registered presentation. */
  private readonly badgeValues: ShallowReactive<
    Map<string, ViewBadge | undefined>
  >;

  /** Prevents operations after this controller has released its resources. */
  private readonly disposed: ShallowRef<boolean, boolean>;

  /** Reactive configured bar display mode. */
  readonly display: ComputedRef<ViewBarDisplay>;

  /** Reactive placement read from the existing layout state. */
  readonly position: ComputedRef<ViewBarPosition>;

  /** Reactive display mode after applying collapse and presentation rules. */
  readonly effectiveDisplay: ComputedRef<ViewBarDisplay>;

  /** Reactive bar size read from the existing layout state. */
  readonly size: ComputedRef<SecondaryViewBarSize>;

  /** Reactive physical side derived from the primary sidebar placement. */
  readonly side: ComputedRef<'left' | 'right'>;

  /** Reactive projection of current registrations and effective presentation preferences. */
  readonly items: ComputedRef<SecondaryViewBarItem[]>;

  /** Reactive separator movement permission inherited from the owning region. */
  readonly canMoveSeparators: ComputedRef<boolean>;

  /** Whether a new separator can be registered under current editing permissions. */
  readonly allowAddSeparator: ComputedRef<boolean>;

  /** Reactive separator entries or the separator controller used to project them. */
  readonly separators: ComputedRef<readonly BarSeparator[]>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(
    registrations: () => readonly PanelDefinition[],
    visible: (id: string) => boolean,
    changeVisibility: (id: string, visible: boolean) => void,
    layout: BarLayout,
    options: SecondaryViewBarOptions = {},
    canMove: () => boolean = () => true
  ) {
    this.registrations = registrations;
    this.sourceVisible = visible;
    this.changeVisibility = changeVisibility;
    this.layout = layout;
    this.options = options;
    this.canMove = canMove;
    this.find = this.find.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.setDisplay = this.setDisplay.bind(this);
    this.setSize = this.setSize.bind(this);
    this.moveSide = this.moveSide.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.isBadgeVisible = this.isBadgeVisible.bind(this);
    this.setBadgeVisible = this.setBadgeVisible.bind(this);
    this.setBadge = this.setBadge.bind(this);
    this.initialize = this.initialize.bind(this);
    this.forget = this.forget.bind(this);
    this.resetPresentation = this.resetPresentation.bind(this);
    this.dispose = this.dispose.bind(this);
    this.allowSizeChange = this.options.allowSizeChange !== false;
    this.allowDisplayChange = this.options.allowDisplayChange !== false;
    this.separatorController = new BarSeparators(
      this.options,
      (id) => this.registrations().some((item) => item.id === id),
      this.canMove
    );
    this.badgeVisibility = shallowReactive(new Map<string, boolean>());
    this.badgeValues = shallowReactive(
      new Map<string, ViewBadge | undefined>()
    );
    this.disposed = shallowRef(false);
    this.display = computed(() => this.layout.secondaryViewBarDisplay);
    this.position = computed<ViewBarPosition>(() =>
      this.layout.secondaryViewBarVisible
        ? this.layout.secondaryViewBarPosition
        : 'hidden'
    );
    this.effectiveDisplay = computed<SecondaryViewBarDisplay>(
      () => this.display.value
    );
    this.size = computed(() => this.layout.secondaryViewBarSize);
    this.side = computed<'left' | 'right'>(() =>
      this.layout.primarySide === 'left' ? 'right' : 'left'
    );
    this.items = computed<SecondaryViewBarItem[]>(() =>
      this.disposed.value
        ? []
        : this.registrations().map((item) => ({
            ...item,
            visible: this.isVisible(item.id),
            badgeVisible: this.isBadgeVisible(item.id),
            badge: this.badgeValues.has(item.id)
              ? this.badgeValues.get(item.id)
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
  }

  /** Changes presentation placement when the controller and layout permit it. */
  setPosition(value: ViewBarPosition) {
    if (
      this.disposed.value ||
      !['default', 'top', 'bottom', 'hidden'].includes(value)
    )
      return false;
    if (value !== 'hidden') this.layout.secondaryViewBarPosition = value;
    this.layout.secondaryViewBarVisible = value !== 'hidden';
    return true;
  }

  /** Changes the bar display mode while respecting configuration locks. */
  setDisplay(value: SecondaryViewBarDisplay) {
    if (
      (!this.allowDisplayChange &&
        value !== (this.options.display ?? 'both')) ||
      this.disposed.value ||
      !['icons', 'text', 'both'].includes(value)
    )
      return false;
    this.layout.secondaryViewBarDisplay = value;
    return true;
  }

  /** Changes the bar size while respecting configuration locks. */
  setSize(value: SecondaryViewBarSize) {
    if (
      (!this.allowSizeChange && value !== (this.options.size ?? 'default')) ||
      this.disposed.value ||
      !['default', 'compact'].includes(value)
    )
      return false;
    this.layout.secondaryViewBarSize = value;
    return true;
  }

  /** Moves the secondary presentation by updating the shared primary-side setting. */
  moveSide(value: 'left' | 'right') {
    if (this.disposed.value || !['left', 'right'].includes(value)) return false;
    this.layout.primarySide = value === 'left' ? 'right' : 'left';
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
      (this.badgeVisibility.get(id) ?? !this.options.hiddenBadges?.includes(id))
    );
  }

  /** Updates the badge visibility preference for an existing contribution. */
  setBadgeVisible(id: string, value: boolean) {
    if (!this.find(id)) return false;
    this.badgeVisibility.set(id, value);
    return true;
  }

  /** Overrides the badge value without changing contribution registration. */
  setBadge(id: string, value?: ViewBadge) {
    if (!this.find(id)) return false;
    this.badgeValues.set(id, value);
    return true;
  }

  /** Applies configured visibility defaults to an existing registration. */
  initialize(id: string) {
    if (this.options.hidden?.includes(id) && this.find(id))
      this.changeVisibility(id, false);
  }

  /** Removes presentation overrides belonging to an ended registration. */
  forget(id: string) {
    this.badgeVisibility.delete(id);
    this.badgeValues.delete(id);
  }

  /** Restores configured presentation defaults without unregistering content. */
  resetPresentation() {
    this.layout.secondaryViewBarDisplay = this.options.display ?? 'both';
    this.setPosition(this.options.position ?? 'top');
    this.setSize(this.options.size ?? 'default');
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.separatorController.disposeSeparators();
    this.disposed.value = true;
    this.badgeVisibility.clear();
    this.badgeValues.clear();
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

export type SecondaryViewBarController = SecondaryViewBar &
  import('./shellPresentation').PresentationController;
