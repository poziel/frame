import { reactive } from "vue";
import type { FrameNotification, NotificationOptions } from "../types";

/** Transient notifications only. Optional consumers own their own history. */
export function createNotifications() {
  const state = reactive({ items: [] as FrameNotification[] });
  const listeners = new Set<(item: FrameNotification) => void>();
  const timers = new Map<string, { remaining: number; started: number; timer?: ReturnType<typeof setTimeout>; pauses: Set<string> }>();
  let sequence = 0, disposed = false;
  function dismiss(id: string) {
    clearTimeout(timers.get(id)?.timer); timers.delete(id);
    const index = state.items.findIndex(item => item.id === id);
    if (index >= 0) state.items.splice(index, 1);
  }
  function schedule(id: string) {
    const timing = timers.get(id);
    if (!timing || timing.pauses.size) return;
    timing.started = Date.now(); timing.timer = setTimeout(() => dismiss(id), timing.remaining);
  }
  function pause(id: string, reason = "manual") {
    const timing = timers.get(id);
    if (!timing || timing.pauses.has(reason)) return;
    if (!timing.pauses.size) { clearTimeout(timing.timer); timing.remaining = Math.max(0, timing.remaining - (Date.now() - timing.started)); }
    timing.pauses.add(reason);
  }
  function resume(id: string, reason = "manual") {
    const timing = timers.get(id);
    if (!timing?.pauses.delete(reason) || timing.pauses.size) return;
    schedule(id);
  }
  function notify(options: NotificationOptions) {
    if (disposed) throw new Error("Notifications have been disposed");
    const duration = options.duration ?? 5000;
    if (!Number.isFinite(duration) || duration < 0) throw new Error("Notification duration must be a finite non-negative number");
    let id = options.id;
    if (!id) { do { id = `notification-${++sequence}`; } while (state.items.some(item => item.id === id)); }
    if (state.items.some(item => item.id === id)) throw new Error(`Duplicate notification: ${id}`);
    state.items.unshift({ ...options, id, severity: options.severity ?? "info", duration, running: false });
    const item = state.items[0]!;
    if (duration > 0) { timers.set(id, { remaining: duration, started: Date.now(), pauses: new Set() }); schedule(id); }
    for (const listener of listeners) listener({ ...item });
    return { id, close: () => { if (state.items.includes(item)) dismiss(id); } };
  }
  async function runAction(id: string) {
    const item = state.items.find(item => item.id === id);
    if (!item?.action || item.running) return;
    item.running = true; pause(id, "action");
    try { await item.action.run(); if (state.items.includes(item)) dismiss(id); }
    catch (error) {
      if (state.items.includes(item)) { item.running = false; resume(id, "action"); }
      if (!disposed) notify({ title: "Notification action failed", severity: "error", details: error instanceof Error ? error.message : String(error) });
    }
  }
  function subscribe(listener: (item: FrameNotification) => void) {
    if (disposed) throw new Error("Notifications have been disposed");
    listeners.add(listener); return () => { listeners.delete(listener); };
  }
  function clear() { for (const id of timers.keys()) clearTimeout(timers.get(id)?.timer); timers.clear(); state.items.splice(0); }
  function dispose() { clear(); listeners.clear(); disposed = true; }
  return { state, notify, dismiss, clear, pause, resume, runAction, subscribe, dispose };
}
