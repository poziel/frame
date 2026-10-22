<script setup lang="ts">
import type { PanelAction, FrameMenuItem } from "../types";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import FrameIconButton from "./FrameIconButton.vue";
import FrameMenu from './FrameMenu.vue';
import '../panel-action-overflow.css';
const props=defineProps<{actions?:readonly PanelAction[]; /** Optional header allocation in pixels. */ maxWidth?:number}>();
const root=ref<HTMLElement>(),measure=ref<HTMLElement>(),extra=ref<HTMLElement>();
const more=ref<{element?:HTMLButtonElement;focus:()=>void}>();
const anchor=shallowRef<HTMLElement>();
const shown=ref(Number.MAX_SAFE_INTEGER),budget=ref<number>();
const actions=computed(()=>props.actions??[]);
const visibleActions=computed(()=>actions.value.slice(0,shown.value));
const overflowActions=computed(()=>actions.value.slice(shown.value));
const menu=computed<FrameMenuItem[]>(()=>overflowActions.value.map(action=>({id:action.id,label:action.label,disabled:action.disabled,...('shortcut'in action?{shortcut:String(action.shortcut)}:{})})));
let observer:ResizeObserver|undefined,scheduled=false,disposed=false;
function schedule(){if(scheduled||disposed)return;scheduled=true;void nextTick(()=>{scheduled=false;layout();});}
function layout(){
 const element=root.value,parent=element?.parentElement;if(!element||!parent||!measure.value)return;
 const parentStyle=getComputedStyle(parent),style=getComputedStyle(element);
 const gap=parseFloat(style.columnGap)||0;
 const siblings=[...parent.children].filter(sibling=>sibling!==element&&sibling instanceof HTMLElement) as HTMLElement[];
 const flexContent=siblings.filter(sibling=>sibling.matches('.panel-tabs,.side-title,.section-title')||parseFloat(getComputedStyle(sibling).flexGrow)>0);
 const fixed=siblings.filter(sibling=>!flexContent.includes(sibling)).reduce((sum,sibling)=>sum+sibling.getBoundingClientRect().width,0);
 const parentGap=parseFloat(parentStyle.columnGap)||0;
 const available=props.maxWidth??Math.max(26,parent.clientWidth-(parseFloat(parentStyle.paddingLeft)||0)-(parseFloat(parentStyle.paddingRight)||0)-fixed-parentGap*siblings.length-(flexContent.length?Math.min(64,parent.clientWidth/3):0));
 budget.value=Math.max(26,available);
 const widths=[...measure.value.querySelectorAll<HTMLElement>('[data-action-measure]')].map(item=>item.getBoundingClientRect().width);
 const extras=extra.value?.getBoundingClientRect().width??0;
 const all=widths.reduce((sum,width)=>sum+width,0)+Math.max(0,widths.length-1)*gap+(extras&&widths.length?gap:0)+extras;
 let count=widths.length;
 if(all>budget.value){let used=26+(extras?extras+gap:0);count=0;for(const width of widths){if(used+gap+width>budget.value)break;used+=gap+width;count++;}}
 if(shown.value!==count){const focused=document.activeElement,owned=!!focused&&element.contains(focused);shown.value=count;void nextTick(()=>{if(owned&&focused&&!focused.isConnected)more.value?.focus();});}
 if(count===widths.length&&anchor.value){anchor.value=undefined;void nextTick(()=>{if(!document.activeElement||document.activeElement===document.body){[...element.querySelectorAll<HTMLButtonElement>('button')].find(button=>!button.disabled&&!button.closest('.panel-actions-measure'))?.focus();}});}
}
function open(event:MouseEvent){anchor.value=anchor.value?undefined:event.currentTarget as HTMLElement;}
function choose(item:FrameMenuItem){const action=overflowActions.value.find(action=>action.id===item.id);if(action&&!action.disabled)action.run();}
watch(()=>[props.actions,props.actions?.map(action=>[action.id,action.label,action.icon,action.disabled]),props.maxWidth],schedule,{deep:true,flush:'post'});
onMounted(()=>{observer=new ResizeObserver(schedule);if(root.value?.parentElement)observer.observe(root.value.parentElement);if(root.value)observer.observe(root.value);if(measure.value)observer.observe(measure.value);if(extra.value)observer.observe(extra.value);schedule();});
onBeforeUnmount(()=>{disposed=true;observer?.disconnect();});
</script>
<template><div ref="root" class="panel-actions panel-actions-responsive" :style="{maxWidth:budget===undefined?undefined:budget+'px'}">
 <FrameIconButton v-for="action in visibleActions" :key="action.id" :label="action.label" :icon="action.icon" :disabled="action.disabled" @click="action.run"><span v-if="!action.icon">{{action.label}}</span></FrameIconButton>
 <FrameIconButton v-if="overflowActions.length" ref="more" label="More View Actions" icon="ellipsis" aria-haspopup="menu" :aria-expanded="!!anchor" @click="open"/>
 <span ref="extra" class="panel-actions-extra"><slot/></span>
 <div ref="measure" class="panel-actions-measure" aria-hidden="true" inert><span v-for="action in actions" :key="action.id" data-action-measure><FrameIconButton :label="action.label" :icon="action.icon" :tooltip="false" disabled><span v-if="!action.icon">{{action.label}}</span></FrameIconButton></span></div>
 <FrameMenu v-if="anchor && menu.length" :anchor="anchor" :items="menu" label="View actions" @select="choose" @close="anchor=undefined"/>
</div></template>
