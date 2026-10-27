import {reactive} from 'vue';

/** One timestamped message in the owning Frame instance's session log. */
export interface ActivityEntry {

  /** Stable identity used to address this contribution. */
  id: number;

  /** Display timestamp recorded with the session message. */
  time: string;

  /** Session message recorded by the owning Frame. */
  message: string;
}

/**
 * Owns the bounded, timestamped application session log.
 * The root state projection shares this array without keeping a second log.
 */
export class ActivityLog {

  /** Reactive entries shared by the owning application state projection. */
  readonly entries = reactive<ActivityEntry[]>([]);

  /** Monotonic identity for session-log entries. */
  private logId = 0;

  /** Creates an independent bounded session log. */
  constructor() {
    this.record = this.record.bind(this);
  }

  /** Appends a bounded session-log entry with a stable identity. */
  record(message: string) {
    this.entries.push({
      id: ++this.logId,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      message,
    });
    if (this.entries.length > 100) this.entries.shift();
  }
}
