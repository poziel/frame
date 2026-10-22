import { reactive } from "vue";
import type { Frame, FrameNotification } from "@frame/core";
export interface HistoryNotification extends FrameNotification { historyId: number; expanded: boolean }
/** Opt-in in-memory history. Create it before emitting notifications. */
export function createNotificationHistory(frame: Frame, options: { limit?: number } = {}) {
  const limit = options.limit ?? 200;
  if (!Number.isInteger(limit) || limit < 1) throw new Error("History limit must be a positive integer");
  const state = reactive({ open: false, items: [] as HistoryNotification[] });
  let sequence = 0;
  const unsubscribe = frame.notifications.subscribe(item => {
    state.items.unshift({ ...item, historyId: ++sequence, expanded: false });
    state.items.splice(limit);
  });
  function dismiss(id: number) { const index = state.items.findIndex(item => item.historyId === id); if (index >= 0) state.items.splice(index, 1); }
  function clear() { state.items.splice(0); }
  function toggle() { state.open = !state.open; }
  function dispose() { unsubscribe(); clear(); state.open = false; }
  return { state, dismiss, clear, toggle, dispose };
}
export type NotificationHistory = ReturnType<typeof createNotificationHistory>;
