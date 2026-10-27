import type {BarSeparator} from '../layout/barSeparators';
import type {ComputedRef, ShallowReactive, ShallowRef} from 'vue';
import {computed, markRaw, shallowReactive, shallowRef} from 'vue';
import type {Component} from 'vue';
import type {FrameMenuItem} from '../../components/navigation/generalMenu';
import {BarSeparators, type BarSeparatorOptions} from '../layout/barSeparators';

export type StatusSide = 'left' | 'right';

export type StatusSeverity = 'info' | 'success' | 'warning' | 'error';

/** Status Message contract used by its owning shell controller. */
export interface StatusMessage {

  /** Text displayed by this status contribution or message. */
  text: string;

  /** Visual severity used for the centered status message. */
  severity: StatusSeverity;
}

/** Status Message Options contract used by its owning shell controller. */
export interface StatusMessageOptions {

  /** Milliseconds before dismissal; zero retains the message until explicitly cleared. */
  duration?: number;

  /** Visual severity used for the centered status message. */
  severity?: StatusSeverity;
}

/** Status Options contract used by its owning shell controller. */
export interface StatusOptions extends BarSeparatorOptions {

  /** Permit moving items between sides and repositioning separators. Default: true. */
  allowMove?: boolean;

  /** Initial visibility preference; hiding retains the registration. */
  visible?: boolean;

  /** Initial persistent centered status message. */
  message?: string;

  /** Contribution IDs initially hidden without unregistering their content. */
  hidden?: readonly string[];

  /** Contribution IDs whose badges are initially hidden. */
  hiddenBadges?: readonly string[];
}

/** Status Item Base contract used by its owning shell controller. */
interface StatusItemBase {

  /** Stable identifier within the owning registration collection. */
  id: string;

  /** Stable accessible name and context-menu label. */
  label: string;

  /** Text displayed by this status contribution or message. */
  text?: string;

  /** Optional icon displayed with the contribution. */
  icon?: string | Component;

  /** Optional accessible hover description. */
  tooltip?: string;

  /** Optional keyboard shortcut displayed with this control. */
  shortcut?: string;

  /** Whether the controlled shell region is currently open. */
  expanded?: boolean;

  /** Accessible identifier of the region controlled by this action. */
  controls?: string;

  /** Preferred status side before user movement overrides. */
  side?: StatusSide;

  /** Lower values appear first within each side. Registration order breaks ties. */
  order?: number;

  /** Synchronize an installed feature's own presentation after a side move. */
  onMove?: (side: StatusSide) => void;

  /** Initial visibility preference; hiding retains the registration. */
  visible?: boolean;

  /** Optional badge supplied by the host contribution. */
  badge?: string | number;

  /** Availability is distinct from the user's visibility preference. */
  available?: () => boolean;

  /** Allows an installed item to use another presentation, such as the title bar. */
  showInStatusBar?: () => boolean;
}

export type StatusItemDefinition = StatusItemBase &
  (
    | {kind: 'text'; run?: never; menu?: never; disabled?: never}
    | {
        kind: 'button';
        run?: () => void;
        menu?: () => readonly FrameMenuItem[];
        disabled?: boolean;
      }
  );

export type StatusItem = Omit<
  StatusItemDefinition,
  'side' | 'visible' | 'available' | 'showInStatusBar'
> & {
  side: StatusSide;
  visible: boolean;
  badgeVisible: boolean;
  available: boolean;
  showInStatusBar: boolean;
};

/** Status Item Update contract used by its owning shell controller. */
export interface StatusItemUpdate {

  /** Human-readable and accessible name for this contribution. */
  label?: string;

  /** Text displayed by this status contribution or message. */
  text?: string;

  /** Optional accessible hover description. */
  tooltip?: string;

  /** Optional icon displayed with the contribution. */
  icon?: string | Component;

  /** Optional badge supplied by the host contribution. */
  badge?: string | number;

  /** Whether activation is temporarily blocked while the item remains registered. */
  disabled?: boolean;
}

