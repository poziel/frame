<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFrame } from '../frame/createFrame';
import FrameIconButton from './FrameIconButton.vue';
import FrameDropdownMenu from './FrameDropdownMenu.vue';
import type { FrameMenuItem } from '../types';
const props=defineProps<{viewId:string}>();
const frame=useFrame();
const anchor=ref<HTMLElement>();
const items=computed<FrameMenuItem[]>(()=>{
 const children=frame.getViewChildren(props.viewId);
 return children.length?children.map(view=>({id:view.id,label:view.label,checked:frame.isViewVisible(view.id)})):[{id:'empty',label:'No sub-views',disabled:true}];
});
watch(()=>props.viewId,()=>anchor.value=undefined);
function toggle(item:FrameMenuItem){if(item.type!=='separator'&&frame.getViewParent(item.id)===props.viewId)frame.setViewVisible(item.id,!frame.isViewVisible(item.id));}
</script>
<template><FrameIconButton label="Views and more" icon="ellipsis" :aria-expanded="!!anchor" aria-haspopup="menu" @click="anchor=anchor?undefined:$event.currentTarget as HTMLElement"/><FrameDropdownMenu v-if="anchor" :anchor="anchor" :items="items" label="Sub-views" @select="toggle" @close="anchor=undefined"/></template>
