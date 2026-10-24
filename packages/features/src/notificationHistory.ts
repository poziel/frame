import { reactive, defineComponent, h } from "vue";
import { FrameIcon } from "@frame/core";
export type NotificationIndicatorPosition = "bottom-right" | "bottom-left" | "top-right";
export interface NotificationHistoryOptions { /** Register a Frame status button instead of mounting NotificationIndicator in a footer slot. Default: false. */ statusBar?: boolean; limit?: number; indicatorPosition?: NotificationIndicatorPosition; indicatorEnabled?: boolean; indicatorPinned?: boolean }
import type { Frame, FrameNotification } from "@frame/core";
export interface HistoryNotification extends FrameNotification { historyId: number; expanded: boolean }
/** Opt-in in-memory history. Create it before emitting notifications. */
export function createNotificationHistory(frame: Frame, options: NotificationHistoryOptions = {}) {
  const limit = options.limit ?? 200;
  if (!Number.isInteger(limit) || limit < 1) throw new Error("History limit must be a positive integer");
  const state = reactive({ open: false, items: [] as HistoryNotification[], indicatorPosition: options.indicatorPosition ?? 'bottom-right', indicatorEnabled: options.indicatorEnabled ?? true });
  let disposed=false;
  function setPosition(position: NotificationIndicatorPosition) {
    if (disposed) return;
    if (!['bottom-right', 'bottom-left', 'top-right'].includes(position)) throw Error('Unknown notification indicator position');
    state.indicatorPosition = position;
    if (options.statusBar) {
      const current = frame.toolbar.getPlacement(`action:${toolbarActionId}`);
      frame.toolbar.setPlacement(`action:${toolbarActionId}`, position === 'top-right'
        ? { area: 'titleBar' }
        : { area: 'statusBar', side: position === 'bottom-left' ? 'left' : 'right', order: current.area === 'statusBar' ? current.order : undefined });
    }
    if (statusItemId && position !== 'top-right') frame.status.move(statusItemId, position === 'bottom-left' ? 'left' : 'right');
  }
  function setEnabled(enabled:boolean) { if(disposed)return;state.indicatorEnabled=enabled;if(!enabled)state.open=false; }
  let toolbarActionId='notification-history';
  for(let suffix=2;frame.toolbarActions.some(item=>item.id===toolbarActionId);suffix++)toolbarActionId='notification-history-'+suffix;
  const removeAction=frame.registerToolbarAction({id:toolbarActionId,label:'Notifications',icon:defineComponent({setup:()=>()=>h(FrameIcon,{name:state.items.length?'bell-dot':'bell',size:16})}),visible:options.indicatorPinned??true,showInToolbar:()=>state.indicatorPosition==='top-right',feature:{label:'Notification Center',get enabled(){return state.indicatorEnabled;},setEnabled},run:()=>toggle()});
  let statusItemId: string | undefined;
  const registeredAction = frame.toolbarActions.find(action => action.id === toolbarActionId)!;
  if (options.statusBar) {
    registeredAction.placement = Object.freeze(state.indicatorPosition === 'top-right' ? { area: 'titleBar' } : { area: 'statusBar', side: state.indicatorPosition === 'bottom-left' ? 'left' : 'right' });
    registeredAction.showInStatusBar = () => false; // This feature already owns its badge/menu presentation.
    registeredAction.onPlacementChange = placement => setPosition(placement.area === 'titleBar' ? 'top-right' : placement.side === 'right' ? 'bottom-right' : 'bottom-left');
  }
  let removeStatus = () => {};
  if (options.statusBar) {
    statusItemId = toolbarActionId;
    for (let suffix = 2; frame.status.items.value.some(item => item.id === statusItemId); suffix++) statusItemId = toolbarActionId + '-' + suffix;
    removeStatus = frame.status.register({
      id: statusItemId, kind: 'button', label: 'Notification history', icon: 'bell',
      get order() { const placement=frame.toolbar.getPlacement(`action:${toolbarActionId}`);return placement.area==='statusBar'?placement.order??900:900; },
      get side() { return state.indicatorPosition === 'bottom-left' ? 'left' as const : 'right' as const; },
      get badge() { return state.items.length || undefined; },
      get tooltip() { return `Notification history (${state.items.length})`; },
      available: () => state.indicatorEnabled,
      showInStatusBar: () => state.indicatorPosition !== 'top-right',
      onMove: side => { const position = side === 'left' ? 'bottom-left' : 'bottom-right'; if(state.indicatorPosition!==position)setPosition(position); },
      run: () => toggle(),
    });
  }
  if (options.statusBar) registeredAction.onPlacementChange!(frame.toolbar.getPlacement(`action:${toolbarActionId}`));
  let sequence = 0;
  const unsubscribe = frame.notifications.subscribe(item => {
    state.items.unshift({ ...item, historyId: ++sequence, expanded: false });
    state.items.splice(limit);
  });
  function dismiss(id: number) { const index = state.items.findIndex(item => item.historyId === id); if (index >= 0) state.items.splice(index, 1); }
  function clear() { state.items.splice(0); }
  function toggle() { if(!disposed&&state.indicatorEnabled)state.open = !state.open; }
  function dispose() { if(disposed)return;unsubscribe();removeAction();removeStatus(); clear(); state.open = false;disposed=true; }
  return { state, toolbarActionId, statusItemId, setPosition, setEnabled, dismiss, clear, toggle, dispose };
}
export type NotificationHistory = ReturnType<typeof createNotificationHistory>;
