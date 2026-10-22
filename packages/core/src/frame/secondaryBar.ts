import { computed, shallowReactive, shallowRef } from 'vue';
import type { ActivityBadge, ActivityBarPosition, ActivityBarDisplay } from './activity';
import type { PanelDefinition } from '../types';

export type SecondaryBarDisplay = ActivityBarDisplay;
export type SecondaryBarSize = 'default' | 'compact';
export interface SecondaryBarOptions {
  display?: SecondaryBarDisplay;
  position?: ActivityBarPosition;
  size?: SecondaryBarSize;
  /** Initially hide these root secondary views without unregistering them. */
  hidden?: readonly string[];
  hiddenBadges?: readonly string[];
}
export interface SecondaryBarItem extends PanelDefinition { visible: boolean; badgeVisible: boolean }
interface BarLayout {
  secondaryBarDisplay: SecondaryBarDisplay;
  secondaryActivityBarVisible: boolean;
  secondaryActivityBarPosition: Exclude<ActivityBarPosition, "hidden">;
  secondaryBarSize: SecondaryBarSize;
  primarySide: 'left' | 'right';
}

/** Secondary view-bar preferences share existing registration and view-visibility state. */
export function createSecondaryBar(
  registrations: () => readonly PanelDefinition[],
  visible: (id: string) => boolean,
  changeVisibility: (id: string, visible: boolean) => void,
  layout: BarLayout,
  options: SecondaryBarOptions = {},
) {
  const badgeVisibility=shallowReactive(new Map<string,boolean>());
  const badgeValues=shallowReactive(new Map<string,ActivityBadge|undefined>());
  const disposed=shallowRef(false);
  const find=(id:string)=>disposed.value?undefined:registrations().find(item=>item.id===id);
  const display=computed(()=>layout.secondaryBarDisplay);
  const position=computed<ActivityBarPosition>(()=>layout.secondaryActivityBarVisible?layout.secondaryActivityBarPosition:"hidden");
  const effectiveDisplay=computed<SecondaryBarDisplay>(()=>layout.secondaryActivityBarPosition==='default'?'icons':display.value);
  function setPosition(value:ActivityBarPosition){if(disposed.value||!['default','top','bottom','hidden'].includes(value))return false;if(value!=='hidden')layout.secondaryActivityBarPosition=value;layout.secondaryActivityBarVisible=value!=='hidden';return true;}
  const size=computed(()=>layout.secondaryBarSize);
  const side=computed<'left'|'right'>(()=>layout.primarySide==='left'?'right':'left');
  function setDisplay(value:SecondaryBarDisplay){if(disposed.value||!['icons','text','both'].includes(value)||layout.secondaryActivityBarPosition==='default'&&value!=='icons')return false;layout.secondaryBarDisplay=value;return true;}
  function setSize(value:SecondaryBarSize){if(disposed.value||!['default','compact'].includes(value))return false;layout.secondaryBarSize=value;return true;}
  function moveSide(value:'left'|'right'){if(disposed.value||!['left','right'].includes(value))return false;layout.primarySide=value==='left'?'right':'left';return true;}
  function isVisible(id:string){return !!find(id)&&visible(id);}
  function setVisible(id:string,value:boolean){if(!find(id))return false;changeVisibility(id,value);return true;}
  function isBadgeVisible(id:string){return !!find(id)&&(badgeVisibility.get(id)??!options.hiddenBadges?.includes(id));}
  function setBadgeVisible(id:string,value:boolean){if(!find(id))return false;badgeVisibility.set(id,value);return true;}
  function setBadge(id:string,value?:ActivityBadge){if(!find(id))return false;badgeValues.set(id,value);return true;}
  function initialize(id:string){if(options.hidden?.includes(id)&&find(id))changeVisibility(id,false);}
  function forget(id:string){badgeVisibility.delete(id);badgeValues.delete(id);}
  function resetPresentation(){layout.secondaryBarDisplay=options.display??'both';setPosition(options.position??'top');setSize(options.size??'default');}
  const items=computed<SecondaryBarItem[]>(()=>disposed.value?[]:registrations().map(item=>({...item,visible:isVisible(item.id),badgeVisible:isBadgeVisible(item.id),badge:badgeValues.has(item.id)?badgeValues.get(item.id):item.badge})));
  function dispose(){disposed.value=true;badgeVisibility.clear();badgeValues.clear();}
  resetPresentation();
  return {display,effectiveDisplay,position,setPosition,size,side,items,setDisplay,setSize,moveSide,isVisible,setVisible,isBadgeVisible,setBadgeVisible,setBadge,initialize,forget,resetPresentation,dispose};
}
export type SecondaryBarController=ReturnType<typeof createSecondaryBar>;
