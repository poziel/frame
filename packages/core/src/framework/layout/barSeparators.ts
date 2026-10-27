import {computed, shallowReactive, shallowRef} from 'vue';

/** A presentation-only divider positioned relative to registered content. */
export interface BarSeparator {

  /** Unique separator identity within its owning bar. */
  id: string;

  /** Content ID before which this separator appears; omitted appends it. */
  before?: string;

  /** Whether user-facing removal is permitted. */
  allowRemove?: boolean;
}

/** Host configuration for one bar separator controller. */
export interface BarSeparatorOptions {

  /** Whether callers may create editable separators. */
  allowAddSeparator?: boolean;

  /** Initial host-owned separator definitions. */
  separators?: readonly BarSeparator[];
}

/**
 * Owns bar-local separator registrations and their editing permissions.
 * Separators affect presentation only; they never register or activate views.
 */
export class BarSeparators {

  /** Host-configured separator defaults and permission to add entries. */
  private readonly options: BarSeparatorOptions;

  /** Checks content identities and validates insertion targets. */
  private readonly hasView: (id: string) => boolean;

  /** Reads the owning bar movement permission at operation time. */
  private readonly canMove: () => boolean;

  /** Reactive separator snapshots in registration order. */
  private readonly entries = shallowReactive<BarSeparator[]>([]);

  /** Registration tokens protecting replacement entries from stale cleanup. */
  private readonly owners = new Map<string, symbol>();

  /** Reactive lifetime gate shared by exposed permissions. */
  private readonly disposed = shallowRef(false);

  /** Monotonic suffix used for generated separator identifiers. */
  private serial = 0;

  /** Reactive movement permission combined with registration lifetime. */
  readonly canMoveSeparators = computed(
    () => !this.disposed.value && this.canMove()
  );

  /** Reactive addition permission combined with registration lifetime. */
  readonly allowAddSeparator = computed(
    () => !this.disposed.value && !!this.options.allowAddSeparator
  );

  /** Readonly snapshot of current separator registrations. */
  readonly separators = computed<readonly BarSeparator[]>(() =>
    Object.freeze([...this.entries])
  );

  /** Creates an independently owned BarSeparators controller. */
  constructor(
    options: BarSeparatorOptions,
    hasView: (id: string) => boolean,
    canMove: () => boolean = () => true
  ) {
    this.options = options;
    this.hasView = hasView;
    this.canMove = canMove;
    this.registerSeparator = this.registerSeparator.bind(this);
    this.addSeparator = this.addSeparator.bind(this);
    this.removeSeparator = this.removeSeparator.bind(this);
    this.moveSeparator = this.moveSeparator.bind(this);
    this.disposeSeparators = this.disposeSeparators.bind(this);
    for (const entry of this.options.separators ?? [])
      this.registerSeparator(entry);
  }

  /** Registers an immutable separator and returns identity-checked cleanup. */
  registerSeparator(input: BarSeparator) {
    if (this.disposed.value) throw new Error('Frame is disposed');
    if (
      !input.id ||
      this.entries.some((item) => item.id === input.id) ||
      this.hasView(input.id)
    )
      throw new Error(`Duplicate separator: ${input.id}`);
    const entry = Object.freeze({...input}),
      owner = Symbol();
    this.entries.push(entry);
    this.owners.set(entry.id, owner);
    return () => {
      if (this.owners.get(entry.id) !== owner) return;
      const index = this.entries.findIndex((item) => item.id === entry.id);
      if (index >= 0) this.entries.splice(index, 1);
      this.owners.delete(entry.id);
    };
  }

  /** Adds an editable separator when the bar permits it and the target exists. */
  addSeparator(before?: string) {
    if (
      this.disposed.value ||
      !this.options.allowAddSeparator ||
      (before !== undefined && !this.hasView(before))
    )
      return undefined;
    let id: string;
    do {
      id = `separator-${++this.serial}`;
    } while (this.hasView(id) || this.entries.some((item) => item.id === id));
    this.registerSeparator({id, before, allowRemove: true});
    return id;
  }

  /** Removes an editable separator without touching content registrations. */
  removeSeparator(id: string) {
    const at = this.entries.findIndex((item) => item.id === id);
    if (this.disposed.value || at < 0 || !this.entries[at]!.allowRemove)
      return false;
    this.owners.delete(id);
    this.entries.splice(at, 1);
    return true;
  }

  /** Moves a separator when the bar and insertion target permit it. */
  moveSeparator(id: string, before?: string) {
    const at = this.entries.findIndex((item) => item.id === id);
    if (
      this.disposed.value ||
      !this.canMove() ||
      at < 0 ||
      (before !== undefined && !this.hasView(before))
    )
      return false;
    this.entries[at] = Object.freeze({...this.entries[at]!, before});
    return true;
  }

  /** Invalidates operations and releases all separator registrations. */
  disposeSeparators() {
    this.disposed.value = true;
    this.owners.clear();
    this.entries.splice(0);
  }
}