/**
 * Owns status contributions, visibility preferences, and transient messages.
 * Contributions retain identity until their registration ends. Message timers
 * and separator resources are released with this controller.
 */
export class Status {

  /** Shared layout state; this controller never creates a parallel layout store. */
  private readonly layout: {statusBarVisible: boolean};

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly configuration: StatusOptions;

  /** Notifies the owning shell after a status contribution changes side. */
  private readonly moved: ((id: string) => void) | undefined;

  /** Current contribution definitions indexed by stable ID. */
  private readonly definitions: ShallowReactive<
    Map<string, StatusItemDefinition>
  >;

  /** Whether item or separator movement is currently allowed. */
  readonly allowMove: ComputedRef<boolean>;

  /** Reactive separator entries or the separator controller used to project them. */
  private readonly sourceSeparators: BarSeparators;

  /** Per-item side overrides independent of registration defaults. */
  private readonly sides: ShallowReactive<Map<string, StatusSide>>;

  /** Per-item visibility overrides retained independently of registration data. */
  private readonly visibility: ShallowReactive<Map<string, boolean>>;

  /** Per-item badge visibility overrides. */
  private readonly badges: ShallowReactive<Map<string, boolean>>;

  /** Prevents operations after this controller has released its resources. */
  private readonly disposed: ShallowRef<boolean, boolean>;

  /** Persistent centered status message used when no temporary message is active. */
  private readonly persistent: ShallowRef<StatusMessage, StatusMessage>;

  /** Temporary status message overriding the persistent text. */
  private readonly temporary: ShallowRef<
    StatusMessage | undefined,
    StatusMessage | undefined
  >;

  /** Pending dismissal timer owned by this controller. */
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** Revision preventing an old dismissal callback from clearing a newer message. */
  private generation: number;

  /** Reactive effective centered message including transient overrides. */
  readonly message: ComputedRef<StatusMessage>;

  /** Reactive projection of current registrations and effective presentation preferences. */
  readonly items: ComputedRef<StatusItem[]>;

  /** Reactive separator movement permission inherited from the owning region. */
  readonly canMoveSeparators: ComputedRef<boolean>;

  /** Whether a new separator can be registered under current editing permissions. */
  readonly allowAddSeparator: ComputedRef<boolean>;

  /** Reactive separator entries or the separator controller used to project them. */
  readonly separators: ComputedRef<readonly BarSeparator[]>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(
    layout: {statusBarVisible: boolean},
    options: StatusOptions = {},
    moved?: (id: string) => void
  ) {
    this.layout = layout;
    this.configuration = options;
    this.moved = moved;
    this.find = this.find.bind(this);
    this.cancelTemporary = this.cancelTemporary.bind(this);
    this.set = this.set.bind(this);
    this.show = this.show.bind(this);
    this.clear = this.clear.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.register = this.register.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.setBadgeVisible = this.setBadgeVisible.bind(this);
    this.resetItemPosition = this.resetItemPosition.bind(this);
    this.move = this.move.bind(this);
    this.update = this.update.bind(this);
    this.activate = this.activate.bind(this);
    this.setBarVisible = this.setBarVisible.bind(this);
    this.resetPresentation = this.resetPresentation.bind(this);
    this.dispose = this.dispose.bind(this);
    this.definitions = shallowReactive(new Map<string, StatusItemDefinition>());
    this.allowMove = computed(
      () => !this.disposed.value && this.configuration.allowMove !== false
    );
    this.sourceSeparators = new BarSeparators(
      this.configuration,
      (id) => this.definitions.has(id),
      () => this.allowMove.value
    );
    this.sides = shallowReactive(new Map<string, StatusSide>());
    this.visibility = shallowReactive(new Map<string, boolean>());
    this.badges = shallowReactive(new Map<string, boolean>());
    this.disposed = shallowRef(false);
    this.persistent = shallowRef<StatusMessage>({
      text: this.configuration.message ?? 'Ready',
      severity: 'info',
    });
    this.temporary = shallowRef<StatusMessage>();
    this.timer = undefined;
    this.generation = 0;
    this.message = computed(
      () => this.temporary.value ?? this.persistent.value
    );
    this.items = computed<StatusItem[]>(() =>
      this.disposed.value
        ? []
        : [...this.definitions.values()]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((item) => ({
              ...item,
              side: this.sides.get(item.id) ?? item.side ?? 'left',
              visible: this.isVisible(item.id),
              badgeVisible: this.badges.get(item.id) ?? true,
              available: item.available?.() !== false,
              showInStatusBar: item.showInStatusBar?.() !== false,
            }))
    );
    this.resetPresentation();
    this.canMoveSeparators = this.sourceSeparators.canMoveSeparators;
    this.allowAddSeparator = this.sourceSeparators.allowAddSeparator;
    this.separators = this.sourceSeparators.separators;
    this.registerSeparator = this.registerSeparator.bind(this);
    this.addSeparator = this.addSeparator.bind(this);
    this.removeSeparator = this.removeSeparator.bind(this);
    this.moveSeparator = this.moveSeparator.bind(this);
    this.disposeSeparators = this.disposeSeparators.bind(this);
  }

