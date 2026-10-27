import type {BarSeparator} from '../layout/barSeparators';
import type {ComputedRef, ShallowReactive, ShallowRef} from 'vue';
import {viewControllerKeys} from './withPresentation';
import {BarSeparators, type BarSeparatorOptions} from '../layout/barSeparators';
import {computed, shallowReactive, shallowRef} from 'vue';

/** Presentation of registered primary-sidebar views only. */
export type ViewBadge = string | number;

export type ViewBarPosition = 'default' | 'top' | 'bottom' | 'hidden';

export type ViewBarDisplay = 'icons' | 'text' | 'both';

export type ViewBarSize = 'default' | 'compact';

/** View Bar Layout State contract used by its owning shell controller. */
interface ViewBarLayoutState {

  /** Shared layout visibility of the primary view bar. */
  primaryViewBarVisible: boolean;

  /** Shared primary bar placement while it is visible. */
  primaryViewBarPosition: Exclude<ViewBarPosition, 'hidden'>;

  /** Shared primary view-bar size preference. */
  primaryViewBarSize: ViewBarSize;

  /** Shared primary view-bar display preference. */
  primaryViewBarDisplay: ViewBarDisplay;

  /** Physical side occupied by the primary sidebar. */
  primarySide: 'left' | 'right';
}

/** Primary View Bar Options contract used by its owning shell controller. */
export interface PrimaryViewBarOptions extends BarSeparatorOptions {

  /** Initial placement within the owning shell region. */
  position?: ViewBarPosition;

  /** Initial bar density, restored by presentation reset. */
  size?: ViewBarSize;

  /** Initial icon and text display mode. */
  display?: ViewBarDisplay;

  /** Contribution IDs initially hidden without unregistering their content. */
  hidden?: readonly string[];

  /** Contribution IDs whose badges are initially hidden. */
  hiddenBadges?: readonly string[];

  /** Allow users and controller APIs to change size/display after initialization. */
  allowSizeChange?: boolean;

  /** Whether users and controller APIs may change display mode after initialization. */
  allowDisplayChange?: boolean;
}

/** View Registration contract used by its owning shell controller. */
export interface ViewRegistration {

  /** Stable identifier within the owning registration collection. */
  id: string;

  /** Human-readable and accessible name for this contribution. */
  label: string;

  /** Optional badge supplied by the host contribution. */
  badge?: ViewBadge;

  /** Default visibility used when no user override exists. */
  defaultVisible?: boolean;
}

/** View Item contract used by its owning shell controller. */
export interface ViewItem extends ViewRegistration {

  /** Initial visibility preference; hiding retains the registration. */
  visible: boolean;

  /** Whether the current badge presentation is enabled. */
  badgeVisible: boolean;
}

/**
 * Owns primary view-bar presentation preferences for registered views.
 * Size, display, badges, and separators remain independent of view lifetime;
 * changes use the supplied layout and visibility coordination callbacks.
 */
