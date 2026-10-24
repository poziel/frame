import {createBarSeparators,type BarSeparatorOptions} from './barSeparators';
import { computed, shallowReactive, shallowRef } from 'vue';
import type { ViewBadge, ViewBarPosition, ViewBarDisplay } from './primaryViewBar';
import type { PanelDefinition } from '../types';

export type SecondaryViewBarDisplay = ViewBarDisplay;
export type SecondaryViewBarSize = 'default' | 'compact';
export interface SecondaryViewBarOptions extends BarSeparatorOptions {
  display?: SecondaryViewBarDisplay;
  position?: ViewBarPosition;
  size?: SecondaryViewBarSize;
  /** Initially hide these root secondary views without unregistering them. */
  hidden?: readonly string[];
  hiddenBadges?: readonly string[];
  /** Allow users and controller APIs to change size/display after initialization. */
  allowSizeChange?: boolean;
  allowDisplayChange?: boolean;
}
export interface SecondaryViewBarItem extends PanelDefinition { visible: boolean; badgeVisible: boolean }
interface BarLayout {
  secondaryViewBarDisplay: SecondaryViewBarDisplay;
  secondaryViewBarVisible: boolean;
  secondaryViewBarPosition: Exclude<ViewBarPosition, "hidden">;
  secondaryViewBarSize: SecondaryViewBarSize;
  primarySide: 'left' | 'right';
}

/** Secondary view-bar preferences share existing registration and view-visibility state. */
export function createSecondaryViewBar(
  registrations: () => readonly PanelDefinition[],
  visible: (id: string) => boolean,
  changeVisibility: (id: string, visible: boolean) => void,
  layout: BarLayout,
  options: SecondaryViewBarOptions = {},
  canMove: () => boolean = () => true,
) {
 const allowSizeChange=options.allowSizeChange !== false, allowDisplayChange=options.allowDisplayChange !== false;
 const separatorController=createBarSeparators(options,id=>registrations().some(item=>item.id===id),canMove);
  const badgeVisibility=shallowReactive(new Map<string,boolean>());
  const badgeValues=shallowReactive(new Map<string,ViewBadge|undefined>());
  const disposed=shallowRef(false);
  const find=(id:string)=>disposed.value?undefined:registrations().find(item=>item.id===id);
  const display=computed(()=>layout.secondaryViewBarDisplay);
  const position=computed<ViewBarPosition>(()=>layout.secondaryViewBarVisible?layout.secondaryViewBarPosition:"hidden");
  const effectiveDisplay=computed<SecondaryViewBarDisplay>(()=>display.value);
  function setPosition(value:ViewBarPosition){if(disposed.value||!['default','top','bottom','hidden'].includes(value))return false;if(value!=='hidden')layout.secondaryViewBarPosition=value;layout.secondaryViewBarVisible=value!=='hidden';return true;}
  const size=computed(()=>layout.secondaryViewBarSize);
  const side=computed<'left'|'right'>(()=>layout.primarySide==='left'?'right':'left');
  function setDisplay(value:SecondaryViewBarDisplay){if((!allowDisplayChange && value !== (options.display ?? 'both'))||disposed.value||!['icons','text','both'].includes(value))return false;layout.secondaryViewBarDisplay=value;return true;}
  function setSize(value:SecondaryViewBarSize){if((!allowSizeChange && value !== (options.size ?? 'default'))||disposed.value||!['default','compact'].includes(value))return false;layout.secondaryViewBarSize=value;return true;}
  function moveSide(value:'left'|'right'){if(disposed.value||!['left','right'].includes(value))return false;layout.primarySide=value==='left'?'right':'left';return true;}
  function isVisible(id:string){return !!find(id)&&visible(id);}
  function setVisible(id:string,value:boolean){if(!find(id))return false;changeVisibility(id,value);return true;}
  function isBadgeVisible(id:string){return !!find(id)&&(badgeVisibility.get(id)??!options.hiddenBadges?.includes(id));}
  function setBadgeVisible(id:string,value:boolean){if(!find(id))return false;badgeVisibility.set(id,value);return true;}
  function setBadge(id:string,value?:ViewBadge){if(!find(id))return false;badgeValues.set(id,value);return true;}
  function initialize(id:string){if(options.hidden?.includes(id)&&find(id))changeVisibility(id,false);}
  function forget(id:string){badgeVisibility.delete(id);badgeValues.delete(id);}
  function resetPresentation(){layout.secondaryViewBarDisplay=options.display??'both';setPosition(options.position??'top');setSize(options.size??'default');}
  const items=computed<SecondaryViewBarItem[]>(()=>disposed.value?[]:registrations().map(item=>({...item,visible:isVisible(item.id),badgeVisible:isBadgeVisible(item.id),badge:badgeValues.has(item.id)?badgeValues.get(item.id):item.badge})));
  function dispose(){separatorController.disposeSeparators();disposed.value=true;badgeVisibility.clear();badgeValues.clear();}
  resetPresentation();
  return {allowSizeChange,allowDisplayChange,...separatorController,display,effectiveDisplay,position,setPosition,size,side,items,setDisplay,setSize,moveSide,isVisible,setVisible,isBadgeVisible,setBadgeVisible,setBadge,initialize,forget,resetPresentation,dispose};
}
export type SecondaryViewBarController=ReturnType<typeof createSecondaryViewBar> & import('./features').PresentationController;
