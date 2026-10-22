<script setup lang="ts">
import {computed,ref} from 'vue';
import {MenubarRoot,useForwardProps} from 'reka-ui';
import type {MenubarRootProps} from 'reka-ui';
import type {FrameMenubarItem,FrameMenubarAction} from '../general-types';
import type {FrameMenuItem} from '../types';
import {normalizeMenuItems} from './generalMenu';
import MenubarEntry from './MenubarEntry.vue';
import '../general-b.css';
const props=withDefaults(defineProps<MenubarRootProps & {items?:FrameMenubarItem[];menus?:readonly FrameMenuItem[];label?:string;maxVisible?:number;popupLabel?:string}>(),{maxVisible:Infinity});
const emit=defineEmits<{'update:modelValue':[value:string];action:[item:FrameMenubarAction];execute:[id:string]}>();
const root=computed(()=>{const {items,menus,label,maxVisible,popupLabel,...rest}=props;return rest;});
const localValue=ref(props.defaultValue ?? '');
const openValue=computed({get:()=>props.modelValue ?? localValue.value,set:(value:string)=>{localValue.value=value;emit('update:modelValue',value);}});
const forwarded=useForwardProps(root);
const groups=computed(()=>props.menus?.filter(item=>item.type!=='separator').map(item=>({value:item.id,label:item.label,disabled:item.disabled,action:!item.children?.length && item.command ? item : undefined,items:item.children ?? []})) ?? (props.items??[]).map(item=>({...item,action:undefined,items:normalizeMenuItems(item.items)})));
function select(item:FrameMenuItem){if(item.type==='separator')return;if(item.command)emit('execute',item.command);emit('action',item);}
</script>
<template><MenubarRoot v-bind="forwarded" :loop="loop ?? true" v-model="openValue" class="frame-menubar" :aria-label="label"><slot><div class="menubar-groups"><MenubarEntry v-for="menu in groups.slice(0,maxVisible)" :key="menu.value" :value="menu.value" :label="menu.label" :disabled="menu.disabled" :action="menu.action" :items="menu.items" :menu-label="popupLabel ?? menu.label" @select="select" @dismiss="openValue=''"><template v-if="$slots.content" #default><slot name="content" :menu="menu"/></template></MenubarEntry></div><MenubarEntry v-if="menus" value="frame-overflow" label="···" aria-label="All application menus" class="menubar-overflow" :class="{needed:groups.length>maxVisible}" :items="menus" menu-label="Application menu" @select="select" @dismiss="openValue=''"/></slot></MenubarRoot></template>