export class PrimaryViewBar {

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
    'position',
    'size',
    'display',
    'effectiveDisplay',
    'setDisplay',
    'setPosition',
    'setSize',
    'movePrimarySide',
    'resetPresentation',
    'items',
    'isVisible',
    'setVisible',
    'isBadgeVisible',
    'setBadgeVisible',
    'setBadge',
    'forget',
    'dispose',
  ] as const;

  /** Reads current view registrations without taking ownership of their lifetime. */
  private readonly registrations: () => readonly ViewRegistration[];

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly options: PrimaryViewBarOptions;

  /** Notifies the owning shell when a registered view visibility preference changes. */
  private readonly changed:
    ((input: string, visible: boolean) => void) | undefined;

  /** Shared layout state; this controller never creates a parallel layout store. */
  private readonly layout: ViewBarLayoutState | undefined;

  /** Reads the owning region movement permission at operation time. */
  private readonly canMove: () => boolean;

  /** Whether configured size changes are permitted after initialization. */
  readonly allowSizeChange: boolean;

  /** Whether configured display changes are permitted after initialization. */
  readonly allowDisplayChange: boolean;

  /** Owns separator registration, ordering, and editing permissions. */
  private readonly separatorController: BarSeparators;

  /** Per-item visibility overrides retained independently of registration data. */
  private readonly visibility: ShallowReactive<Map<string, boolean>>;

  /** Per-item badge visibility overrides. */
  private readonly badges: ShallowReactive<Map<string, boolean>>;

  /** Per-view badge values overriding the registered presentation. */
  private readonly badgeValues: ShallowReactive<
    Map<string, ViewBadge | undefined>
  >;

  /** Prevents operations after this controller has released its resources. */
  private readonly disposed: ShallowRef<boolean, boolean>;

  /** Reactive placement read from the existing layout state. */
  readonly position: ComputedRef<ViewBarPosition>;

  /** Reactive bar size read from the existing layout state. */
  readonly size: ComputedRef<ViewBarSize>;

  /** Reactive configured bar display mode. */
  readonly display: ComputedRef<ViewBarDisplay>;

  /** Reactive display mode after applying collapse and presentation rules. */
  readonly effectiveDisplay: ComputedRef<ViewBarDisplay>;

  /** Reactive projection of current registrations and effective presentation preferences. */
  readonly items: ComputedRef<ViewItem[]>;

  /** Reactive separator movement permission inherited from the owning region. */
  readonly canMoveSeparators: ComputedRef<boolean>;

  /** Whether a new separator can be registered under current editing permissions. */
  readonly allowAddSeparator: ComputedRef<boolean>;

  /** Reactive separator entries or the separator controller used to project them. */
  readonly separators: ComputedRef<readonly BarSeparator[]>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(
    registrations: () => readonly ViewRegistration[],
    options: PrimaryViewBarOptions = {},
    changed?: (input: string, visible: boolean) => void,
    layout?: ViewBarLayoutState,
    canMove: () => boolean = () => true
  ) {
    this.registrations = registrations;
    this.options = options;
    this.changed = changed;
    this.layout = layout;
    this.canMove = canMove;
    this.find = this.find.bind(this);
    this.setDisplay = this.setDisplay.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.setSize = this.setSize.bind(this);
    this.movePrimarySide = this.movePrimarySide.bind(this);
    this.resetPresentation = this.resetPresentation.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.isBadgeVisible = this.isBadgeVisible.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.setBadgeVisible = this.setBadgeVisible.bind(this);
    this.setBadge = this.setBadge.bind(this);
    this.forget = this.forget.bind(this);
    this.dispose = this.dispose.bind(this);
    this.allowSizeChange = this.options.allowSizeChange !== false;
    this.allowDisplayChange = this.options.allowDisplayChange !== false;
    this.separatorController = new BarSeparators(
      this.options,
      (id) => this.registrations().some((item) => item.id === id),
      this.canMove
    );
    this.visibility = shallowReactive(
      new Map((this.options.hidden ?? []).map((item) => [item, false]))
    );
    this.badges = shallowReactive(
      new Map((this.options.hiddenBadges ?? []).map((item) => [item, false]))
    );
    this.badgeValues = shallowReactive(
      new Map<string, ViewBadge | undefined>()
    );
    this.disposed = shallowRef(false);
    this.position = computed<ViewBarPosition>(() =>
      this.layout
        ? this.layout.primaryViewBarVisible
          ? (this.layout.primaryViewBarPosition ?? 'default')
          : 'hidden'
        : 'default'
    );
    this.size = computed<ViewBarSize>(
      () => this.layout?.primaryViewBarSize ?? 'default'
    );
    this.display = computed<ViewBarDisplay>(
      () => this.layout?.primaryViewBarDisplay ?? 'icons'
    );
    this.effectiveDisplay = computed<ViewBarDisplay>(() => this.display.value);
    if (this.layout && this.options.display !== undefined)
      this.layout.primaryViewBarDisplay = this.options.display;
    if (this.options.position !== undefined)
      this.setPosition(this.options.position);
    if (this.options.size !== undefined) this.setSize(this.options.size);
    this.items = computed<ViewItem[]>(() =>
      this.disposed.value
        ? []
        : this.registrations().map((entry) => ({
            ...entry,
            badge: this.badgeValues.has(entry.id)
              ? this.badgeValues.get(entry.id)
              : entry.badge,
            visible: this.isVisible(entry.id),
            badgeVisible: this.isBadgeVisible(entry.id),
          }))
    );
    this.canMoveSeparators = this.separatorController.canMoveSeparators;
    this.allowAddSeparator = this.separatorController.allowAddSeparator;
    this.separators = this.separatorController.separators;
    this.registerSeparator = this.registerSeparator.bind(this);
    this.addSeparator = this.addSeparator.bind(this);
    this.removeSeparator = this.removeSeparator.bind(this);
    this.moveSeparator = this.moveSeparator.bind(this);
    this.disposeSeparators = this.disposeSeparators.bind(this);
  }

  /** Changes the bar display mode while respecting configuration locks. */
  setDisplay(value: ViewBarDisplay) {
    if (
      (!this.allowDisplayChange &&
        value !== (this.options.display ?? 'icons')) ||
      this.disposed.value ||
      !this.layout ||
      !['icons', 'text', 'both'].includes(value)
    )
      return false;
    this.layout.primaryViewBarDisplay = value;
    return true;
  }

  /** Changes presentation placement when the controller and layout permit it. */
  setPosition(value: ViewBarPosition) {
    if (
      this.disposed.value ||
      !this.layout ||
      !['default', 'top', 'bottom', 'hidden'].includes(value)
    )
      return false;
    if (value !== 'hidden') this.layout.primaryViewBarPosition = value;
    this.layout.primaryViewBarVisible = value !== 'hidden';
    return true;
  }

  /** Changes the bar size while respecting configuration locks. */
  setSize(value: ViewBarSize) {
    if (
      (!this.allowSizeChange && value !== (this.options.size ?? 'default')) ||
      this.disposed.value ||
      !this.layout ||
      !['default', 'compact'].includes(value)
    )
      return false;
    this.layout.primaryViewBarSize = value;
    return true;
  }

  /** Moves the primary sidebar through the existing layout state. */
  movePrimarySide(side: 'left' | 'right') {
    if (
      this.disposed.value ||
      !this.layout ||
      !['left', 'right'].includes(side)
    )
      return false;
    this.layout.primarySide = side;
    return true;
  }

  /** Restores configured presentation defaults without unregistering content. */
  resetPresentation() {
    if (this.layout)
      this.layout.primaryViewBarDisplay = this.options.display ?? 'icons';
    this.setPosition(this.options.position ?? 'default');
    this.setSize(this.options.size ?? 'default');
  }

  /** Reads the effective visibility preference of a registered contribution. */
  isVisible(input: string) {
    const entry = this.find(input);
    return (
      !!entry && (this.visibility.get(input) ?? entry.defaultVisible !== false)
    );
  }

  /** Reads effective badge visibility for a current registration. */
  isBadgeVisible(input: string) {
    return !!this.find(input) && (this.badges.get(input) ?? true);
  }

  /** Changes visibility through the existing registration or presentation state. */
  setVisible(input: string, visible: boolean) {
    if (!this.find(input)) return false;
    if (this.isVisible(input) !== visible) {
      this.visibility.set(input, visible);
      this.changed?.(input, visible);
    }
    return true;
  }

  /** Updates the badge visibility preference for an existing contribution. */
  setBadgeVisible(input: string, visible: boolean) {
    if (!this.find(input)) return false;
    this.badges.set(input, visible);
    return true;
  }

  /** Overrides the badge value without changing contribution registration. */
  setBadge(input: string, badge?: ViewBadge) {
    if (!this.find(input)) return false;
    this.badgeValues.set(input, badge);
    return true;
  }

  /** Removes presentation overrides belonging to an ended registration. */
  forget(input: string) {
    const key = input;
    this.visibility.delete(key);
    this.badges.delete(key);
    this.badgeValues.delete(key);
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.separatorController.disposeSeparators();
    this.disposed.value = true;
    this.visibility.clear();
    this.badges.clear();
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
  private find(input: string) {
    return this.disposed.value
      ? undefined
      : this.registrations().find((entry) => entry.id === input);
  }
}

export type PrimaryViewBarController = PrimaryViewBar &
  import('./shellPresentation').PresentationController;
