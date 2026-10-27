import type {Component} from 'vue';

import type {CommandRegistry} from './commandRegistry';
import type {
  NotificationCallback,
  StateChange,
  SubscriptionId,
} from '../configuration/notifier';
import {StateObserver} from '../configuration/stateObserver';

/** Registration data used to create a live Command object. */
export interface CommandOptions {

  /** Excludes automatic Command Center listing, retaining explicit submenu access. */
  commandCenter?: boolean;

  /** Permissions required in addition to feature and enabled conditions. */
  requires?: readonly string[];

  /** Resolves the target for contextual permission checks. */
  context?: () => unknown;

  /** Stable identifier; dot-delimited ancestors can restrict execution. */
  id: string;

  /** Icon displayed beside this command. */
  icon?: string | Component;

  /** Human-readable action name. */
  label: string;

  /** Additional searchable description. */
  detail?: string;

  /** Default keyboard shortcut; host overrides remain separate. */
  shortcut?: string;

  /** Human-readable origin for shortcut search and inspection. */
  source?: string;

  /** Reactive shortcut activation condition; command execution remains independently gated. */
  when?: () => boolean;

  /** Display/search description of the shortcut activation predicate. Never evaluated as code. */
  whenLabel?: string;

  /** Picker destination; defaults to application. Shortcuts work in either mode. */
  scope?: 'application' | 'frame';

  /** Hide from pickers while retaining command and shortcut access. */
  quickInput?: boolean | string;

  /** Owning feature. A resolver supports views that move between regions. */
  feature?: string | (() => string);

  /** False hides the action and blocks its execution. */
  available?: boolean | (() => boolean);

  /** Controls presentation without authorizing execution. */
  visible?: boolean | (() => boolean);

  /** Immediate prerequisites checked in addition to permissions and features. */
  enabled?: boolean | (() => boolean);

  /** Application handler; live Command objects execute through registry gates. */
  run: () => void | Promise<void>;
}

/** Effective execution and presentation state reported by command subscriptions. */
export interface CommandState {

  /** Whether this exact registration still belongs to its owner. */
  readonly active: boolean;

  /** Whether the command and its owning feature are available. */
  available: boolean;

  /** Whether namespace, permission, and action conditions permit execution. */
  enabled: boolean;

  /** Whether explicit command presentations should display this action. */
  visible: boolean;
}

/** Live command metadata combined with item-owned lifecycle operations. */
export interface Command extends CommandOptions {}

/** A registered action whose execution always passes through its registry. */
export class Command {

  /** Callback delivery and target-specific reactive observation. */
  private readonly notifications = new StateObserver<CommandState>();

  /** Original metadata copied onto this live object. */
  readonly id: string;

  /** Human-readable action label. */
  readonly label: string;

  /** Registry coordinating inherited restrictions and execution. */
  private readonly registry: CommandRegistry;

  /** Idempotent cleanup for this exact registration. */
  private readonly remove: () => void;

  /**
   * Creates a live command owned by the supplied registry.
   *
   * @param definition - Application command metadata and original action
   * handler.
   * @param registry - Registry that owns this live object and its authoritative
   * state.
   * @param remove - Idempotent callback removing this exact registration.
   */
  constructor(
    definition: CommandOptions,
    registry: CommandRegistry,
    remove: () => void
  ) {
    const metadata = {...definition};
    delete metadata.shortcut;
    Object.assign(this, metadata);
    this.id = definition.id;
    this.label = definition.label;
    this.registry = registry;
    this.remove = remove;
    this.run = async () => {
      if (registry.get(this.id) === this) {
        await registry.execute(this.id);
      }
    };
    this.available = () =>
      registry.get(this.id) === this && registry.isAvailable(this.id);
    this.enabled = () =>
      registry.get(this.id) === this && registry.isEnabled(this.id);
  }

  /**
   * Subscribes to effective state changes without an initial notification.
   *
   * @param callback - Receives one payload containing previous and current state.
   * @returns Opaque ID used to cancel this subscription.
   * @throws If this registration is inactive or its state cannot be evaluated.
   */
  subscribe(
    callback: NotificationCallback<StateChange<CommandState>>
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
    callback: NotificationCallback<StateChange<CommandState>>
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
  invoke(event: StateChange<CommandState>): void {
    this.notifications.invoke(event);
  }

  /**
   * Captures this registration's effective execution and presentation gates.
   *
   * @returns Current gates, or an inactive snapshot for a stale registration.
   */
  private readState(): CommandState {
    const active = this.registered;
    return {
      active,
      available: active && this.registry.isAvailable(this.id),
      enabled: active && this.registry.isEnabled(this.id),
      visible: active && this.registry.isVisible(this.id),
    };
  }

  /**
   * Whether this exact registration is still owned by its registry.
   *
   * @returns Whether this exact command registration is still active.
   */
  get registered(): boolean {
    return this.registry.get(this.id) === this;
  }

  /**
   * Effective shortcut including user overrides.
   *
   * @returns The effective shortcut, or undefined when no binding applies.
   */
  get shortcut(): string | undefined {
    return this.registry.getShortcut(this.id);
  }

  /**
   * Removes this command's manual disable restriction.
   *
   * @remarks
   * Registered enabled predicates and independent ancestor restrictions still
   * apply.
   */
  enable(): void {
    if (this.registry.get(this.id) === this) {
      this.registry.enable(this.id);
    }
  }

  /**
   * Disables this command and commands in its dotted namespace.
   *
   * @remarks
   * Dot-delimited descendants inherit this restriction; similarly spelled
   * sibling IDs do not.
   */
  disable(): void {
    if (this.registry.get(this.id) === this) {
      this.registry.disable(this.id);
    }
  }

  /**
   * Changes availability while retaining the registration.
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
   * Changes presentation without authorizing execution.
   *
   * @param value - New state for the addressed availability or presentation
   * property.
   */
  setVisible(value: boolean): void {
    if (this.registry.get(this.id) === this) {
      this.registry.setVisible(this.id, value);
    }
  }

  /**
   * Removes the registration; safe to call repeatedly.
   *
   * @remarks
   * Repeated calls are safe. Retained references cannot execute a replacement
   * under the same ID.
   */
  unregister(): void {
    this.remove();
  }
}

/** A live item that remains callable as legacy registration cleanup. */
export type CommandRegistration = Command & (() => void);
