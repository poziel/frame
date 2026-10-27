import {shallowRef, toValue, unref, type Ref} from 'vue';
import type {
  NotificationCallback,
  StateChange,
  SubscriptionId,
} from '../configuration/notifier';
import {StateObserver} from '../configuration/stateObserver';
import type {PermissionSnapshot, PermissionState} from './permissionState';

/**
 * A literal, Vue ref, or synchronous function evaluated for a target.
 * Use a ref or function when the source must follow reactive host state.
 */
export type PermissionSource<T, C> = T | Ref<T> | ((context: C) => T);

/**
 * Registration inputs defining automatic permission checks and their reason.
 * Manual overrides retain these inputs so reset can resume automatic checks.
 */
export interface PermissionOptions<C = void> {

  /** Unique identifier within the owning Frame. */
  id: string;

  /** Automatic condition; evaluation never starts asynchronous work. */
  allowed: PermissionSource<boolean, C>;

  /** Explanation when automatic evaluation denies access. */
  reason?: PermissionSource<string | undefined, C>;
}

/** Requires a typed target only for permissions with contextual conditions. */
type PermissionContextArguments<C> = [C] extends [void]
  ? [context?: PermissionSource<C, void>]
  : [context: PermissionSource<C, void>];

/**
 * Owns an automatic permission condition, manual overrides, and state notifications.
 *
 * @remarks
 * Each check evaluates one explicit target. A manual enable or disable takes
 * precedence until reset, while unregister permanently denies access. Subscriptions
 * track the same reactive sources and report effective decisions for their
 * own target. Importing or registering a permission starts no backend work.
 *
 * @typeParam C - Target required by the automatic condition and its subscriptions.
 *
 * @example
 * ```ts
 * const edit = frame.permissions.register<{readOnly: boolean}>({
 *   id: 'document.edit',
 *   allowed: document => !document.readOnly,
 * });
 * const id = edit.subscribe(({current, previous}) => {
 *   if (previous.allowed && !current.allowed) cancelUserStroke();
 * }, () => activeDocument.value);
 * edit.disable('AI is editing');
 * edit.reset();
 * edit.unsubscribe(id);
 * ```
 */
export class Permission<C = void> {

  /** Callback delivery and target-specific reactive observation. */
  private readonly notifications = new StateObserver<PermissionSnapshot>();

  /** Stable registration identifier. */
  readonly id: string;

  /** Reactive override and lifetime state. */
  private readonly state = shallowRef<PermissionState>({
    mode: 'automatic',
    reason: undefined,
    active: true,
  });

  /** Original automatic sources. */
  private readonly options: PermissionOptions<C>;

  /** Removes this exact registration from its owner. */
  private readonly remove: () => void;

  /**
   * Creates a permission; applications normally use the registry.
   *
   * @param options - Automatic condition, optional reason, and stable
   * permission ID.
   * @param remove - Idempotent callback removing this exact registration.
   */
  constructor(options: PermissionOptions<C>, remove: () => void) {
    this.id = options.id;
    this.options = {...options};
    this.remove = remove;
  }

  /**
   * Subscribes to effective state changes without an initial notification.
   *
   * @param callback - Receives one payload containing previous and current state.
   * @param context - Fixed target, ref, or getter; required for contextual permissions.
   * @returns Opaque ID used to cancel this subscription.
   * @throws If this registration is inactive or its state cannot be evaluated.
   */
  subscribe(
    callback: NotificationCallback<StateChange<PermissionSnapshot>>,
    ...context: PermissionContextArguments<C>
  ): SubscriptionId {
    return this.notifications.observe(callback, () =>
      this.readState(toValue(context[0]) as C)
    );
  }

  /**
   * Subscribes to the next effective state change only.
   *
   * @param callback - Receives one change, then is removed before execution.
   * @param context - Fixed target, ref, or getter; required for contextual permissions.
   * @returns ID that can cancel the pending one-time subscription.
   */
  subscribeOnce(
    callback: NotificationCallback<StateChange<PermissionSnapshot>>,
    ...context: PermissionContextArguments<C>
  ): SubscriptionId {
    return this.notifications.observe(
      callback,
      () => this.readState(toValue(context[0]) as C),
      true
    );
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
  invoke(event: StateChange<PermissionSnapshot>): void {
    this.notifications.invoke(event);
  }

  /**
   * Current override mode.
   *
   * @returns The active automatic or manual override mode.
   */
  get mode() {
    return this.state.value.mode;
  }

  /**
   * Evaluates this permission against its target.
   *
   * @param context - Explicit target used to evaluate the permission condition
   * and reason.
   *
   * @returns Whether this target is allowed, with an explanation when denied.
   *
   * @throws If an automatic condition or reason callback throws.
   */
  check(context: C): {
    allowed: boolean;
    reason?: string;
  } {
    if (!this.state.value.active) {
      return {allowed: false, reason: 'Permission is unregistered'};
    }
    if (this.mode === 'enabled') {
      return {allowed: true};
    }
    if (this.mode === 'disabled') {
      return {allowed: false, reason: this.state.value.reason};
    }
    const allowed = this.read(this.options.allowed, context);
    return {
      allowed,
      reason: allowed
        ? undefined
        : this.options.reason === undefined
          ? undefined
          : this.read(this.options.reason, context),
    };
  }

  /**
   * Forces approval; independent permissions and command gates still apply.
   *
   * @remarks
   * This override affects only this permission. Other permission, command, and
   * feature restrictions remain authoritative.
   */
  enable(): void {
    this.state.value = {
      ...this.state.value,
      mode: 'enabled',
      reason: undefined,
    };
  }

  /**
   * Forces denial without removing the automatic condition.
   *
   * @remarks
   * Automatic sources remain registered but are not evaluated while the manual
   * override is active.
   *
   * @param reason - Explanation displayed while the manual denial is active.
   */
  disable(reason?: string): void {
    this.state.value = {...this.state.value, mode: 'disabled', reason};
  }

  /**
   * Removes the override and resumes automatic evaluation.
   *
   * @remarks
   * Subsequent checks read the original automatic condition and reason again.
   */
  reset(): void {
    this.state.value = {
      ...this.state.value,
      mode: 'automatic',
      reason: undefined,
    };
  }

  /**
   * Removes this registration and invalidates retained references.
   *
   * @remarks
   * Repeated calls are safe. Retained objects deny access and cannot remove
   * replacement registrations.
   */
  unregister(): void {
    if (!this.state.value.active) {
      return;
    }
    this.state.value = {...this.state.value, active: false};
    this.remove();
  }

  /**
   * Captures lifecycle, override mode, and the decision for one subscription target.
   *
   * @param context - Explicit target resolved for this subscription.
   * @returns Atomic permission state with its evaluated approval and reason.
   */
  private readState(context: C): PermissionSnapshot {
    const decision = this.check(context);
    return {
      ...this.state.value,
      allowed: decision.allowed,
      reason: decision.reason,
    };
  }

  /**
   * Reads a literal, ref, or synchronous contextual source.
   *
   * @typeParam T - Type of the synchronous source value.
   *
   * @param source - Literal, Vue ref, or synchronous contextual source to
   * resolve.
   * @param context - Explicit target used to evaluate the permission condition
   * and reason.
   *
   * @returns The current value of the supplied source.
   */
  private read<T>(source: PermissionSource<T, C>, context: C): T {
    return typeof source === 'function'
      ? (source as (context: C) => T)(context)
      : unref(source);
  }
}
