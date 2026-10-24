<script setup lang="ts">
import { computed, ref } from 'vue';
import {DropdownMenuItem,DropdownMenuCheckboxItem,DropdownMenuSeparator,DropdownMenuSub,DropdownMenuSubTrigger,DropdownMenuSubContent,DropdownMenuPortal,ContextMenuItem,ContextMenuCheckboxItem,ContextMenuSeparator,ContextMenuSub,ContextMenuSubTrigger,ContextMenuSubContent,ContextMenuPortal,MenubarItem,MenubarCheckboxItem,MenubarSeparator,MenubarSub,MenubarSubTrigger,MenubarSubContent,MenubarPortal} from 'reka-ui';
import type { FrameMenuItem } from '../types';
import FrameButton from './FrameButton.vue';
import MenuItemContent from './MenuItemContent.vue';
import OverlayScrollbars from './OverlayScrollbars.vue';
import { useOverlayBoundary } from '../frame/overlays';
const props = defineProps<{ items: readonly FrameMenuItem[]; owner: string; anchor: HTMLElement; itemAlignment: "left" | "center" | "right"; kind?: "dropdown" | "context" | "menubar" }>();
const families={'dropdown':{Item:DropdownMenuItem,CheckboxItem:DropdownMenuCheckboxItem,Separator:DropdownMenuSeparator,Sub:DropdownMenuSub,SubTrigger:DropdownMenuSubTrigger,SubContent:DropdownMenuSubContent,Portal:DropdownMenuPortal},'context':{Item:ContextMenuItem,CheckboxItem:ContextMenuCheckboxItem,Separator:ContextMenuSeparator,Sub:ContextMenuSub,SubTrigger:ContextMenuSubTrigger,SubContent:ContextMenuSubContent,Portal:ContextMenuPortal},'menubar':{Item:MenubarItem,CheckboxItem:MenubarCheckboxItem,Separator:MenubarSeparator,Sub:MenubarSub,SubTrigger:MenubarSubTrigger,SubContent:MenubarSubContent,Portal:MenubarPortal}};
const parts=computed(()=>families[props.kind??'dropdown']);
defineSlots<{item?:(props:{item:Exclude<FrameMenuItem,{type:'separator'}>})=>unknown; 'item-actions'?:(props:{item:Exclude<FrameMenuItem,{type:'separator'}>})=>unknown}>();
const emit = defineEmits<{ select: [item: FrameMenuItem,event:Event];dismiss:[] }>();
const { target, bounds } = useOverlayBoundary(() => props.anchor);
const collisionBoundary = computed(() => typeof target.value === 'string' ? undefined : target.value);
const surfaces = ref<Record<string, HTMLElement>>({});
function surfaceRef(id: string, element: unknown) {
  const value = element as { $el?: HTMLElement } | null;
  if (value?.$el instanceof HTMLElement) surfaces.value[id] = value.$el.querySelector<HTMLElement>("[data-reka-menu-content]") ?? value.$el;
  else delete surfaces.value[id];
}
</script>
<template>
  <template v-for="item in items" :key="item.id">
    <component :is="parts.Separator" v-if="item.type === 'separator'" class="menu-separator" />
    <component :is="parts.Sub" v-else-if="item.children?.length">
      <div class="menu-row"><component :is="parts.SubTrigger" as-child :disabled="item.disabled" :text-value="item.label"><FrameButton :disabled="item.disabled"><slot name="item" :item="item"><MenuItemContent :item="item" /></slot></FrameButton></component></div>
      <component :is="parts.Portal" :to="target"><component :is="parts.SubContent" @escape-key-down="emit('dismiss')" :ref="(element:unknown) => surfaceRef(item.id, element)" class="frame-menu" @pointermove="($event.currentTarget as HTMLElement).dataset.menuInput='pointer'" @keydown.capture="($event.currentTarget as HTMLElement).dataset.menuInput='keyboard'" :data-item-alignment="itemAlignment" :data-frame-menu-owner="owner" :aria-label="item.label" :aria-labelledby="undefined" :collision-boundary="collisionBoundary" :collision-padding="6" :side-offset="2" loop :style="{ minWidth: Math.min(240,bounds.width - 12) + 'px', maxWidth: Math.max(0,bounds.width - 12) + 'px', maxHeight: 'min(' + Math.max(0,bounds.height - 12) + 'px, var(--reka-popper-available-height))' }">
        <MenuList :kind="kind" :items="item.children" :item-alignment="itemAlignment" :owner="owner" :anchor="anchor" @select="(item:FrameMenuItem,event:Event)=>emit('select',item,event)" @dismiss="emit('dismiss')"><template v-if="$slots.item" #item="scope"><slot name="item" v-bind="scope" /></template><template v-if="$slots['item-actions']" #item-actions="scope"><slot name="item-actions" v-bind="scope"/></template></MenuList>
      </component><OverlayScrollbars v-if="surfaces[item.id]" :root="surfaces[item.id]" /></component>
    </component>
    <div v-else class="menu-row"><component :is="item.checked === undefined ? parts.Item : parts.CheckboxItem" as-child :disabled="item.disabled" :text-value="item.label" :model-value="item.checked" @select="(event:Event)=>emit('select', item,event)"><FrameButton :disabled="item.disabled"><slot name="item" :item="item"><MenuItemContent :item="item" /></slot></FrameButton></component><slot name="item-actions" :item="item"/></div>
  </template>
</template>
