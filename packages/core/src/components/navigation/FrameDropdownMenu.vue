<script setup lang="ts" generic="T extends FrameGeneralMenuItem | FrameMenuItem">
import { inject } from 'vue';
import {frameKey} from '../../framework/useFrame';
import { computed, ref } from 'vue';
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, useForwardPropsEmits, useEmitAsProps, type DropdownMenuRootProps, type DropdownMenuRootEmits, type DropdownMenuContentProps, type DropdownMenuContentEmits } from 'reka-ui';
import {normalizeMenuItems, type FrameGeneralMenuItem} from './generalMenu';
import type {FrameMenuItem} from './generalMenu';
import MenuList from './MenuList.vue';
import MenuItemContent from './MenuItemContent.vue';
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';
import AnchoredMenu from './AnchoredMenu.vue';
import { useId } from 'vue';
import {useOverlayBoundary} from '../overlays/overlays';
import '../shared/general-c.css';
const commandFrame = inject(frameKey, undefined);
defineOptions({inheritAttrs:false});

const props=withDefaults(defineProps<DropdownMenuRootProps & {items: readonly T[]; label?:string; itemAlignment?: "left" | "center" | "right"; anchor?:HTMLElement; point?:{x:number;y:number}; placement?:"bottom"|"right"; id?:string; triggerLabel?: string; contentProps?: DropdownMenuContentProps}>(),{open:undefined,modal:false});
const emit=defineEmits<DropdownMenuRootEmits & DropdownMenuContentEmits & {close:[];select:[item:T,event?:Event]}>();
const contentEvents=useEmitAsProps(emit);
const rootProps=computed(()=>{const {items,label,itemAlignment,anchor,point,placement,id,triggerLabel,contentProps,...root}=props;return root;});
const forwarded=useForwardPropsEmits(rootProps,emit);
const localOpen=ref(props.defaultOpen ?? false);
const menuOpen=computed({get:()=>props.open ?? localOpen.value,set:(
  value:boolean
)=>{localOpen.value=value;emit("update:open",value);}});
const rootBindings = computed(() => Object.fromEntries(Object.entries(forwarded.value).filter((
  [key]
) => !key.startsWith('on') || key.startsWith('onUpdate:'))));
const triggerAnchor=ref<HTMLElement>();
const owner=useId();
const normalized=computed(()=>commandFrame ? commandFrame.resolveMenuItems(normalizeMenuItems(props.items)) : normalizeMenuItems(props.items));
const content=ref<{ $el:HTMLElement }>();
const surface=computed(()=>{const element=content.value?.$el;return element instanceof HTMLElement ? element.querySelector<HTMLElement>('[data-reka-menu-content]') ?? element : undefined;});
function selected(item:FrameMenuItem, event?:Event){emit("select",(props.items.find(original=>original.id===item.id) ?? item) as T,event);}
const {target,bounds}=useOverlayBoundary(()=>triggerAnchor.value);
const collisionBoundary=computed(()=>typeof target.value==='string'?undefined:target.value);
</script>
<template><AnchoredMenu v-if="anchor" :anchor="anchor" :point="point" :placement="placement" :items="normalized" :label="label" :id="id" :item-alignment="itemAlignment" @close="emit('close')" @select="selected"><template v-if="$slots['item-actions']" #item-actions="scope"><slot name="item-actions" v-bind="scope"/></template></AnchoredMenu><DropdownMenuRoot v-else v-bind="rootBindings" v-model:open="menuOpen" :modal="modal ?? false"><span ref="triggerAnchor" class="frame-general-anchor"><DropdownMenuTrigger as-child><slot name="trigger"><button type="button" class="frame-general-button">{{triggerLabel ?? 'Actions'}}</button></slot></DropdownMenuTrigger></span><DropdownMenuPortal :to="target"><DropdownMenuContent v-bind="{...contentEvents,...contentProps,...$attrs}" ref="content" class="frame-menu" @pointermove="($event.currentTarget as HTMLElement).dataset.menuInput='pointer'" @keydown.capture="($event.currentTarget as HTMLElement).dataset.menuInput='keyboard'" :aria-label="label" :aria-labelledby="undefined" :data-item-alignment="itemAlignment ?? 'left'" :data-frame-menu-owner="owner" :collision-boundary="collisionBoundary" :collision-padding="8" :style="{maxHeight:Math.max(0,bounds.height-16)+'px',maxWidth:Math.max(0,bounds.width-16)+'px'}"><slot name="before" /><MenuList :items="normalized" kind="dropdown" :owner="owner" :anchor="triggerAnchor!" :item-alignment="itemAlignment ?? 'left'" @select="selected" @dismiss="menuOpen=false"><template v-if="$slots.item" #item="scope"><slot name="item" :item="scope.item"><MenuItemContent :item="scope.item"/></slot></template><template v-if="$slots['item-actions']" #item-actions="scope"><slot name="item-actions" v-bind="scope"/></template></MenuList><slot /></DropdownMenuContent><OverlayScrollbars v-if="surface" :root="surface"/></DropdownMenuPortal></DropdownMenuRoot></template>