  /** Updates the persistent status message or registered presentation value. */
  set(text: string) {
    if (!this.disposed.value) this.persistent.value = {text, severity: 'info'};
  }

  /** Displays a temporary status message and returns its generation-safe dismissal. */
  show(
    text: string,
    {duration = 4000, severity = 'info'}: StatusMessageOptions = {}
  ) {
    if (this.disposed.value) return () => {};
    if (!Number.isFinite(duration) || duration < 0)
      throw new Error('Status duration must be a non-negative finite number');
    this.cancelTemporary();
    this.temporary.value = {text, severity};
    const current = this.generation;
    const dismiss = () => {
      if (current === this.generation) this.cancelTemporary();
    };
    if (duration > 0) this.timer = setTimeout(dismiss, duration);
    return dismiss;
  }

  /** Clears retained entries or transient presentation state owned by this controller. */
  clear() {
    if (!this.disposed.value) {
      this.cancelTemporary();
      this.set('');
    }
  }

  /** Reads the effective visibility preference of a registered contribution. */
  isVisible(id: string) {
    const item = this.find(id);
    return !!item && (this.visibility.get(id) ?? item.visible !== false);
  }

  /** Registers a contribution and returns cleanup scoped to that exact registration. */
  register(item: StatusItemDefinition) {
    if (this.disposed.value) throw new Error('Frame status is disposed');
    if (
      !item.id ||
      this.definitions.has(item.id) ||
      this.sourceSeparators.separators.value.some(
        (entry) => entry.id === item.id
      )
    )
      throw new Error(`Duplicate or empty status item: ${item.id}`);
    if (
      !['text', 'button'].includes(item.kind) ||
      (item.side !== undefined && !['left', 'right'].includes(item.side))
    )
      throw new Error('Invalid status item kind or side');
    // Preserve reactive getters provided by installed features without owning their resources.
    const definition = shallowReactive(
      Object.defineProperties({}, Object.getOwnPropertyDescriptors(item))
    ) as StatusItemDefinition;
    const id = item.id;
    if (definition.icon && typeof definition.icon !== 'string')
      markRaw(definition.icon);
    this.definitions.set(item.id, definition);
    if (this.configuration.hidden?.includes(item.id))
      this.visibility.set(item.id, false);
    if (this.configuration.hiddenBadges?.includes(item.id))
      this.badges.set(item.id, false);
    return () => {
      if (this.definitions.get(id) !== definition) return;
      this.definitions.delete(id);
      this.sides.delete(id);
      this.visibility.delete(id);
      this.badges.delete(id);
    };
  }

  /** Changes visibility through the existing registration or presentation state. */
  setVisible(id: string, visible: boolean) {
    if (!this.find(id)) return false;
    this.visibility.set(id, visible);
    return true;
  }

