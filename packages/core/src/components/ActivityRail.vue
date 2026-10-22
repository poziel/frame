<script setup lang="ts">
import FrameContextMenu from "./FrameContextMenu.vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { Component } from 'vue';
import ManageButton from './ManageButton.vue';
import FrameDropdownMenu from './FrameDropdownMenu.vue';
import FrameIcon from './FrameIcon.vue';
import FrameIconButton from './FrameIconButton.vue';
import { useFrame } from '../frame/createFrame';
import type { ActivityBarPosition, ActivityBarSize, ActivityBarDisplay, ActivityItemKey } from '../frame/activity';
import type { FrameMenuItem, SidePanelDefinition, ViewRegion } from '../types';
import '../activity-bars.css';
const frame=useFrame();
const props=withDefaults(defineProps<{panels:readonly SidePanelDefinition[];activeId:string;expanded:boolean;region?:'primary'|'secondary'}>(),{region:'primary'});
const emit=defineEmits<{select:[id:string];resize:[size:{width:number;height:number}]}>();
const secondary=computed(()=>props.region==='secondary');
const controller=computed(()=>secondary.value?frame.secondaryBar:frame.activity);
const position=computed(()=>controller.value.position.value);
const horizontal=computed(()=>{const configured=secondary.value?frame.layout.secondaryActivityBarPosition:frame.layout.activityBarPosition;return configured==='top'||configured==='bottom';});
const display=computed<ActivityBarDisplay>(()=>controller.value.effectiveDisplay.value);
const compact=computed(()=>controller.value.size.value==='compact');
const label=computed(()=>secondary.value?'Secondary activity bar':'Primary activity bar');
const rail=ref<HTMLElement>(),itemsRoot=ref<HTMLElement>(),measureRoot=ref<HTMLElement>();
const anchor=shallowRef<HTMLElement>(),overflowAnchor=shallowRef<HTMLElement>();
let menuAnchor:HTMLElement|undefined;
const point=ref({x:0,y:0}),target=ref<ActivityItemKey>();
const buttons=new Map<string,HTMLButtonElement>();
const key=(item:ActivityItemKey)=>JSON.stringify([item.kind,item.id]);
interface Entry {key:ActivityItemKey;label:string;icon?:Component;disabled?:boolean;selected:boolean;run?:()=>void;badge?:string|number}
const registrations=computed(()=>secondary.value?frame.secondaryBar.items.value.map(item=>({kind:'view' as const,id:item.id,label:item.label,visible:item.visible,badgeVisible:item.badgeVisible,badge:item.badge})):frame.activity.items.value);
function visible(item:ActivityItemKey){return secondary.value?frame.secondaryBar.isVisible(item.id):frame.activity.isVisible(item);}
function setVisible(item:ActivityItemKey,value:boolean){return secondary.value?frame.secondaryBar.setVisible(item.id,value):frame.activity.setVisible(item,value);}
function setBadgeVisible(item:ActivityItemKey,value:boolean){return secondary.value?frame.secondaryBar.setBadgeVisible(item.id,value):frame.activity.setBadgeVisible(item,value);}
function badge(item:ActivityItemKey){const entry=registrations.value.find(entry=>key(entry)===key(item));return entry?.badgeVisible&&entry.badge!==''?entry?.badge:undefined;}
const entries=computed<Entry[]>(()=>[
 ...(secondary.value?[]:frame.activityActions.filter(action=>visible({kind:'action',id:action.id})).map(action=>({key:{kind:'action' as const,id:action.id},label:action.label,icon:action.icon,disabled:action.disabled,selected:typeof action.active==='function'?action.active():!!action.active,run:action.run,badge:badge({kind:'action',id:action.id})}))),
 ...props.panels.filter(panel=>visible({kind:'view',id:panel.id})).map(panel=>({key:{kind:'view' as const,id:panel.id},label:panel.label,icon:panel.icon,selected:props.expanded&&props.activeId===panel.id,badge:badge({kind:'view',id:panel.id})})),
]);
const shownKeys=ref<string[]>([]);
const shown=computed(()=>horizontal.value?entries.value.filter(entry=>shownKeys.value.includes(key(entry.key))):entries.value);
const hidden=computed(()=>horizontal.value?entries.value.filter(entry=>!shownKeys.value.includes(key(entry.key))):[]);
let observer:ResizeObserver|undefined,alive=true;
function buttonRef(item:ActivityItemKey,component:unknown){const element=(component as {element?:HTMLButtonElement}|null)?.element;if(element instanceof HTMLButtonElement)buttons.set(key(item),element);else buttons.delete(key(item));}
function focusSelected(){const selected=entries.value.find(entry=>entry.selected);(selected&&buttons.get(key(selected.key))||itemsRoot.value?.querySelector<HTMLButtonElement>('[aria-label="More Views"]')||buttons.values().next().value||rail.value)?.focus();}
function measure(){
 if(!alive||!horizontal.value||!itemsRoot.value||!measureRoot.value)return;
 const width=itemsRoot.value.clientWidth,gap=parseFloat(getComputedStyle(measureRoot.value).gap)||0;
 const widths=new Map([...measureRoot.value.querySelectorAll<HTMLElement>('[data-measure-key]')].map(element=>[element.dataset.measureKey!,element.getBoundingClientRect().width]));
 const total=entries.value.reduce((sum,entry)=>sum+(widths.get(key(entry.key))??0)+gap,0)-gap;
 let next:string[]=[];
 if(total<=width)next=entries.value.map(entry=>key(entry.key));
 else{
  const configuredInset=parseFloat(getComputedStyle(itemsRoot.value).getPropertyValue('--frame-activity-overflow-padding'));
  const overflowInset=Number.isFinite(configuredInset)?Math.max(0,configuredInset):8;
  let remaining=Math.max(0,width-26-overflowInset-gap);
  const active=entries.value.find(entry=>entry.key.kind==='view'&&entry.key.id===props.activeId);
  if(active&&(widths.get(key(active.key))??Infinity)<=remaining){next.push(key(active.key));remaining-=(widths.get(key(active.key))??0)+gap;}
  for(const entry of entries.value){const id=key(entry.key);if(next.includes(id))continue;const size=(widths.get(id)??Infinity)+gap;if(size<=remaining){next.push(id);remaining-=size;}}
 }
 if(next.length===shownKeys.value.length&&next.every((id,index)=>id===shownKeys.value[index]))return;
 const focused=document.activeElement,owned=!!focused&&!!itemsRoot.value.contains(focused);
 shownKeys.value=next;
 void nextTick(()=>{if(owned&&focused&&!focused.isConnected)focusSelected();});
}
watch(()=>[entries.value,props.activeId,horizontal.value,display.value,compact.value],()=>void nextTick(measure),{deep:true,flush:'post'});
onMounted(()=>{observer=new ResizeObserver(()=>{measure();if(rail.value){const box=rail.value.getBoundingClientRect();if(box.width&&box.height)emit('resize',{width:box.width,height:box.height});}});if(rail.value)observer.observe(rail.value);if(itemsRoot.value)observer.observe(itemsRoot.value);if(measureRoot.value)observer.observe(measureRoot.value);measure();document.fonts?.ready.then(measure);});
onBeforeUnmount(()=>{alive=false;observer?.disconnect();});
function activate(entry:Entry){if(entry.disabled)return;if(entry.key.kind==='action')entry.run?.();else emit('select',entry.key.id);}
async function navigationKey(event:KeyboardEvent,entry:Entry){
 contextKey(event,entry.key);if(event.defaultPrevented)return;
 if(entry.key.kind==='view')frame.viewKey(event,entry.key.id,props.region);
 if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
 const previous=horizontal.value?'ArrowLeft':'ArrowUp',next=horizontal.value?'ArrowRight':'ArrowDown';
 if(![previous,next,'Home','End'].includes(event.key))return;
 event.preventDefault();event.stopPropagation();
 const list=entries.value.filter(item=>!item.disabled);if(!list.length)return;
 const current=list.findIndex(item=>key(item.key)===key(entry.key));
 const direction=horizontal.value&&getComputedStyle(rail.value!).direction==='rtl'?-1:1;
 const index=event.key==='Home'?0:event.key==='End'?list.length-1:(current+(event.key===next?1:-1)*direction+list.length)%list.length;
 const item=list[index]!;if(item.key.kind==='view'&&horizontal.value)emit('select',item.key.id);
 await nextTick();measure();await nextTick();(buttons.get(key(item.key))??itemsRoot.value?.querySelector<HTMLButtonElement>('[aria-label="More Views"]'))?.focus();
}
function openMenu(event:MouseEvent|KeyboardEvent,item?:ActivityItemKey){
 event.preventDefault();event.stopPropagation();overflowAnchor.value=undefined;
 anchor.value=event.currentTarget as HTMLElement;menuAnchor=anchor.value;target.value=item;
 const rect=anchor.value.getBoundingClientRect();point.value={x:'clientX'in event&&event.clientX?event.clientX:rect.left,y:'clientY'in event&&event.clientY?event.clientY:rect.bottom};
}
function contextKey(event:KeyboardEvent,item?:ActivityItemKey){if(event.key==='ContextMenu'||event.shiftKey&&event.key==='F10')openMenu(event,item);}
const menuActions=new Map<string,()=>void>();
const menuItems=computed<FrameMenuItem[]>(()=>{
 const items:FrameMenuItem[]=[];menuActions.clear();
 const focused=target.value&&registrations.value.find(item=>key(item)===key(target.value!));
 if(focused){
  items.push({id:'hide-target',label:`Hide '${focused.label}'`});menuActions.set('hide-target',()=>{setVisible(focused,false);});
  items.push({id:'badge-target',label:focused.badgeVisible?'Hide Badge':'Show Badge'});menuActions.set('badge-target',()=>{setBadgeVisible(focused,!focused.badgeVisible);});
  if(focused.kind==='view'){
   const destinations:{id:string;label:string;region:ViewRegion}[]=[{id:'move-panel',label:'Panel',region:'bottom'},secondary.value?{id:'move-primary',label:'Primary Sidebar',region:'primary'}:{id:'move-secondary',label:'Secondary Sidebar',region:'secondary'}];
   items.push({id:'move-target',label:'Move To',children:destinations.map(destination=>{menuActions.set(destination.id,()=>{frame.moveView(focused.id,destination.region);});return {id:destination.id,label:destination.label,disabled:!frame.canMoveView(focused.id,destination.region)};})});
  }
  items.push({id:'activity-separator',type:'separator'});
 }
 for(const item of registrations.value){const id=`toggle:${key(item)}`;items.push({id,label:item.label,checked:item.visible});menuActions.set(id,()=>{setVisible(item,!item.visible);});}
 items.push({id:'activity-layout-separator',type:'separator'});
 const positions:{id:ActivityBarPosition;label:string}[]=[{id:'default',label:'Default'},{id:'top',label:'Top'},{id:'bottom',label:'Bottom'},{id:'hidden',label:'Hidden'}];
 items.push({id:'activity-position',label:'Activity Bar Position',children:positions.map(option=>{const id=`position:${option.id}`;menuActions.set(id,()=>{controller.value.setPosition(option.id);});return {id,label:option.label,checked:position.value===option.id};})});
 const sizes:{id:ActivityBarSize;label:string}[]=[{id:'default',label:'Default'},{id:'compact',label:'Compact'}];
 items.push({id:'activity-size',label:'Activity Bar Size',children:sizes.map(option=>{const id=`size:${option.id}`;menuActions.set(id,()=>{controller.value.setSize(option.id);});return {id,label:option.label,checked:controller.value.size.value===option.id};})});
 const modes:{id:ActivityBarDisplay;label:string}[]=[{id:'icons',label:'Icons Only'},{id:'text',label:'Text Only'},{id:'both',label:'Icons and Text'}];
 items.push({id:'activity-display',label:'Activity Bar Display',children:modes.map(option=>{const id=`display:${option.id}`;menuActions.set(id,()=>{controller.value.setDisplay(option.id);});return {id,label:option.label,checked:display.value===option.id,disabled:!horizontal.value&&option.id!=='icons'};})});
 const side=secondary.value?(frame.layout.primarySide==='left'?'left':'right'):(frame.layout.primarySide==='left'?'right':'left');
 items.push({id:'move-side',label:`Move ${secondary.value?'Secondary':'Primary'} Side Bar ${side==='right'?'Right':'Left'}`});
 menuActions.set('move-side',()=>{if(secondary.value)frame.secondaryBar.moveSide(side);else frame.activity.movePrimarySide(side);});
 return items;
});
async function selectMenu(item:FrameMenuItem){menuActions.get(item.id)?.();await nextTick();if(!menuAnchor?.isConnected)focusSelected();}
const overflowItems=computed<FrameMenuItem[]>(()=>hidden.value.map(entry=>({id:key(entry.key),label:entry.label,checked:entry.selected,disabled:entry.disabled})));
async function selectOverflow(item:FrameMenuItem){const entry=entries.value.find(entry=>key(entry.key)===item.id);if(entry)activate(entry);await nextTick();measure();await nextTick();focusSelected();}
defineExpose({openContext:openMenu});
</script>
<template>
 <nav ref="rail" class="activity-rail" :class="{'activity-horizontal':horizontal,'activity-compact':compact,['activity-display-'+display]:true,'secondary-activity-rail':secondary}" :aria-label="label" tabindex="-1" :data-view-region="region" :data-view-axis="horizontal?'x':'y'" @dragover.prevent @drop="frame.dropView($event,region)" @contextmenu="openMenu($event)" @keydown.self="contextKey($event)">
  <slot/>
  <div ref="itemsRoot" class="activity-rail-items">
   <FrameIconButton v-for="entry in shown" :key="key(entry.key)" :label="entry.label" :ref="element=>buttonRef(entry.key,element)" class="rail-button" :class="{selected:entry.selected}" :aria-pressed="entry.selected" :aria-controls="entry.key.kind==='view'?(secondary?'secondary-panel':'side-panel'):undefined" :disabled="entry.disabled" :draggable="false" :data-view-id="entry.key.kind==='view'?entry.key.id:undefined" @keydown="navigationKey($event,entry)" @pointerdown="entry.key.kind==='view'&&frame.beginViewDrag($event,entry.key.id,region)" @dragover.prevent @drop.stop="entry.key.kind==='view'&&frame.dropView($event,region,entry.key.id)" @contextmenu="openMenu($event,entry.key)" @click="activate(entry)">
    <span v-if="display!=='text'" class="activity-icon-slot"><component v-if="entry.icon" :is="entry.icon"/><FrameIcon v-else name="window" :size="20"/></span><span v-if="display!=='icons'" class="activity-label">{{entry.label}}</span><span v-if="entry.badge!==undefined" class="rail-badge" aria-hidden="true">{{entry.badge}}</span>
   </FrameIconButton>
   <span v-if="hidden.length" class="activity-overflow"><FrameIconButton label="More Views" icon="ellipsis" aria-haspopup="menu" :aria-expanded="!!overflowAnchor" @contextmenu="openMenu($event)" @click="anchor=undefined;overflowAnchor=overflowAnchor?undefined:$event.currentTarget as HTMLElement"/></span>
  </div>
  <ManageButton v-if="!secondary"/>
  <div ref="measureRoot" class="activity-rail-measure" aria-hidden="true" inert><FrameIconButton v-for="entry in entries" :key="key(entry.key)" :label="entry.label" :tooltip="false" class="rail-button" :data-measure-key="key(entry.key)" tabindex="-1"><span v-if="display!=='text'" class="activity-icon-slot"><component v-if="entry.icon" :is="entry.icon"/><FrameIcon v-else name="window" :size="20"/></span><span v-if="display!=='icons'" class="activity-label">{{entry.label}}</span><span v-if="entry.badge!==undefined" class="rail-badge">{{entry.badge}}</span></FrameIconButton></div>
  <FrameDropdownMenu v-if="overflowAnchor&&hidden.length" :anchor="overflowAnchor" :items="overflowItems" label="More Views" @close="overflowAnchor=undefined" @select="selectOverflow"/>
  <FrameContextMenu v-if="anchor&&menuItems.length" :anchor="anchor" :point="point" :items="menuItems" :label="label" @close="anchor=undefined" @select="selectMenu"/>
 </nav>
</template>
