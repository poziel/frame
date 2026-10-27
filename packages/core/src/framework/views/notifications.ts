import {reactive} from 'vue';

/** Semantic notification severity used by live and retained presentations. */
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

/** Optional application action offered by a notification. */
export interface NotificationAction {

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Application callback invoked when the action is activated. */
  run: () => void | Promise<void>;
}

/** Live notification snapshot retained by its owning Notifications controller. */
export interface FrameNotification {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Semantic severity used to style the notification. */
  severity: NotificationSeverity;

  /** Optional expanded notification content. */
  details?: string;

  /** Optional application source identifying the notification origin. */
  source?: string;

  /** Optional host priority annotation retained with the notification. */
  priority?: string;

  /** Dismissal delay in milliseconds; zero keeps the notification persistent. */
  duration: number;

  /** Optional application action offered by the notification. */
  action?: NotificationAction;

  /** Whether the notification action is currently executing. */
  running: boolean;
}

/** Host-supplied delivery data used to create a live notification. */
export interface NotificationOptions {

  /** Stable identity used to address this contribution. */
  id?: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Semantic severity used to style the notification. */
  severity?: NotificationSeverity;

  /** Optional expanded notification content. */
  details?: string;

  /** Optional application source identifying the notification origin. */
  source?: string;

  /** Optional host priority annotation retained with the notification. */
  priority?: string;

  /** Dismissal delay in milliseconds; zero keeps the notification persistent. */
  duration?: number;

  /** Optional application action offered by the notification. */
  action?: NotificationAction;
}

/**
 * Owns transient notifications, delivery listeners, and dismissal timers.
 * Timer pauses are tracked independently by reason. Optional history consumers
 * subscribe to deliveries without taking ownership of this live collection.
 */
export class Notifications {

  /** Reactive presentation state shared with the owning shell. */
  readonly state: {items: FrameNotification[]};

  /** Delivery listeners notified when a new notification is registered. */
  private readonly listeners: Set<(item: FrameNotification) => void>;

  /** Per-notification dismissal timing and independently tracked pause reasons. */
  private readonly timers: Map<
    string,
    {
      remaining: number;
      started: number;
      timer?: ReturnType<typeof setTimeout>;
      pauses: Set<string>;
    }
  >;

  /** Sequence used to allocate notification IDs without collisions. */
  private sequence: number;

  /** Prevents operations after this controller has released its resources. */
  private disposed: boolean;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor() {
    this.dismiss = this.dismiss.bind(this);
    this.schedule = this.schedule.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.notify = this.notify.bind(this);
    this.runAction = this.runAction.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.clear = this.clear.bind(this);
    this.dispose = this.dispose.bind(this);
    this.state = reactive({items: [] as FrameNotification[]});
    this.listeners = new Set<(item: FrameNotification) => void>();
    this.timers = new Map<
      string,
      {
        remaining: number;
        started: number;
        timer?: ReturnType<typeof setTimeout>;
        pauses: Set<string>;
      }
    >();
    this.sequence = 0;
    this.disposed = false;
  }

  /** Dismisses a current notification and cancels its pending dismissal timer. */
  dismiss(id: string) {
    clearTimeout(this.timers.get(id)?.timer);
    this.timers.delete(id);
    const index = this.state.items.findIndex((item) => item.id === id);
    if (index >= 0) this.state.items.splice(index, 1);
  }

  /** Suspends dismissal for one reason while preserving elapsed active time. */
  pause(id: string, reason = 'manual') {
    const timing = this.timers.get(id);
    if (!timing || timing.pauses.has(reason)) return;
    if (!timing.pauses.size) {
      clearTimeout(timing.timer);
      timing.remaining = Math.max(
        0,
        timing.remaining - (Date.now() - timing.started)
      );
    }
    timing.pauses.add(reason);
  }

  /** Releases one pause reason and resumes dismissal once all reasons are cleared. */
  resume(id: string, reason = 'manual') {
    const timing = this.timers.get(id);
    if (!timing?.pauses.delete(reason) || timing.pauses.size) return;
    this.schedule(id);
  }

  /** Adds a transient notification and returns a registration-safe close operation. */
  notify(options: NotificationOptions) {
    if (this.disposed) throw new Error('Notifications have been disposed');
    const duration = options.duration ?? 5000;
    if (!Number.isFinite(duration) || duration < 0)
      throw new Error(
        'Notification duration must be a finite non-negative number'
      );
    let id = options.id;
    if (!id) {
      do {
        id = `notification-${++this.sequence}`;
      } while (this.state.items.some((item) => item.id === id));
    }
    if (this.state.items.some((item) => item.id === id))
      throw new Error(`Duplicate notification: ${id}`);
    this.state.items.unshift({
      ...options,
      id,
      severity: options.severity ?? 'info',
      duration,
      running: false,
    });
    const item = this.state.items[0]!;
    if (duration > 0) {
      this.timers.set(id, {
        remaining: duration,
        started: Date.now(),
        pauses: new Set(),
      });
      this.schedule(id);
    }
    for (const listener of this.listeners) listener({...item});
    return {
      id,
      close: () => {
        if (this.state.items.includes(item)) this.dismiss(id);
      },
    };
  }

  /** Runs a notification action with timer suspension and error reporting. */
  async runAction(id: string) {
    const item = this.state.items.find((item) => item.id === id);
    if (!item?.action || item.running) return;
    item.running = true;
    this.pause(id, 'action');
    try {
      await item.action.run();
      if (this.state.items.includes(item)) this.dismiss(id);
    } catch (error) {
      if (this.state.items.includes(item)) {
        item.running = false;
        this.resume(id, 'action');
      }
      if (!this.disposed)
        this.notify({
          title: 'Notification action failed',
          severity: 'error',
          details: error instanceof Error ? error.message : String(error),
        });
    }
  }

  /** Registers a delivery listener and returns its removal callback. */
  subscribe(listener: (item: FrameNotification) => void) {
    if (this.disposed) throw new Error('Notifications have been disposed');
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Clears retained entries or transient presentation state owned by this controller. */
  clear() {
    for (const id of this.timers.keys())
      clearTimeout(this.timers.get(id)?.timer);
    this.timers.clear();
    this.state.items.splice(0);
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.clear();
    this.listeners.clear();
    this.disposed = true;
  }

  /** Schedules dismissal using the remaining active duration. */
  private schedule(id: string) {
    const timing = this.timers.get(id);
    if (!timing || timing.pauses.size) return;
    timing.started = Date.now();
    timing.timer = setTimeout(() => this.dismiss(id), timing.remaining);
  }
}
