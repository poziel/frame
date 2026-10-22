import {computed,shallowReactive,shallowRef} from 'vue';
import type {PanelDefinition} from '../types';
import type {ActivityBadge} from './activity';
import type {PanelAlignment,PanelPosition} from './layout';
export type PanelDisplay='icons'|'text'|'both';
export interface PanelOptions {position?:PanelPosition;alignment?:PanelAlignment;display?:PanelDisplay;hidden?:readonly string[];hiddenBadges?:readonly string[]}
export interface PanelItem extends PanelDefinition {visible:boolean;badgeVisible:boolean}
interface PanelLayout {panelPosition:PanelPosition;panelAlignment:PanelAlignment;panelDisplay:PanelDisplay;panelVisible:boolean}
/** Presentation of existing panel registrations; hiding never unregisters a view. */
export function createPanel(registrations:()=>readonly PanelDefinition[],visible:(id:string)=>boolean,changeVisibility:(id:string,value:boolean)=>void,layout:PanelLayout,options:PanelOptions={}){
 const badges=shallowReactive(new Map<string,boolean>()),values=shallowReactive(new Map<string,ActivityBadge|undefined>()),disposed=shallowRef(false);
 const find=(id:string)=>disposed.value?undefined:registrations().find(item=>item.id===id);
 const position=computed(()=>layout.panelPosition),alignment=computed(()=>layout.panelAlignment),display=computed(()=>layout.panelDisplay),canAlign=computed(()=>layout.panelPosition==='top'||layout.panelPosition==='bottom');
 function setPosition(value:PanelPosition){if(disposed.value||!['top','bottom','left','right'].includes(value))return false;layout.panelPosition=value;return true;}
 function setAlignment(value:PanelAlignment){if(disposed.value||!canAlign.value||!['left','right','center','justify'].includes(value))return false;layout.panelAlignment=value;return true;}
 function setDisplay(value:PanelDisplay){if(disposed.value||!['icons','text','both'].includes(value))return false;layout.panelDisplay=value;return true;}
 function isVisible(id:string){return !!find(id)&&visible(id);}
 function setVisible(id:string,value:boolean){if(!find(id))return false;changeVisibility(id,value);return true;}
 function isBadgeVisible(id:string){return !!find(id)&&(badges.get(id)??!options.hiddenBadges?.includes(id));}
 function setBadgeVisible(id:string,value:boolean){if(!find(id))return false;badges.set(id,value);return true;}
 function setBadge(id:string,value?:ActivityBadge){if(!find(id))return false;values.set(id,value);return true;}
 function initialize(id:string){if(options.hidden?.includes(id)&&find(id))changeVisibility(id,false);}
 function forget(id:string){badges.delete(id);values.delete(id);}
 function hide(){if(disposed.value)return false;layout.panelVisible=false;return true;}
 function resetPresentation(){if(disposed.value)return;setPosition(options.position??'bottom');layout.panelAlignment=options.alignment??'center';setDisplay(options.display??'both');}
 const items=computed<PanelItem[]>(()=>disposed.value?[]:registrations().map(item=>({...item,visible:isVisible(item.id),badgeVisible:isBadgeVisible(item.id),badge:values.has(item.id)?values.get(item.id):item.badge})));
 function dispose(){disposed.value=true;badges.clear();values.clear();}
 resetPresentation();
 return {position,alignment,display,canAlign,items,setPosition,setAlignment,setDisplay,isVisible,setVisible,isBadgeVisible,setBadgeVisible,setBadge,initialize,forget,hide,resetPresentation,dispose};
}
export type PanelController=ReturnType<typeof createPanel>;
