import {createBarSeparators,type BarSeparatorOptions} from './barSeparators';
import {computed,shallowReactive,shallowRef} from 'vue';
import type {PanelDefinition} from '../types';
import type {ViewBadge} from './primaryViewBar';
export type PanelDisplay='icons'|'text'|'both';
export interface PanelViewBarOptions extends BarSeparatorOptions {visible?:boolean;size?:'default'|'compact';display?:PanelDisplay;hidden?:readonly string[];hiddenBadges?:readonly string[]}
export interface PanelViewItem extends PanelDefinition {visible:boolean;badgeVisible:boolean}
interface PanelLayout {panelViewBarDisplay:PanelDisplay;panelViewBarVisible:boolean;panelViewBarSize:'default'|'compact'}
/** Panel view-bar presentation is independent of panel docking and content lifetime. */
export function createPanelViewBar(registrations:()=>readonly PanelDefinition[],visible:(id:string)=>boolean,changeVisibility:(id:string,value:boolean)=>void,layout:PanelLayout,options:PanelViewBarOptions={},canMove:()=>boolean=()=>true){
 const separatorController=createBarSeparators(options,id=>registrations().some(item=>item.id===id),canMove);
 const badges=shallowReactive(new Map<string,boolean>()),values=shallowReactive(new Map<string,ViewBadge|undefined>()),disposed=shallowRef(false);
 const find=(id:string)=>disposed.value?undefined:registrations().find(item=>item.id===id);
 const size=computed(()=>layout.panelViewBarSize),barVisible=computed(()=>layout.panelViewBarVisible);
 function setSize(value:'default'|'compact'){if(disposed.value||!['default','compact'].includes(value))return false;layout.panelViewBarSize=value;return true;}
 function setBarVisible(value:boolean){if(disposed.value)return false;layout.panelViewBarVisible=value;return true;}
 const display=computed(()=>layout.panelViewBarDisplay);
 function setDisplay(value:PanelDisplay){if(disposed.value||!['icons','text','both'].includes(value))return false;layout.panelViewBarDisplay=value;return true;}
 function isVisible(id:string){return !!find(id)&&visible(id);}
 function setVisible(id:string,value:boolean){if(!find(id))return false;changeVisibility(id,value);return true;}
 function isBadgeVisible(id:string){return !!find(id)&&(badges.get(id)??!options.hiddenBadges?.includes(id));}
 function setBadgeVisible(id:string,value:boolean){if(!find(id))return false;badges.set(id,value);return true;}
 function setBadge(id:string,value?:ViewBadge){if(!find(id))return false;values.set(id,value);return true;}
 function initialize(id:string){if(options.hidden?.includes(id)&&find(id))changeVisibility(id,false);}
 function forget(id:string){badges.delete(id);values.delete(id);}
 function resetPresentation(){if(disposed.value)return;setDisplay(options.display??'both');setSize(options.size??'default');setBarVisible(options.visible??true);}
 const items=computed<PanelViewItem[]>(()=>disposed.value?[]:registrations().map(item=>({...item,visible:isVisible(item.id),badgeVisible:isBadgeVisible(item.id),badge:values.has(item.id)?values.get(item.id):item.badge})));
 function dispose(){separatorController.disposeSeparators();disposed.value=true;badges.clear();values.clear();}
 resetPresentation();
 return {...separatorController,visible:barVisible,size,setSize,setBarVisible,display,items,setDisplay,isVisible,setVisible,isBadgeVisible,setBadgeVisible,setBadge,initialize,forget,resetPresentation,dispose};
}
export type PanelViewBarController=ReturnType<typeof createPanelViewBar> & import('./features').PresentationController;
