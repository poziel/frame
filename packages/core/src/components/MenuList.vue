<script setup lang="ts">
import { computed, ref } from 'vue';
import { DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from 'reka-ui';
import type { FrameMenuItem } from '../types';
import FrameButton from './FrameButton.vue';
import MenuItemContent from './MenuItemContent.vue';
import OverlayScrollbars from './OverlayScrollbars.vue';
import { useOverlayBoundary } from '../frame/overlays';
const props = defineProps<{ items: readonly FrameMenuItem[]; owner: string; anchor: HTMLElement; itemAlignment: "left" | "center" | "right" }>();
const emit = defineEmits<{ select: [item: FrameMenuItem] }>();
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
    <DropdownMenuSeparator v-if="item.type === 'separator'" class="menu-separator" />
    <DropdownMenuSub v-else-if="item.children?.length">
      <div class="menu-row"><DropdownMenuSubTrigger as-child :disabled="item.disabled" :text-value="item.label"><FrameButton :disabled="item.disabled"><MenuItemContent :item="item" /></FrameButton></DropdownMenuSubTrigger></div>
      <DropdownMenuPortal :to="target"><DropdownMenuSubContent :ref="element => surfaceRef(item.id, element)" class="frame-menu" :data-item-alignment="itemAlignment" :data-frame-menu-owner="owner" :aria-label="item.label" :aria-labelledby="undefined" :collision-boundary="collisionBoundary" :collision-padding="6" :side-offset="2" loop :style="{ minWidth: Math.min(240,bounds.width - 12) + 'px', maxWidth: Math.max(0,bounds.width - 12) + 'px', maxHeight: 'min(' + Math.max(0,bounds.height - 12) + 'px, var(--reka-dropdown-menu-content-available-height))' }">
        <MenuList :items="item.children" :item-alignment="itemAlignment" :owner="owner" :anchor="anchor" @select="emit('select', $event)" />
      </DropdownMenuSubContent><OverlayScrollbars v-if="surfaces[item.id]" :root="surfaces[item.id]" /></DropdownMenuPortal>
    </DropdownMenuSub>
    <div v-else class="menu-row"><component :is="item.checked === undefined ? DropdownMenuItem : DropdownMenuCheckboxItem" as-child :disabled="item.disabled" :text-value="item.label" :model-value="item.checked" @select="emit('select', item)"><FrameButton :disabled="item.disabled"><MenuItemContent :item="item" /></FrameButton></component></div>
  </template>
</template>