  /** Updates the badge visibility preference for an existing contribution. */
  setBadgeVisible(id: string, visible: boolean) {
    if (!this.find(id)) return false;
    this.badges.set(id, visible);
    return true;
  }

  /** Removes a side override so the contribution follows its registered placement. */
  resetItemPosition(id: string) {
    if (!this.find(id)) return false;
    this.sides.delete(id);
    return true;
  }

  /** Moves a contribution between status sides while respecting editing permissions. */
  move(id: string, side: StatusSide) {
    const item = this.find(id);
    if (!this.allowMove.value || !item || !['left', 'right'].includes(side))
      return false;
    this.sides.set(id, side);
    item.onMove?.(side);
    this.moved?.(id);
    return true;
  }

  /** Updates mutable presentation fields on an existing status contribution. */
  update(id: string, patch: StatusItemUpdate) {
    const item = this.find(id);
    if (!item) return false;
    for (const key of Object.keys(patch)) {
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (
        descriptor &&
        ('get' in descriptor ? !descriptor.set : descriptor.writable === false)
      )
        return false;
    }
    if (patch.icon && typeof patch.icon !== 'string') markRaw(patch.icon);
    for (const key of [
      'label',
      'text',
      'tooltip',
      'icon',
      'badge',
      'disabled',
    ] as const) {
      if (
        Object.prototype.hasOwnProperty.call(patch, key) &&
        !(key === 'disabled' && item.kind === 'text')
      )
        Reflect.set(item, key, patch[key]);
    }
    return true;
  }

  /** Executes an available item through its registered action or host navigation service. */
  activate(id: string) {
    const item = this.find(id);
    if (
      !item ||
      item.kind !== 'button' ||
      item.disabled ||
      item.available?.() === false
    )
      return false;
    item.run?.();
    return true;
  }

  /** Changes bar visibility without altering feature availability. */
  setBarVisible(visible: boolean) {
    if (this.disposed.value) return false;
    this.layout.statusBarVisible = visible;
    return true;
  }

  /** Restores configured presentation defaults without unregistering content. */
  resetPresentation() {
    if (this.disposed.value) return;
    this.sides.clear();
    this.visibility.clear();
    this.badges.clear();
    for (const id of this.configuration.hidden ?? [])
      this.visibility.set(id, false);
    for (const id of this.configuration.hiddenBadges ?? [])
      this.badges.set(id, false);
    this.setBarVisible(this.configuration.visible ?? true);
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    if (this.disposed.value) return;
    this.cancelTemporary();
    this.sourceSeparators.disposeSeparators();
    this.disposed.value = true;
    this.persistent.value = {text: '', severity: 'info'};
    this.definitions.clear();
    this.sides.clear();
    this.visibility.clear();
    this.badges.clear();
  }

  /** Registers a host-owned separator and returns its identity-safe cleanup. */
  registerSeparator(input: BarSeparator): () => void {
    return this.sourceSeparators.registerSeparator(input);
  }

  /** Adds an editable separator at the requested insertion boundary. */
  addSeparator(before?: string): string | undefined {
    return this.sourceSeparators.addSeparator(before);
  }

  /** Removes a registered separator when its editing permissions allow removal. */
  removeSeparator(id: string): boolean {
    return this.sourceSeparators.removeSeparator(id);
  }

  /** Moves an existing separator between insertion boundaries when permitted. */
  moveSeparator(id: string, before?: string): boolean {
    return this.sourceSeparators.moveSeparator(id, before);
  }

  /** Releases separator state and prevents future separator registration. */
  disposeSeparators(): void {
    return this.sourceSeparators.disposeSeparators();
  }

  /** Looks up a current registration without creating or replacing its identity. */
  private find(id: string) {
    return this.disposed.value ? undefined : this.definitions.get(id);
  }

  /** Cancels the current transient message and invalidates retained dismissal callbacks. */
  private cancelTemporary() {
    this.generation++;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.temporary.value = undefined;
  }
}

export type StatusController = Status;
