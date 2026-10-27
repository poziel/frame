import type {FeatureRegistry} from './featureRegistry';
import type {
  NotificationCallback,
  StateChange,
  SubscriptionId,
} from '../configuration/notifier';
import {StateObserver} from '../configuration/stateObserver';

/** Availability snapshot shared by feature change subscriptions. */
export interface FeatureState {

  /** Whether this exact registration still belongs to its owner. */
  readonly active: boolean;

  /** Whether this registration and its built-in parent are available. */
  available: boolean;
}

export interface FeatureController {

  /**
   * Whether the owning feature currently permits presentation and execution.
   */
  readonly available: boolean;

  /**
   * Updates feature availability without unregistering content.
   *
   * @param value - New availability state.
   */
  setAvailable(value: boolean): void;

  /** Makes the feature available without opening its presentation. */
  enable(): void;

  /** Makes the feature unavailable while retaining registrations. */
  disable(): void;
}

/** Live availability control for one functional area. */
export class Feature {

  /** Callback delivery and target-specific reactive observation. */
  private readonly notifications = new StateObserver<FeatureState>();

  /** Stable feature identifier. */
  readonly id: string;

  /** Owning per-instance registry. */
  private readonly registry: FeatureRegistry;

  /**
   * Creates a registry-owned feature object.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   * @param registry - Registry that owns this live object and its authoritative
   * state.
   */
  constructor(id: string, registry: FeatureRegistry) {
    this.id = id;
    this.registry = registry;
  }

  /**
   * Subscribes to effective state changes without an initial notification.
   *
   * @param callback - Receives one payload containing previous and current state.
   * @returns Opaque ID used to cancel this subscription.
   * @throws If this registration is inactive or its state cannot be evaluated.
   */
  subscribe(
    callback: NotificationCallback<StateChange<FeatureState>>
  ): SubscriptionId {
    return this.notifications.observe(callback, () => this.readState());
  }

  /**
   * Subscribes to the next effective state change only.
   *
   * @param callback - Receives one change, then is removed before execution.
   * @returns ID that can cancel the pending one-time subscription.
   */
  subscribeOnce(
    callback: NotificationCallback<StateChange<FeatureState>>
  ): SubscriptionId {
    return this.notifications.observe(callback, () => this.readState(), true);
  }

  /**
   * Removes one subscription by ID, or every subscription when omitted.
   *
   * @param id - Subscription identity returned by subscribe or subscribeOnce.
   */
  unsubscribe(id?: SubscriptionId): void {
    this.notifications.unsubscribe(id);
  }

  /**
   * Explicitly delivers one payload to every current subscription.
   *
   * @remarks
   * This only delivers notifications; it does not change the owner's state.
   * Automatic state changes invoke their own target-specific notifications.
   *
   * @param event - Previous and current state values to deliver.
   */
  invoke(event: StateChange<FeatureState>): void {
    this.notifications.invoke(event);
  }

  /**
   * Captures registration ownership and effective feature availability.
   *
   * @returns State including inherited restrictions and terminal removal.
   */
  private readState(): FeatureState {
    return {
      active: this.registry.get(this.id) === this,
      available: this.available,
    };
  }

  /**
   * Availability including built-in parent dependencies.
   *
   * @returns Whether this registration and its parent dependencies are
   * available.
   */
  get available(): boolean {
    return (
      this.registry.get(this.id) === this && this.registry.isAvailable(this.id)
    );
  }

  /**
   * Makes this functional area available without opening its presentation.
   *
   * @remarks
   * Restoring availability does not automatically reopen the presentation.
   */
  enable(): void {
    this.setAvailable(true);
  }

  /**
   * Makes this functional area unavailable while preserving registrations.
   *
   * @remarks
   * Contributions remain registered, but their presentations and commands are
   * unavailable.
   */
  disable(): void {
    this.setAvailable(false);
  }

  /**
   * Updates the authoritative instance-owned availability state.
   *
   * @param value - New state for the addressed availability or presentation
   * property.
   */
  setAvailable(value: boolean): void {
    if (this.registry.get(this.id) === this) {
      this.registry.setAvailable(this.id, value);
    }
  }

  /**
   * Removes this feature and leaves its contributions unavailable.
   *
   * @remarks
   * The functional area remains unavailable. This object cannot alter a
   * replacement registration.
   */
  unregister(): void {
    this.registry.unregister(this);
  }
}
