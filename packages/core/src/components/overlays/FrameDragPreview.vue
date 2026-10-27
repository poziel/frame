<script setup lang="ts">
import {computed,ref} from 'vue';
import {useOverlayBoundary} from './overlays';
defineOptions({inheritAttrs:false});
const props=withDefaults(defineProps<{x:number;y:number;anchor?:HTMLElement;active?:boolean;offset?:number}>(),{active:true,offset:14});
const surface=ref<HTMLElement>();
const {target,bounds}=useOverlayBoundary(()=>props.anchor);
const style=computed(()=>{
 const area=bounds.value,width=surface.value?.offsetWidth??220,height=surface.value?.offsetHeight??60;
 return {left:`${Math.max(area.left,Math.min(props.x+props.offset,area.left+area.width-width))}px`,top:`${Math.max(area.top,Math.min(props.y+props.offset,area.top+area.height-height))}px`,maxWidth:`${area.width}px`,maxHeight:`${area.height}px`};
});
</script>
<template><Teleport v-if="active" :to="target"><div ref="surface" v-bind="$attrs" class="frame-drag-preview" :style="style" aria-hidden="true" inert><slot /></div></Teleport></template>
<style scoped>
.frame-drag-preview {position:fixed;z-index:10000;pointer-events:none;overflow:hidden;padding:8px 10px;border:1px solid var(--frame-drag-preview-border,var(--frame-reorder-preview-border,var(--frame-border-color)));border-radius:var(--frame-radius,4px);background:var(--frame-drag-preview-background,var(--frame-reorder-preview-background,var(--frame-bg,#181818)));color:var(--frame-text);box-shadow:var(--frame-drag-preview-shadow,var(--frame-reorder-preview-shadow,0 4px 12px #0005));font:inherit;}
</style>
