<script setup lang="ts">
import { computed, ref } from 'vue';
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverArrow, PopoverClose, useForwardPropsEmits, useEmitAsProps, type PopoverRootProps, type PopoverRootEmits, type PopoverContentProps, type PopoverContentEmits } from 'reka-ui';
import { useOverlayBoundary } from './overlays';
import '../shared/general-c.css';
defineOptions({inheritAttrs:false});
interface Props extends PopoverRootProps { triggerLabel?: string; contentProps?: PopoverContentProps }
const props = defineProps<Props>();
const emit = defineEmits<PopoverRootEmits & PopoverContentEmits>();
const contentEvents = useEmitAsProps(emit);
const rootProps=computed(() => {const {triggerLabel,contentProps,...root}=props;return root;});
const forwarded=useForwardPropsEmits(rootProps,emit);
const rootBindings = computed(() => Object.fromEntries(Object.entries(forwarded.value).filter((
  [key]
) => !key.startsWith('on') || key.startsWith('onUpdate:'))));
const anchor=ref<HTMLElement>();
const {target,bounds}=useOverlayBoundary(()=>anchor.value);
const collisionBoundary=computed(()=>typeof target.value==='string'?undefined:target.value);
</script>
<template><PopoverRoot v-bind="rootBindings"><span ref="anchor" class="frame-general-anchor"><PopoverTrigger as-child><slot name="trigger"><button class="frame-general-button" type="button">{{triggerLabel ?? 'More information'}}</button></slot></PopoverTrigger></span><PopoverPortal :to="target"><PopoverContent v-bind="{...contentEvents,...contentProps,...$attrs}" class="frame-general-popup frame-advanced-popup" :collision-boundary="collisionBoundary" :collision-padding="8" :side-offset="6" :style="{maxWidth:Math.max(0,bounds.width-16)+'px',maxHeight:Math.max(0,bounds.height-16)+'px'}"><slot /><PopoverClose class="frame-general-button"><slot name="close">Close</slot></PopoverClose><PopoverArrow class="frame-general-arrow" /></PopoverContent></PopoverPortal></PopoverRoot></template>
