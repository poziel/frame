import {computed,shallowRef} from 'vue';
import type {PanelAlignment,PanelPosition,LayoutState} from './layout';
export type PanelDisplay='icons'|'text'|'both';
export interface PanelOptions {position?:PanelPosition;alignment?:PanelAlignment}
export function createPanel(layout:LayoutState,options:PanelOptions={}){
 const disposed=shallowRef(false),position=computed(()=>layout.panelPosition),alignment=computed(()=>layout.panelAlignment),canAlign=computed(()=>layout.panelPosition==='top'||layout.panelPosition==='bottom');
 function setPosition(value:PanelPosition){if(disposed.value||!['top','bottom','left','right'].includes(value))return false;layout.panelPosition=value;return true;}
 function setAlignment(value:PanelAlignment){if(disposed.value||!canAlign.value||!['left','right','center','justify'].includes(value))return false;layout.panelAlignment=value;return true;}
 function hide(){if(disposed.value)return false;layout.panelVisible=false;return true;}
 function resetPresentation(){if(disposed.value)return;setPosition(options.position??'bottom');layout.panelAlignment=options.alignment??'center';}
 resetPresentation();return {position,alignment,canAlign,setPosition,setAlignment,hide,resetPresentation,dispose(){disposed.value=true;}};
}
export type PanelController=ReturnType<typeof createPanel> & import('./features').ViewContainerController;
