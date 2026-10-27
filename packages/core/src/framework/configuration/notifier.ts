/** Opaque identity returned by one subscription, unique across notifier instances. */
export type SubscriptionId = symbol;

/** Receives one payload; returned promises are observed but never awaited. */
export type NotificationCallback<Event> = (event: Event) => void;

/** A single change payload containing the states before and after a transition. */
export interface StateChange<State> {

  /** State before the change. */
  readonly previous: Readonly<State>;

  /** State after the change. */
  readonly current: Readonly<State>;
}

/** One callback and its delivery policy, stored under its subscription ID. */
interface Subscription<Event> {

  /** Callback receiving the invocation payload. */
  readonly callback: NotificationCallback<Event>;

  /** Whether the subscription ends before its first invocation. */
  readonly once: boolean;
}

/**
 * Registers callbacks and explicitly invokes them with one typed payload.
 *
 * @remarks
 * This class owns no application state and has no Vue dependency. Callers
 * decide when to invoke it and what the payload contains. Additions during
 * delivery wait for the next invocation; callbacks removed before their turn
 * are skipped. One-time callbacks are removed before execution so nested
 * invocations cannot deliver them twice.
 *
 * @typeParam Event - Payload supplied to every callback; void permits invoke().
 *
 * @example
 * ```ts
 * const changes = new Notifier<StateChange<{allowed: boolean}>>();
 * const id = changes.subscribe(({previous, current}) => {
 *   console.log(previous.allowed, current.allowed);
 * });
 * changes.invoke({previous: {allowed: true}, current: {allowed: false}});
 * changes.unsubscribe(id);
 * ```
 */
export class Notifier<Event = void> {

  /** Strongly retained callbacks indexed by opaque subscription identity. */
  private readonly subscriptions = new Map<
    SubscriptionId,
    Subscription<Event>
  >();

  /**
   * Registers a callback for subsequent invocations.
   *
   * @param callback - Action receiving the complete event payload.
   * @returns ID to provide to unsubscribe when the subscription ends.
   * @throws If the callback is not a function.
   */
  subscribe(callback: NotificationCallback<Event>): SubscriptionId {
    return this.add(callback, false);
  }

  /**
   * Registers a callback for the next invocation only.
   *
   * @param callback - Action removed before its first delivery.
   * @returns ID that can cancel the subscription before it runs.
   * @throws If the callback is not a function.
   */
  subscribeOnce(callback: NotificationCallback<Event>): SubscriptionId {
    return this.add(callback, true);
  }

  /**
   * Removes a subscription by ID, or removes every subscription when omitted.
   *
   * @remarks
   * Repeated removals and IDs from other notifiers are harmless. Already
   * running asynchronous callbacks are not cancelled.
   *
   * @param id - Opaque subscription ID; omit to remove all subscriptions.
   */
  unsubscribe(id?: SubscriptionId): void {
    const ids = id === undefined ? [...this.subscriptions.keys()] : [id];
    for (const subscriptionId of ids) {
      if (this.subscriptions.delete(subscriptionId)) {
        this.onUnsubscribe(subscriptionId);
      }
    }
  }

  /**
   * Delivers one payload to every subscription present when invocation begins.
   *
   * @remarks
   * Subscriber failures are reported independently and do not stop delivery.
   * The payload is passed unchanged; this operation does not mutate state.
   *
   * @param event - Values shared by this invocation, or omitted for void events.
   */
  invoke(event: Event): void {
    for (const id of [...this.subscriptions.keys()]) {
      this.invokeSubscription(id, event);
    }
  }

  /**
   * Delivers an event to one subscription for an internal target-specific source.
   *
   * @param id - Subscription whose source produced the event.
   * @param event - Payload associated with that source.
   */
  protected invokeSubscription(id: SubscriptionId, event: Event): void {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return;
    if (subscription.once) this.unsubscribe(id);
    try {
      Promise.resolve(subscription.callback(event)).catch((error) => {
        this.reportSubscriberError(error);
      });
    } catch (error) {
      this.reportSubscriberError(error);
    }
  }

  /**
   * Allows an internal adapter to release resources attached to a removed ID.
   *
   * @param _id - Subscription removed from the callback dictionary.
   */
  protected onUnsubscribe(_id: SubscriptionId): void {}

  /**
   * Reports a callback failure without failing the invocation.
   *
   * @param error - Synchronous exception or asynchronous rejection.
   */
  protected reportSubscriberError(error: unknown): void {
    console.error('Frame notification callback failed', error);
  }

  /**
   * Stores a new callback under a unique ID without invoking it.
   *
   * @param callback - Callback retained until cancellation or one-time delivery.
   * @param once - Whether the callback is removed before its first invocation.
   * @returns Unique identity of the subscription.
   * @throws If the callback is not callable.
   */
  private add(
    callback: NotificationCallback<Event>,
    once: boolean
  ): SubscriptionId {
    if (typeof callback !== 'function')
      throw new Error('A subscription requires a callback');
    const id = Symbol('notification-subscription');
    this.subscriptions.set(id, {callback, once});
    return id;
  }
}
