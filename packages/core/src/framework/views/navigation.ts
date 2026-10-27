import type {ShallowRef} from 'vue';
import {shallowRef} from 'vue';

/** Replace shell destination history with host-owned history for the existing Back/Forward actions. */
export interface NavigationOptions {

  back: () => void | Promise<unknown>;

  forward: () => void | Promise<unknown>;

  canGoBack: () => boolean;

  canGoForward: () => boolean;
}

/** Typed location capture and host integration for one navigation history. */
export interface NavigationHistoryOptions<T> {

  /** Reads whether navigation or movement is currently available. */
  enabled: () => boolean;

  /** Optional host-owned history provider, replacing captured shell history. */
  adapter?: NavigationOptions;

  /** Captures the current application location before and after navigation. */
  capture: () => T;

  /** Restores a previously captured application location. */
  restore: (location: T) => void;

  /** Compares captured locations to suppress duplicate history entries. */
  equal: (a: T, b: T) => boolean;
}

/**
 * Owns per-Frame navigation history and synchronous navigation transactions.
 * An optional host adapter remains authoritative for external navigation.
 * Captured locations stay independent of view registration and presentation.
 */
export class Navigation<T> {

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly options: NavigationHistoryOptions<T>;

  /** Captured navigation locations retained for Back and Forward. */
  private readonly entries: ShallowRef<T[], T[]>;

  /** Current position in the retained navigation history. */
  private readonly index: ShallowRef<number, number>;

  /** Nesting depth that combines related synchronous navigation operations. */
  private depth: number;

  /** Prevents operations after this controller has released its resources. */
  private disposed: boolean;

  /** Suppresses history recording while a retained location is restored. */
  private restoring: boolean;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(options: NavigationHistoryOptions<T>) {
    this.options = options;
    this.clear = this.clear.bind(this);
    this.record = this.record.bind(this);
    this.go = this.go.bind(this);
    this.back = this.back.bind(this);
    this.forward = this.forward.bind(this);
    this.dispose = this.dispose.bind(this);
    this.entries = shallowRef<T[]>([]);
    this.index = shallowRef(-1);
    this.depth = 0;
    this.disposed = false;
    this.restoring = false;
  }

  /** Clears retained entries or transient presentation state owned by this controller. */
  clear() {
    this.entries.value = [];
    this.index.value = -1;
  }

  /** Runs a synchronous navigation transaction and records meaningful location changes. */
  record<R>(run: () => R): R {
    if (
      this.disposed ||
      this.options.adapter ||
      !this.options.enabled() ||
      this.restoring ||
      this.depth
    )
      return run();
    const before = this.options.capture();
    this.depth++;
    try {
      return run();
    } finally {
      this.depth--;
      const after = this.options.capture();
      if (!this.options.equal(before, after)) {
        const path = this.entries.value.slice(0, this.index.value + 1);
        if (!path.length || !this.options.equal(path[path.length - 1]!, before))
          path.push(before);
        path.push(after);
        this.entries.value = path;
        this.index.value = path.length - 1;
      }
    }
  }

  /** Whether the active navigation provider can restore a previous location. */
  get canGoBack() {
    return (
      !this.disposed &&
      this.options.enabled() &&
      (this.options.adapter
        ? this.options.adapter.canGoBack()
        : this.index.value > 0)
    );
  }

  /** Whether the active navigation provider can restore a later location. */
  get canGoForward() {
    return (
      !this.disposed &&
      this.options.enabled() &&
      (this.options.adapter
        ? this.options.adapter.canGoForward()
        : this.index.value >= 0 &&
          this.index.value < this.entries.value.length - 1)
    );
  }

  /** Navigates to the preceding location when navigation is available. */
  back() {
    return this.go(-1);
  }

  /** Navigates to the following location when navigation is available. */
  forward() {
    return this.go(1);
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.disposed = true;
    this.clear();
  }

  /** Restores an adjacent location or delegates navigation to the configured host adapter. */
  private go(delta: number) {
    if (this.disposed) return false;
    if (this.options.adapter) {
      if (
        !this.options.enabled() ||
        !(delta < 0
          ? this.options.adapter.canGoBack()
          : this.options.adapter.canGoForward())
      )
        return false;
      return delta < 0
        ? this.options.adapter.back()
        : this.options.adapter.forward();
    }
    const target = this.index.value + delta;
    if (
      !this.options.enabled() ||
      target < 0 ||
      target >= this.entries.value.length
    )
      return false;
    this.restoring = true;
    try {
      this.options.restore(this.entries.value[target]!);
      this.index.value = target;
      return true;
    } finally {
      this.restoring = false;
    }
  }
}
