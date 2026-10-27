import {effectScope, watch, type EffectScope} from 'vue';
import {
  Notifier,
  type NotificationCallback,
  type StateChange,
  type SubscriptionId,
} from './notifier';

/**
 * Internal bridge from reactive owner state to explicit notifier invocations.
 *
 * @remarks
 * Each ID observes its own source, keeping contextual permissions independent.
 * Stopping a subscription releases its watcher. Terminal inactive snapshots
 * are delivered once before that subscription is removed. No watcher starts
 * until an owner explicitly registers a subscriber.
 *
 * @typeParam State - Owner snapshot including its registration lifetime.
 */
export class StateObserver<State extends {active: boolean}> extends Notifier<
  StateChange<State>
> {

  /** Detached scopes keyed by the same IDs used by the notifier. */
  private readonly scopes = new Map<SubscriptionId, EffectScope>();

  /**
   * Subscribes to changes in an owner's effective state.
   *
   * @param callback - Receives one current/previous change payload.
   * @param readState - Reads a target-specific snapshot and reactive dependencies.
   * @param once - Whether only the next actual change should be delivered.
   * @returns Subscription ID shared by observation and callback cleanup.
   * @throws If the registration is inactive or the source cannot be evaluated.
   */
  observe(
    callback: NotificationCallback<StateChange<State>>,
    readState: () => State,
    once = false
  ): SubscriptionId {
    const read = () => Object.freeze({...readState()});
    if (!read().active)
      throw new Error('Cannot subscribe to an inactive registration');
    const id = once ? this.subscribeOnce(callback) : this.subscribe(callback);
    const scope = effectScope(true);
    this.scopes.set(id, scope);
    try {
      scope.run(() =>
        watch(
          read,
          (current, previous) => {
            if (this.sameState(current, previous)) return;
            try {
              this.invokeSubscription(id, Object.freeze({previous, current}));
            } finally {
              if (!current.active) this.unsubscribe(id);
            }
          },
          {flush: 'sync'}
        )
      );
    } catch (error) {
      this.unsubscribe(id);
      throw error;
    }
    return id;
  }

  /**
   * Releases the watcher when cancellation or one-time delivery removes an ID.
   *
   * @param id - Subscription whose reactive resources must be released.
   */
  protected onUnsubscribe(id: SubscriptionId): void {
    this.scopes.get(id)?.stop();
    this.scopes.delete(id);
  }

  /**
   * Suppresses dependency updates that leave the effective snapshot unchanged.
   *
   * @param current - Most recently evaluated snapshot.
   * @param previous - Previously evaluated snapshot.
   * @returns Whether both snapshots contain identical own keys and values.
   */
  private sameState(
    current: Readonly<State>,
    previous: Readonly<State>
  ): boolean {
    const keys = Object.keys(current) as (keyof State)[];
    return (
      keys.length === Object.keys(previous).length &&
      keys.every((key) => Object.is(current[key], previous[key]))
    );
  }
}
