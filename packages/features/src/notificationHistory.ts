import { reactive, defineComponent, h } from "vue";
import { FrameIcon } from "@frame/core";
export type NotificationIndicatorPosition = "bottom-right" | "bottom-left" | "top-right";
export interface NotificationHistoryOptions { limit?: number; indicatorPosition?: NotificationIndicatorPosition; indicatorEnabled?: boolean; indicatorPinned?: boolean }
import type { Frame, FrameNotification } from "@frame/core";
export interface HistoryNotification extends FrameNotification { historyId: number; expanded: boolean }
/** Opt-in in-memory history. Create it before emitting notifications. */
export function createNotificationHistory(frame: Frame, options: NotificationHistoryOptions = {}) {
  const limit = options.limit ?? 200;
  if (!Number.isInteger(limit) || limit < 1) throw new Error("History limit must be a positive integer");
  const state = reactive({ open: false, items: [] as HistoryNotification[], indicatorPosition: options.indicatorPosition ?? 'bottom-right', indicatorEnabled: options.indicatorEnabled ?? true });
  let disposed=false;
  function setPosition(position:NotificationIndicatorPosition) { if(disposed)return; if(!['bottom-right','bottom-left','top-right'].includes(position))throw Error('Unknown notification indicator position'); state.indicatorPosition=position; }
  function setEnabled(enabled:boolean) { if(disposed)return;state.indicatorEnabled=enabled;if(!enabled)state.open=false; }
  let toolbarActionId='notification-history';
  for(let suffix=2;frame.toolbarActions.some(item=>item.id===toolbarActionId);suffix++)toolbarActionId='notification-history-'+suffix;
  const removeAction=frame.registerToolbarAction({id:toolbarActionId,label:'Notifications',icon:defineComponent({setup:()=>()=>h(FrameIcon,{name:state.items.length?'bell-dot':'bell',size:16})}),visible:options.indicatorPinned??true,showInToolbar:()=>state.indicatorPosition==='top-right',feature:{label:'Notification Center',get enabled(){return state.indicatorEnabled;},setEnabled},run:()=>toggle()});
  let sequence = 0;
  const unsubscribe = frame.notifications.subscribe(item => {
    state.items.unshift({ ...item, historyId: ++sequence, expanded: false });
    state.items.splice(limit);
  });
  function dismiss(id: number) { const index = state.items.findIndex(item => item.historyId === id); if (index >= 0) state.items.splice(index, 1); }
  function clear() { state.items.splice(0); }
  function toggle() { if(!disposed&&state.indicatorEnabled)state.open = !state.open; }
  function dispose() { if(disposed)return;unsubscribe();removeAction(); clear(); state.open = false;disposed=true; }
  return { state, toolbarActionId, setPosition, setEnabled, dismiss, clear, toggle, dispose };
}
export type NotificationHistory = ReturnType<typeof createNotificationHistory>;
