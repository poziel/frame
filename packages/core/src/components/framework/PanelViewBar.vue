<script setup lang="ts">
import DockRegion from "./DockRegion.vue";
import { useId } from 'vue';
import { ContextMenuCommands } from '../../framework/commands/contextMenuCommands';
import ViewBarSeparators from './ViewBarSeparators.vue';
import {barContextActions} from '../../framework/layout/barContext';
import FrameContextMenu from "../navigation/FrameContextMenu.vue";
import {computed,nextTick,onMounted,onBeforeUnmount,ref,shallowRef,watch} from 'vue';
import type {PanelDefinition} from '../../framework/views/shellViewContainer';
import type {FrameMenuItem} from '../navigation/generalMenu';
import {useFrame} from '../../framework/useFrame';
import FrameDropdownMenu from '../navigation/FrameDropdownMenu.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';
import BarItemContent from './BarItemContent.vue';
import './styles/bar-items.css';
import './styles/panel-view-bar.css';
const props=defineProps<{tabs:readonly PanelDefinition[];activeId:string;secondary:boolean;uid:string;contentId?:string;managed?:boolean}>();
const emit=defineEmits<{select:[id:string]}>();
const frame=useFrame();const root=ref<HTMLElement>(),measureRoot=ref<HTMLElement>();
const overflowAnchor=shallowRef<HTMLElement>(),contextAnchor=shallowRef<HTMLElement>();const point=ref({x:0,y:0}),target=ref('');
const shownIds=ref<string[]>([]);let observer:ResizeObserver|undefined;
const display=computed(()=>props.secondary?frame.secondaryViewBar.display.value:frame.panelViewBar.display.value);
const compact=computed(()=>(props.secondary?frame.secondaryViewBar:frame.panelViewBar).size.value==='compact');
const controller=computed(()=>props.secondary?frame.secondaryViewBar:frame.panelViewBar);
const tabs=computed(()=>props.tabs.filter(tab=>!props.managed||controller.value.isVisible(tab.id)));
const visible=computed(()=>tabs.value.filter(tab=>shownIds.value.includes(tab.id)));
const hidden=computed(()=>tabs.value.filter(tab=>!shownIds.value.includes(tab.id)));
function badge(id:string){const entry=controller.value.items.value.find(item=>item.id===id);return entry?.badgeVisible&&entry.badge!==''?entry.badge:undefined;}
function apply(ids:string[]){
 if(ids.length===shownIds.value.length&&ids.every((id, index)=>id===shownIds.value[index]))return;
 const focused=document.activeElement,owned=!!focused&&!!root.value?.contains(focused);
 shownIds.value=ids;
 void nextTick(()=>{if(owned&&focused&&!focused.isConnected)focusSelected();});
}
function measure(){
 if(!root.value||!measureRoot.value)return;
 const content=root.value.querySelector<HTMLElement>('[data-dock-content-region="panelViewBar"]');
 const width=content?.clientWidth??root.value.clientWidth,gap=parseFloat(getComputedStyle(measureRoot.value).gap)||3;
 const widths=new Map([...measureRoot.value.querySelectorAll<HTMLElement>('[data-measure-id]')].map(el=>[el.dataset.measureId!,el.getBoundingClientRect().width]));
 let trailing=0;for(const separator of measureRoot.value.querySelectorAll<HTMLElement>('[data-bar-separator-before]')){const id=separator.dataset.barSeparatorBefore!,size=separator.getBoundingClientRect().width+gap;if(id)widths.set(id,(widths.get(id)??0)+size);else trailing+=size;}
 const sum=trailing+tabs.value.reduce((total, tab)=>total+(widths.get(tab.id)??0)+gap,0)-gap;
 if(sum<=width){apply(tabs.value.map(tab=>tab.id));return;}
 let remaining=Math.max(0,width-29-gap-trailing);const chosen:string[]=[];
 const active=tabs.value.find(tab=>tab.id===props.activeId);
 if(active&&(widths.get(active.id)??Infinity)<=remaining){chosen.push(active.id);remaining-=(widths.get(active.id)??0)+gap;}
 for(const tab of tabs.value){if(tab.id===active?.id)continue;const size=(widths.get(tab.id)??Infinity)+gap;if(size<=remaining){chosen.push(tab.id);remaining-=size;}}
 apply(chosen);
}
watch(()=>[tabs.value.map(tab=>[tab.id,tab.label,tab.icon,badge(tab.id)]),controller.value.separators.value,props.activeId,display.value,compact.value],()=>void nextTick(measure),{deep:true,flush:'post'});
onMounted(()=>{observer=new ResizeObserver(measure);if(root.value){observer.observe(root.value);const content=root.value.querySelector<HTMLElement>('[data-dock-content-region="panelViewBar"]');if(content)observer.observe(content);}if(measureRoot.value)observer.observe(measureRoot.value);measure();document.fonts?.ready.then(measure);});
onBeforeUnmount(()=>observer?.disconnect());
const overflowItems=computed<FrameMenuItem[]>(()=>hidden.value.map(tab=>({id:tab.id,label:tab.label,checked:tab.id===props.activeId})));
function openContext(event:MouseEvent|KeyboardEvent, id=''){event.preventDefault();event.stopPropagation();overflowAnchor.value=undefined;target.value=id;contextAnchor.value=event.currentTarget as HTMLElement;const rect=contextAnchor.value.getBoundingClientRect();point.value={x:'clientX'in event&&event.clientX?event.clientX:rect.left,y:'clientY'in event&&event.clientY?event.clientY:rect.bottom};}
function contextKey(event:KeyboardEvent, id?:string){if(event.key==='ContextMenu'||event.shiftKey&&event.key==='F10')openContext(event,id);}
const contextMenuCommands=new ContextMenuCommands(frame,'frame.context.panelViewBar.'+useId(),()=>props.secondary?'secondaryViewBar':'panelViewBar',runContext);
onBeforeUnmount(contextMenuCommands.dispose);
const contextItems=computed<FrameMenuItem[]>(()=>{
 const focused=controller.value.items.value.find(item=>item.id===target.value),separator=controller.value.separators.value.find(item=>item.id===target.value);
 const ids=controller.value.items.value.map(item=>item.id),at=separator?(separator.before===undefined?ids.length:ids.indexOf(separator.before)):ids.indexOf(target.value),movable=!!separator&&controller.value.canMoveSeparators.value||!!focused&&frame.canMoveView(focused.id,props.secondary?'secondary':'bottom');
 const items:FrameMenuItem[]=barContextActions({allowAddSeparator:controller.value.allowAddSeparator.value,target:separator||focused?{label:focused?.label??'Separator',separator:!!separator,allowRemove:separator?.allowRemove,badgeVisible:focused?.badgeVisible,earlier:movable&&at>0,later:movable&&at>=0&&at<(separator?ids.length:ids.length-1)}:undefined});
 if(focused){
  if(!props.secondary)items.push({id:'keybinding',label:'Configure Keybinding',disabled:true});
  items.push({id:'move',label:'Move To',children:[
   {id:'move-primary',label:'Primary Sidebar',disabled:!frame.canMoveView(focused.id,'primary')},
   props.secondary?{id:'move-panel',label:'Panel',disabled:!frame.canMoveView(focused.id,'bottom')}:{id:'move-secondary',label:'Secondary Sidebar',disabled:!frame.canMoveView(focused.id,'secondary')},
  ]},{id:'views-divider',type:'separator'});
 }
 items.push(...controller.value.items.value.map(item=>({id:'view:'+item.id,label:item.label,checked:item.visible})),{id:'settings-divider',type:'separator'});
 if(props.secondary){items.push(
  {id:'size',label:'View Bar Size',children:[{id:'size:default',label:'Default',checked:!compact.value},{id:'size:compact',label:'Compact',checked:compact.value}]},
  {id:'display',label:'View Bar Display',children:[{id:'display:icons',label:'Icons Only',checked:display.value==='icons'},{id:'display:text',label:'Text Only',checked:display.value==='text'},{id:'display:both',label:'Icons and Text',checked:display.value==='both'}]},
  {id:'side',label:`Move Secondary Sidebar ${frame.layout.primarySide==='left'?'Left':'Right'}`});
 }else{items.push(
  {id:'position',label:'Panel Position',children:([['top','Top'],['left','Left'],['right','Right'],['bottom','Bottom']] as const).map((
    [id,label]
  )=>({id:'position:'+id,label,checked:frame.panel.position.value===id}))},
  {id:'alignment',label:'Align Panel',disabled:!frame.panel.canAlign.value,children:([['center','Center'],['justify','Justify'],['left','Left'],['right','Right']] as const).map((
    [id,label]
  )=>({id:'align:'+id,label,checked:frame.panel.alignment.value===id,disabled:!frame.panel.canAlign.value}))},
  {id:'size',label:'View Bar Size',children:[{id:'size:default',label:'Default',checked:!compact.value},{id:'size:compact',label:'Compact',checked:compact.value}]},
  {id:'display',label:'View Bar Display',children:[{id:'display:icons',label:'Icons Only',checked:display.value==='icons'},{id:'display:text',label:'Text Only',checked:display.value==='text'},{id:'display:both',label:'Icons and Text',checked:display.value==='both'}]},
  {id:'hide-panel',label:'Hide Panel',shortcut:'Ctrl+J'});
 }
 return contextMenuCommands.bind(items);
});
async function chooseContext(item:FrameMenuItem){if(item.type!=='separator'&&item.command)await frame.commands.execute(item.command);}
async function runContext(item:FrameMenuItem){
 if(item.type==='separator'||item.disabled)return;
 const separator=controller.value.separators.value.find(entry=>entry.id===target.value),ids=controller.value.items.value.map(entry=>entry.id),at=separator?(separator.before===undefined?ids.length:ids.indexOf(separator.before)):ids.indexOf(target.value);
 if(item.id==='add-separator')controller.value.addSeparator(separator?.before??(tabs.value.some(tab=>tab.id===target.value)?target.value:undefined));
 else if(item.id==='delete-separator')controller.value.removeSeparator(target.value);
 else if(item.id==='earlier'||item.id==='later'){if(separator)controller.value.moveSeparator(separator.id,ids[at+(item.id==='earlier'?-1:1)]);else frame.moveView(target.value,props.secondary?'secondary':'bottom',ids[at+(item.id==='earlier'?-1:2)]);}
 else if(item.id==='hide')controller.value.setVisible(target.value,false);
 else if(item.id==='badge')controller.value.setBadgeVisible(target.value,!controller.value.isBadgeVisible(target.value));
 else if(item.id==='move-primary')frame.moveView(target.value,'primary');
 else if(item.id==='move-panel')frame.moveView(target.value,'bottom');
 else if(item.id==='move-secondary')frame.moveView(target.value,'secondary');
 else if(item.id.startsWith('view:')){const id=item.id.slice(5);controller.value.setVisible(id,!controller.value.isVisible(id));}
 else if(item.id.startsWith('size:'))controller.value.setSize(item.id.slice(5) as 'default'|'compact');
 else if(item.id.startsWith('display:'))controller.value.setDisplay(item.id.slice(8) as 'icons'|'text'|'both');
 else if(item.id.startsWith('position:'))frame.panel.setPosition(item.id.slice(9) as 'top'|'bottom'|'left'|'right');
 else if(item.id.startsWith('align:'))frame.panel.setAlignment(item.id.slice(6) as 'left'|'right'|'center'|'justify');
 else if(item.id==='hide-panel')frame.closeBottomPanel();
 else if(item.id==='side')frame.secondaryViewBar.moveSide(frame.layout.primarySide==='left'?'left':'right');
 await nextTick();if(!contextAnchor.value?.isConnected)focusSelected();
}
function focusSelected(){const selected=root.value?.querySelector<HTMLButtonElement>('[role=tab][aria-selected=true]');(selected??root.value?.querySelector<HTMLButtonElement>('[aria-label="More Views"]')??root.value)?.focus();}
async function key(event:KeyboardEvent){
 contextKey(event);if(event.defaultPrevented||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const list=tabs.value;if(!list.length)return;const current=list.findIndex(tab=>tab.id===props.activeId),direction=getComputedStyle(root.value!).direction==='rtl'?-1:1;
 const index=event.key==='Home'?0:event.key==='End'?list.length-1:(current+(event.key==='ArrowRight'?1:-1)*direction+list.length)%list.length;
 emit('select',list[index]!.id);await nextTick();measure();await nextTick();focusSelected();
}
defineExpose({openContext});
</script>
<template><div ref="root" class="panel-view-bar" :class="{'view-bar-compact':compact,'view-bar-icons':display==='icons','view-bar-text':display==='text'}" tabindex="-1" @contextmenu="openContext($event)" @keydown.self="contextKey($event)">
<DockRegion :region="'panelViewBar'" mode="inside" class="frame-dock-anchor-content">
 <div role="tablist" :aria-label="secondary?'Secondary views':'Panel tabs'" class="panel-tabs bar-drop-list" data-bar-axis="x" data-view-axis="x" @keydown="key">
  <template v-for="(tab,index) in visible" :key="tab.id"><ViewBarSeparators :items="controller.separators.value" :before="tab.id" :move="controller.moveSeparator" :can-move="controller.canMoveSeparators.value" @context="openContext"/><span class="bar-drop-gap" :class="{'bar-drop-edge':index===0}" :data-bar-drop-before="tab.id" aria-hidden="true"/><button :id="`${uid}-tab-${tab.id}`" role="tab" :style="{ color: tab.titleColor }" :aria-label="tab.label" :title="display==='icons'?tab.label:undefined" :aria-selected="activeId===tab.id" :aria-controls="managed?contentId:`${uid}-content-${tab.id}`" :tabindex="activeId===tab.id?0:-1" :data-view-id="tab.id" :draggable="false" @keydown="contextKey($event,tab.id);if(!$event.defaultPrevented)frame.viewKey($event,tab.id,secondary?'secondary':'bottom')" @pointerdown="frame.beginViewDrag($event,tab.id,secondary?'secondary':'bottom')" @dragover.prevent @drop.stop="frame.dropView($event,secondary?'secondary':'bottom',tab.id)" @contextmenu="openContext($event,tab.id)" @click="emit('select',tab.id)">
   <BarItemContent :label="tab.label" :icon="tab.icon" :badge="badge(tab.id)" :display="display"/>
  </button></template>
  <ViewBarSeparators :items="controller.separators.value" :move="controller.moveSeparator" :can-move="controller.canMoveSeparators.value" @context="openContext"/>
  <span class="bar-drop-gap bar-drop-edge" data-bar-drop-before="" aria-hidden="true"/>
 </div>
 <FrameIconButton v-if="hidden.length" label="More Views" icon="ellipsis" aria-haspopup="menu" :aria-expanded="!!overflowAnchor" @contextmenu="openContext($event)" @click="contextAnchor=undefined;overflowAnchor=overflowAnchor?undefined:$event.currentTarget as HTMLElement"/>
 <div ref="measureRoot" class="panel-tabs view-bar-measure" aria-hidden="true" inert><template v-for="tab in tabs" :key="tab.id"><ViewBarSeparators :items="controller.separators.value" :before="tab.id" :move="controller.moveSeparator" :can-move="controller.canMoveSeparators.value" measure/><button :data-measure-id="tab.id" tabindex="-1"><BarItemContent :label="tab.label" :icon="tab.icon" :badge="badge(tab.id)" :display="display"/></button></template><ViewBarSeparators :items="controller.separators.value" :move="controller.moveSeparator" :can-move="controller.canMoveSeparators.value" measure/></div>
 <FrameDropdownMenu v-if="overflowAnchor&&hidden.length" :anchor="overflowAnchor" :items="overflowItems" label="More Views" @close="overflowAnchor=undefined" @select="emit('select',$event.id)"/>
 <FrameContextMenu v-if="contextAnchor" :anchor="contextAnchor" :point="point" :items="contextItems" :label="secondary?'Secondary View Bar':'Panel View Bar'" @close="contextAnchor=undefined" @select="chooseContext"/>
</DockRegion></div></template>
