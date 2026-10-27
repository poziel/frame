<script setup lang="ts">
import {computed,ref} from 'vue';
import type {Component} from 'vue';
import type {DropMarker} from '../../framework/views/viewDrag';
import {fitOverlay,intersectOverlayBounds,useOverlayBoundary} from '../overlays/overlays';
const props=defineProps<{active:boolean;x:number;y:number;label?:string;icon?:Component;marker?:DropMarker|null;anchor?:HTMLElement}>();
const preview=ref<HTMLElement>();
const {target,getBounds}=useOverlayBoundary(()=>props.anchor);
const previewStyle=computed(()=>{
 const bounds=getBounds(),size=preview.value?.getBoundingClientRect(),width=size?.width??200,height=size?.height??32;
 const left=props.x+width+14>bounds.left+bounds.width?props.x-width-14:props.x+14;
 const top=props.y+height+14>bounds.top+bounds.height?props.y-height-14:props.y+14;
 const fitted=fitOverlay({left,top,width,height},bounds);
 return {left:`${fitted.left}px`,top:`${fitted.top}px`,maxWidth:`${Math.max(0,bounds.width-12)}px`,maxHeight:`${Math.max(0,bounds.height-12)}px`};
});
const markerStyle=computed(()=>{if(!props.marker)return {};const rect=intersectOverlayBounds(props.marker,getBounds());return {left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`};});
</script>
<template><Teleport :to="target"><template v-if="active"><div v-if="label" ref="preview" class="view-drag-preview" :style="previewStyle" aria-hidden="true"><component v-if="icon" :is="icon"/><span v-else class="drag-view-icon">{{label.slice(0,1)}}</span><span>{{label}}</span></div><div v-if="marker" class="view-drop-marker" :class="marker.kind" :style="markerStyle" aria-hidden="true"/></template></Teleport></template>
