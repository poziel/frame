import { reactive, readonly } from 'vue';
import type { ToolbarAction } from '../types';

export type ToolbarControl = 'customize' | 'primary' | 'bottom' | 'secondary' | 'commandCenter' | 'layoutControls';
export type ToolbarOptions = Partial<Record<ToolbarControl, boolean>>;
const defaults: Record<ToolbarControl, boolean> = { customize:true, primary:false, bottom:false, secondary:false, commandCenter:true, layoutControls:true };

/** Presentation preferences belong to the Frame instance, including when its shell remounts. */
export function createToolbar(options:ToolbarOptions = {}, actions:()=>readonly ToolbarAction[]) {
 const initial={...defaults};
 for(const key of Object.keys(defaults) as ToolbarControl[])if(typeof options[key]==='boolean')initial[key]=options[key]!;
 const controls=reactive({...initial});
 let disposed=false;
 function isVisible(control:ToolbarControl){return controls[control];}
 function setVisible(control:ToolbarControl,visible:boolean){if(disposed||!Object.prototype.hasOwnProperty.call(defaults,control))return false;controls[control]=visible;return true;}
 function toggle(control:ToolbarControl){return setVisible(control,!isVisible(control));}
 function setActionVisible(id:string,visible:boolean){if(disposed)return false;const action=actions().find(item=>item.id===id);if(!action)return false;action.visible=visible;return true;}
 function setActionEnabled(id:string,enabled:boolean){if(disposed)return false;const action=actions().find(item=>item.id===id);if(!action?.feature)return false;action.feature.setEnabled(enabled);return true;}
 function reset(){if(!disposed)Object.assign(controls,initial);}
 return {controls:readonly(controls),isVisible,setVisible,toggle,setActionVisible,setActionEnabled,reset,dispose(){reset();disposed=true;}};
}
