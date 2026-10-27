import {shallowReactive, shallowRef} from 'vue';
import {Feature} from './feature';

/** Availability is per Frame, independent of registration and presentation. */
export class FeatureRegistry {

  /** Dotted identifiers provide direct access to live feature objects. */
  readonly [id: `${string}.${string}`]: Feature;

  /** Stable item objects for known or explicitly configured features. */
  private readonly items = shallowReactive(new Map<string, Feature>());

  /** Explicit feature availability, separate from presentation visibility. */
  private states = shallowReactive(new Map<string, boolean>());

  /**
   * Tracks disposal so retained feature objects cannot reopen presentations.
   */
  private disposed = shallowRef(false);

  /** Subscribers notified after availability changes. */
  private listeners = new Set<() => void>();

  /** Built-in view-bar dependencies on their owning content containers. */
  private parents = new Map([
    ['primaryViewBar', 'primarySidebar'],
    ['secondaryViewBar', 'secondarySidebar'],
    ['panelViewBar', 'panel'],
  ]);

  /**
   * Initializes built-in features and host-supplied availability.
   *
   * @param initial - Initial per-feature availability supplied by the host.
   */
  constructor(initial: Readonly<Record<string, boolean>> = {}) {
    for (const id of [
      'primarySidebar',
      'secondarySidebar',
      'panel',
      'primaryViewBar',
      'secondaryViewBar',
      'panelViewBar',
      'menuBar',
      'navigationBar',
      'statusBar',
      'navigation',
      'settings',
      'notifications',
      'banner',
      'theme',
      'workspace',
      'shell',
      'keybindings',
    ]) {
      this.items.set(id, new Feature(id, this));
    }
    Object.entries(initial).forEach(([id, value]) => {
      this.states.set(id, value);
      this.items.set(id, new Feature(id, this));
      this.expose(id);
    });
  }

  /**
   * Gets a live item without inventing a new feature.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns The live feature, or undefined when the feature is unknown.
   */
  get(id: string): Feature | undefined {
    return this.items.get(id);
  }

  /**
   * Lists known functional areas.
   *
   * @returns A snapshot of known live feature registrations.
   */
  list(): readonly Feature[] {
    return [...this.items.values()];
  }

  /**
   * Registers a custom functional area.
   *
   * @param options - Initial registration data retained by the owning object.
   *
   * @returns The new live feature object.
   *
   * @throws If disposed, the identifier is empty, or the feature is already
   * registered.
   */
  register(options: {id: string; available?: boolean}): Feature {
    if (
      this.disposed.value ||
      !options.id.trim() ||
      this.items.has(options.id)
    ) {
      throw new Error('Invalid or duplicate feature: ' + options.id);
    }
    const feature = new Feature(options.id, this);
    this.items.set(options.id, feature);
    this.expose(options.id);
    this.setAvailable(options.id, options.available ?? true);
    return feature;
  }

  /**
   * Removes an exact feature registration without enabling its contributions.
   *
   * @param feature - Exact live registration to remove; stale registrations are
   * ignored.
   */
  unregister(feature: Feature): void {
    if (this.items.get(feature.id) !== feature) {
      return;
    }
    this.setAvailable(feature.id, false);
    this.items.delete(feature.id);
  }

  /**
   * Makes a feature available without changing presentation visibility.
   *
   * @remarks
   * Existing registrations are retained and no presentation is opened
   * automatically.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   */
  enable(id: string): void {
    this.setAvailable(id, true);
  }

  /**
   * Makes a feature unavailable while retaining its contributions.
   *
   * @remarks
   * Availability is independent of visibility; existing registrations remain
   * owned by Frame.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   */
  disable(id: string): void {
    this.setAvailable(id, false);
  }

  /**
   * Adds direct item lookup without replacing legacy boolean accessors.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   */
  private expose(id: string): void {
    if (!(id in this)) {
      Object.defineProperty(this, id, {
        configurable: true,
        get: () => this.get(id),
      });
    }
  }

  /**
   * Resolves explicit availability and built-in parent dependencies.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns Whether explicit state and built-in parent dependencies allow use.
   */
  isAvailable = (id: string): boolean =>
    !this.disposed.value &&
    (this.states.get(id) ?? true) &&
    (!this.parents.has(id) || this.isAvailable(this.parents.get(id)!));

  /**
   * Updates availability and notifies shell presentation controllers.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   * @param value - New state for the addressed availability or presentation
   * property.
   *
   * @throws If the identifier is empty while the registry is active.
   */
  setAvailable = (id: string, value: boolean): void => {
    if (this.disposed.value) {
      return;
    }
    if (!id.trim()) {
      throw new Error('Feature ID must not be empty');
    }
    if (!this.items.has(id)) {
      this.items.set(id, new Feature(id, this));
    }
    this.states.set(id, value);
    this.expose(id);
    this.listeners.forEach((listener) => listener());
  };

  /**
   * Observes availability changes and returns idempotent subscription cleanup.
   *
   * @param listener - Callback invoked when the observed event occurs.
   *
   * @returns An idempotent callback that removes the listener.
   */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Compatibility with existing boolean feature switches.
   *
   * @returns Whether the Settings feature is available.
   */
  get settings() {
    return this.isAvailable('settings');
  }

  /**
   * Compatibility access to the Settings feature availability.
   *
   * @param value - New state for the addressed availability or presentation
   * property.
   */
  set settings(value: boolean) {
    this.setAvailable('settings', value);
  }

  /**
   * Compatibility access to navigation feature availability.
   *
   * @returns Whether the navigation feature is available.
   */
  get navigation() {
    return this.isAvailable('navigation');
  }

  /**
   * Compatibility access to navigation feature availability.
   *
   * @param value - New state for the addressed availability or presentation
   * property.
   */
  set navigation(value: boolean) {
    this.setAvailable('navigation', value);
  }

  /**
   * Compatibility access to notification feature availability.
   *
   * @returns Whether the notification feature is available.
   */
  get notifications() {
    return this.isAvailable('notifications');
  }

  /**
   * Compatibility access to notification feature availability.
   *
   * @param value - New state for the addressed availability or presentation
   * property.
   */
  set notifications(value: boolean) {
    this.setAvailable('notifications', value);
  }

  /**
   * Releases all feature registrations and availability subscriptions.
   *
   * @remarks
   * Retained feature objects cannot restore availability after disposal.
   */
  dispose() {
    this.disposed.value = true;
    this.listeners.forEach((listener) => listener());
    this.listeners.clear();
    this.states.clear();
    this.items.clear();
  }
}
