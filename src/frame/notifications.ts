import { reactive } from "vue";
import type { FrameNotification, NotificationOptions } from "../types";
export function createNotifications() {
  const state = reactive({ open: false, items: [] as FrameNotification[] });
  let sequence = 0;
  function dismiss(id: string) { const index = state.items.findIndex(item => item.id === id); if (index >= 0) state.items.splice(index, 1); }
  function notify(options: NotificationOptions) {
    let id = options.id;
    if (!id) { do { id = `notification-${++sequence}`; } while (state.items.some(item => item.id === id)); }
    if (state.items.some(item => item.id === id)) throw new Error(`Duplicate notification: ${id}`);
    state.items.unshift({ id, title: options.title, severity: options.severity ?? "info", details: options.details, source: options.source, priority: options.priority, expanded: false });
    if (options.show) state.open = true;
    const item = state.items.find(item => item.id === id)!;
    return { id, close: () => { if (state.items.includes(item)) dismiss(id); } };
  }
  function clear() { state.items.splice(0); }
  function dispose() { clear(); state.open = false; }
  return { state, notify, dismiss, clear, dispose };
}
