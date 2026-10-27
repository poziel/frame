<script setup lang="ts">
import {computed,ref,useId} from 'vue';
import {MenubarMenu,MenubarTrigger,MenubarContent,MenubarPortal} from 'reka-ui';
import type {FrameMenuItem} from './generalMenu';
import MenuList from './MenuList.vue';
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';
import {useOverlayBoundary} from '../overlays/overlays';
defineOptions({inheritAttrs:false});
const props=defineProps<{value:string;label:string;items:readonly FrameMenuItem[];disabled?:boolean;action?:FrameMenuItem;menuLabel?:string;itemAlignment?:'left'|'center'|'right'}>();
const emit=defineEmits<{select:[item:FrameMenuItem];dismiss:[]}>();
const trigger=ref<{$el:HTMLElement}>(),content=ref<{$el:HTMLElement}>();
const anchor=computed(()=>trigger.value?.$el);
const surface=computed(()=>{const element=content.value?.$el;return element instanceof HTMLElement ? element.querySelector<HTMLElement>('[data-reka-menu-content]') ?? element : undefined;});
const {target,bounds}=useOverlayBoundary(()=>anchor.value);
const boundary=computed(()=>typeof target.value==='string'?undefined:target.value);
const owner=useId();
function restoreTrigger(){requestAnimationFrame(()=>{if(!surface.value?.isConnected)anchor.value?.focus({preventScroll:true});});}
function dismiss(){emit('dismiss');restoreTrigger();}
function directAction(event:Event){if(!props.action)return;event.preventDefault();emit('select',props.action);}
function directKey(event:KeyboardEvent){if(props.action&&['Enter',' '].includes(event.key))directAction(event);}

</script>
<template><MenubarMenu :value="value"><MenubarTrigger :id="owner+'-trigger'" ref="trigger" v-bind="$attrs" :disabled="disabled" @pointerdown="directAction" @keydown="directKey">{{label}}</MenubarTrigger><MenubarPortal :to="target"><MenubarContent ref="content" class="frame-menu" @pointermove="($event.currentTarget as HTMLElement).dataset.menuInput='pointer'" @keydown.capture="($event.currentTarget as HTMLElement).dataset.menuInput='keyboard'" @escape-key-down="restoreTrigger" :aria-label="menuLabel ?? label" :aria-labelledby="undefined" :data-frame-menu-owner="owner" :data-item-alignment="itemAlignment ?? 'left'" :collision-boundary="boundary" :collision-padding="6" :side-offset="4" :style="{minWidth:Math.min(240,bounds.width-12)+'px',maxWidth:Math.max(0,bounds.width-12)+'px',maxHeight:'min('+Math.max(0,bounds.height-12)+'px, var(--reka-popper-available-height))'}" loop><slot><MenuList v-if="anchor" kind="menubar" :items="items" :owner="owner" :anchor="anchor" :item-alignment="itemAlignment ?? 'left'" @select="emit('select',$event)" @dismiss="dismiss"/></slot></MenubarContent><OverlayScrollbars v-if="surface" :root="surface"/></MenubarPortal></MenubarMenu></template>
