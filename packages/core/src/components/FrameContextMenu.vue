<script setup lang="ts">
import { computed, ref } from 'vue';
import { ContextMenuRoot, ContextMenuTrigger, ContextMenuPortal, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, useForwardPropsEmits, useEmitAsProps, type ContextMenuRootProps, type ContextMenuRootEmits, type ContextMenuContentProps, type ContextMenuContentEmits } from 'reka-ui';
import type {FrameGeneralMenuItem} from './generalMenu';
import {useOverlayBoundary} from '../frame/overlays';
import '../general-c.css';
defineOptions({inheritAttrs:false});
interface Props extends ContextMenuRootProps {items: readonly FrameGeneralMenuItem[]; triggerLabel?: string; contentProps?: ContextMenuContentProps}
const props=defineProps<Props>();
const emit=defineEmits<ContextMenuRootEmits & ContextMenuContentEmits & {select:[item:FrameGeneralMenuItem,event:Event]}>();
const contentEvents=useEmitAsProps(emit);
const rootProps=computed(()=>{const {items,triggerLabel,contentProps,...root}=props;return root;});
const forwarded=useForwardPropsEmits(rootProps,emit);
const rootBindings = computed(() => Object.fromEntries(Object.entries(forwarded.value).filter(([key]) => !key.startsWith('on') || key.startsWith('onUpdate:'))));
const anchor=ref<HTMLElement>();
const {target,bounds}=useOverlayBoundary(()=>anchor.value);
const collisionBoundary=computed(()=>typeof target.value==='string'?undefined:target.value);
</script>
<template><ContextMenuRoot v-bind="rootBindings"><span ref="anchor" class="frame-general-anchor"><ContextMenuTrigger as-child><slot name="trigger"><button type="button" class="frame-general-button">{{triggerLabel ?? 'Right click for actions'}}</button></slot></ContextMenuTrigger></span><ContextMenuPortal :to="target"><ContextMenuContent v-bind="{...contentEvents,...contentProps,...$attrs}" class="frame-general-menu frame-advanced-popup" :collision-boundary="collisionBoundary" :collision-padding="8" :style="{maxHeight:Math.max(0,bounds.height-16)+'px',maxWidth:Math.max(0,bounds.width-16)+'px'}"><slot name="before" /><template v-for="item in items" :key="item.id"><ContextMenuSeparator v-if="item.separator" class="frame-general-separator"/><ContextMenuItem :disabled="item.disabled" :text-value="item.label" class="frame-general-menu-item" @select="emit('select',item,$event)"><slot name="item" :item="item"><span>{{item.label}}</span><kbd v-if="item.shortcut">{{item.shortcut}}</kbd></slot></ContextMenuItem></template><slot /></ContextMenuContent></ContextMenuPortal></ContextMenuRoot></template>
