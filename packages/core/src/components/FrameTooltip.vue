<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { TooltipProvider, TooltipRoot, TooltipPortal, TooltipContent, useForwardPropsEmits, type TooltipRootProps, type TooltipRootEmits } from 'reka-ui';
import TooltipAnchor from './TooltipAnchor.vue';
import { useOverlayBoundary } from '../frame/overlays';
interface Props extends TooltipRootProps { text:string; shortcut?:string; placement?:'top'|'bottom'|'left'|'right' }
defineOptions({inheritAttrs:false});
const props=withDefaults(defineProps<Props>(),{placement:'bottom',open:undefined,delayDuration:400,ignoreNonKeyboardFocus:true});
const emit=defineEmits<TooltipRootEmits>();
const id=useId(),visible=ref(props.open??props.defaultOpen??false),anchor=ref<HTMLElement>();
const {target,bounds}=useOverlayBoundary(()=>anchor.value);
const rootProps=computed(()=>{const {text,shortcut,placement,...root}=props;const disabled=props.disabled||!text;return {...root,open:disabled?false:(root.open??visible.value),disabled};});
const forwarded=useForwardPropsEmits(rootProps,emit);
const collisionBoundary=computed(()=>typeof target.value==='string'?undefined:target.value);
const limits=computed(()=>({position:'relative' as const,maxWidth:`min(${Math.max(0,bounds.value.width-16)}px, var(--reka-tooltip-content-available-width))`,maxHeight:`min(${Math.max(0,bounds.value.height-16)}px, var(--reka-tooltip-content-available-height))`,overflow:'hidden'}));
watch(()=>props.open,value=>{if(value!==undefined)visible.value=value;});
watch(()=>[props.disabled,props.text],()=>{if(props.disabled||!props.text)visible.value=false;});
</script>
<template>
 <TooltipProvider>
  <TooltipRoot v-bind="forwarded" :open="rootProps.open" :disabled="rootProps.disabled" @update:open="visible=$event">
   <span ref="anchor" v-bind="$attrs" class="tooltip-trigger">
    <TooltipAnchor :content-id="id"><slot :describedby="visible&&!disabled&&text?id:undefined"/></TooltipAnchor>
   </span>
   <TooltipPortal :to="target"><TooltipContent class="frame-tooltip" :aria-label="shortcut?text+' '+shortcut:text" :side="placement" :side-offset="6" :collision-boundary="collisionBoundary" :collision-padding="8" :style="limits"><span>{{text}}</span><kbd v-if="shortcut">{{shortcut}}</kbd></TooltipContent></TooltipPortal>
  </TooltipRoot>
 </TooltipProvider>
</template>
