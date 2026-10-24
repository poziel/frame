import { reactive, readonly, shallowReactive } from 'vue';
import type { ToolbarAction } from '../types';

export type ToolbarControl = 'customize' | 'primary' | 'bottom' | 'secondary' | 'commandCenter' | 'layoutControls';
export type ToolbarButton = 'customize' | 'primary' | 'bottom' | 'secondary';
export type ToolbarItemId = ToolbarButton | `action:${string}`;
export type ToolbarPlacement = Readonly<{ area: 'titleBar' } | { area: 'statusBar'; side?: 'left' | 'right'; order?: number }>;
export type ToolbarOptions = Partial<Record<ToolbarControl, boolean>> & {
 /** Allow the title-bar customization context menu. Default: true. */ contextMenu?: boolean;
 placements?: Readonly<Partial<Record<ToolbarItemId, ToolbarPlacement>>>;
};
const titlePlacement: ToolbarPlacement = Object.freeze({ area: 'titleBar' });
export function validToolbarPlacement(value: ToolbarPlacement): boolean {
 return !!value && (value.area === 'titleBar' || value.area === 'statusBar' &&
   (value.side === undefined || value.side === 'left' || value.side === 'right') &&
   (value.order === undefined || Number.isFinite(value.order)));
}
const buttonIds = new Set(['customize', 'primary', 'bottom', 'secondary']);
const samePlacement = (first: ToolbarPlacement, second: ToolbarPlacement) => first.area === second.area && (first.area === 'titleBar' || second.area === 'statusBar' && first.side === second.side && first.order === second.order);
const defaults: Record<ToolbarControl, boolean> = { customize:true, primary:false, bottom:false, secondary:false, commandCenter:true, layoutControls:true };

/** Presentation preferences belong to the Frame instance, including when its shell remounts. */
export function createToolbar(options:ToolbarOptions = {}, actions:()=>readonly ToolbarAction[]) {
 const contextMenuEnabled=options.contextMenu!==false;
 const initial={...defaults};
 for(const key of Object.keys(defaults) as ToolbarControl[])if(typeof options[key]==='boolean')initial[key]=options[key]!;
 const controls=reactive({...initial});
 const initialPlacements = new Map<ToolbarItemId, ToolbarPlacement>();
 for (const [id, placement] of Object.entries(options.placements ?? {})) {
   if ((!buttonIds.has(id) && !/^action:.+/.test(id)) || !validToolbarPlacement(placement!)) throw new Error(`Invalid toolbar placement: ${id}`);
   initialPlacements.set(id as ToolbarItemId, Object.freeze({ ...placement! }));
 }
 const placements = shallowReactive(new Map<ToolbarItemId, ToolbarPlacement>());
 let disposed=false;
 function getPlacement(id: ToolbarItemId): ToolbarPlacement {
   return placements.get(id) ?? initialPlacements.get(id) ?? (id.startsWith('action:') ? actions().find(action => action.id === id.slice(7))?.placement : undefined) ?? titlePlacement;
 }
 function setPlacement(id: ToolbarItemId, placement: ToolbarPlacement) {
   if (disposed || (!buttonIds.has(id) && !(id.startsWith('action:') && actions().some(action => action.id === id.slice(7)))) || !validToolbarPlacement(placement)) return false;
   const previous = getPlacement(id);
   if (samePlacement(previous, placement)) return true;
   const next = Object.freeze({ ...placement });
   placements.set(id, next);
   if (id.startsWith('action:')) actions().find(action => action.id === id.slice(7))?.onPlacementChange?.(next);
   return true;
 }
 function forgetAction(id: string) { placements.delete(`action:${id}`); }
 function isVisible(control:ToolbarControl){return controls[control];}
 function setVisible(control:ToolbarControl,visible:boolean){if(disposed||!Object.prototype.hasOwnProperty.call(defaults,control))return false;controls[control]=visible;return true;}
 function toggle(control:ToolbarControl){return setVisible(control,!isVisible(control));}
 function setActionVisible(id:string,visible:boolean){if(disposed)return false;const action=actions().find(item=>item.id===id);if(!action)return false;action.visible=visible;return true;}
 function setActionEnabled(id:string,enabled:boolean){if(disposed)return false;const action=actions().find(item=>item.id===id);if(!action?.feature)return false;action.feature.setEnabled(enabled);return true;}
 function reset(){if(!disposed){
   const previous = new Map(actions().map(action => [action.id, getPlacement(`action:${action.id}`)]));
   Object.assign(controls,initial);placements.clear();
   for (const action of actions()) { const next = getPlacement(`action:${action.id}`); if (!samePlacement(previous.get(action.id)!, next)) action.onPlacementChange?.(next); }
 }}
 return {get contextMenuEnabled(){return contextMenuEnabled;},controls:readonly(controls),isVisible,setVisible,toggle,setActionVisible,setActionEnabled,getPlacement,setPlacement,forgetAction,reset,dispose(){disposed=true;Object.assign(controls,initial);placements.clear();}};
}
