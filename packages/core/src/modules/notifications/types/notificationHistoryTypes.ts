import type {FrameNotification} from '../../../framework/views/notifications';

/** Supported locations for the optional history indicator and panel. */
export type NotificationIndicatorPosition =
  'bottom-right' | 'bottom-left' | 'top-right';

/** Initial history capacity and indicator presentation choices. */
export interface NotificationHistoryOptions {

  /** Registers a Frame status button instead of requiring a footer-slot indicator. */
  statusBar?: boolean;

  /** Maximum retained notifications; defaults to 200 and must be a positive integer. */
  limit?: number;

  /** Initial panel and indicator location; defaults to bottom-right. */
  indicatorPosition?: NotificationIndicatorPosition;

  /** Initial feature availability; defaults to true, independently of pinning. */
  indicatorEnabled?: boolean;

  /** Initial toolbar pin visibility; defaults to true. */
  indicatorPinned?: boolean;
}

/** A retained notification snapshot with history-local identity and expansion. */
export interface HistoryNotification extends FrameNotification {

  /** Monotonic identity, distinct from reusable live notification IDs. */
  historyId: number;

  /** Mutable expanded-details state owned by the history presentation. */
  expanded: boolean;
}

/** Reactive state shared by the controller, indicator, panel, and shell bindings. */
export interface NotificationHistoryState {

  /** Whether the history panel is open; presentations may close it directly. */
  open: boolean;

  /** Retained snapshots ordered newest first, independent of live notifications. */
  items: HistoryNotification[];

  /** Current location shared by panel presentation and shell controls. */
  indicatorPosition: NotificationIndicatorPosition;

  /** Whether the indicator can open history; disabling preserves retained items. */
  indicatorEnabled: boolean;
}
