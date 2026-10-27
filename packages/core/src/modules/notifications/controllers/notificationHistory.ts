import {reactive} from 'vue';
import type {Frame} from '../../../framework/frame';
import type {FrameNotification} from '../../../framework/views/notifications';
import {NotificationHistoryBindings} from '../integrations/notificationHistoryBindings';
import type {
  NotificationHistoryOptions,
  NotificationHistoryState,
  NotificationIndicatorPosition,
} from '../types/notificationHistoryTypes';

export type {
  NotificationHistoryOptions,
  NotificationHistoryState,
  NotificationIndicatorPosition,
  HistoryNotification,
} from '../types/notificationHistoryTypes';

/**
 * Retains bounded notification snapshots and coordinates optional history UI.
 *
 * Create history before emitting notifications: earlier deliveries are not
 * replayed. Retained entries outlive live toast expiration, and clearing them
 * never dismisses live notifications. The caller owns explicit disposal, which
 * releases subscriptions and shell controls without disposing its Frame.
 *
 * @example
 * const history = new NotificationHistoryController(frame, {limit: 100});
 * frame.notify({title: 'Build complete'});
 * history.toggle();
 * history.dispose();
 */
export class NotificationHistoryController {

  /** Mutable reactive state shared with existing panels and indicators. */
  readonly state: NotificationHistoryState;

  /** Toolbar action identity allocated by the shell binding. */
  readonly toolbarActionId: string;

  /** Optional status contribution identity allocated by the shell binding. */
  readonly statusItemId?: string;

  /** Maximum retained entries copied from initial host options. */
  private readonly limit: number;

  /** Shell registrations and placement behavior for this history instance. */
  private readonly bindings: NotificationHistoryBindings;

  /** Stops future notification deliveries when history is disposed. */
  private readonly unsubscribe: () => void;

  /** Monotonic history identity, independent of reusable live notification IDs. */
  private sequence = 0;

  /** Guards toggling, placement, and availability after caller-owned disposal. */
  private disposed = false;

  /**
   * Starts delivery observation and registers this history's shell controls.
   * @throws If the configured history limit is not a positive integer.
   */
  constructor(frame: Frame, options: NotificationHistoryOptions = {}) {
    this.limit = options.limit ?? 200;
    if (!Number.isInteger(this.limit) || this.limit < 1)
      throw new Error('History limit must be a positive integer');
    this.state = reactive({
      open: false,
      items: [],
      indicatorPosition: options.indicatorPosition ?? 'bottom-right',
      indicatorEnabled: options.indicatorEnabled ?? true,
    });
    this.setPosition = this.setPosition.bind(this);
    this.setEnabled = this.setEnabled.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.clear = this.clear.bind(this);
    this.toggle = this.toggle.bind(this);
    this.dispose = this.dispose.bind(this);
    this.bindings = new NotificationHistoryBindings(
      frame,
      this.state,
      options,
      {setEnabled: this.setEnabled, toggle: this.toggle}
    );
    this.toolbarActionId = this.bindings.toolbarActionId;
    this.statusItemId = this.bindings.statusItemId;
    this.unsubscribe = frame.notifications.subscribe((item) =>
      this.receive(item)
    );
  }

  /** Moves the panel and indicator without changing feature availability or pinning. */
  setPosition(position: NotificationIndicatorPosition): void {
    if (this.disposed) return;
    this.bindings.setPosition(position);
  }

  /** Changes indicator availability, closing an open panel when disabled. */
  setEnabled(enabled: boolean): void {
    if (this.disposed) return;
    this.state.indicatorEnabled = enabled;
    if (!enabled) this.state.open = false;
  }

  /** Removes one history-local entry while preserving live notifications. */
  dismiss(id: number): void {
    const index = this.state.items.findIndex((item) => item.historyId === id);
    if (index >= 0) this.state.items.splice(index, 1);
  }

  /** Empties retained entries without resetting their monotonic identity sequence. */
  clear(): void {
    this.state.items.splice(0);
  }

  /** Opens or closes history only while active and enabled. */
  toggle(): void {
    if (!this.disposed && this.state.indicatorEnabled)
      this.state.open = !this.state.open;
  }

  /** Unsubscribes, unregisters shell controls, clears history, and closes the panel. */
  dispose(): void {
    if (this.disposed) return;
    this.unsubscribe();
    this.bindings.dispose();
    this.clear();
    this.state.open = false;
    this.disposed = true;
  }

  /** Copies a delivered snapshot to the front and trims the oldest excess entries. */
  private receive(item: FrameNotification): void {
    this.state.items.unshift({
      ...item,
      historyId: ++this.sequence,
      expanded: false,
    });
    this.state.items.splice(this.limit);
  }
}

/** Structural history API retained for existing panels and host implementations. */
export type NotificationHistory = Pick<
  NotificationHistoryController,
  keyof NotificationHistoryController
>;

/** Starts an opt-in, class-backed history through the existing public factory. */
export function createNotificationHistory(
  frame: Frame,
  options: NotificationHistoryOptions = {}
): NotificationHistory {
  return new NotificationHistoryController(frame, options);
}
