<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from "vue";
import { DropdownMenuRoot, DropdownMenuContent, DropdownMenuPortal } from "reka-ui";
import type { FrameMenuItem } from "../types";
import { useOverlayBoundary } from "../frame/overlays";
import MenuList from "./MenuList.vue";
import OverlayScrollbars from "./OverlayScrollbars.vue";
const props = withDefaults(defineProps<{ id?: string; anchor: HTMLElement; items: readonly FrameMenuItem[]; label?: string; placement?: "bottom" | "right"; point?: { x: number; y: number }; itemAlignment?: "left" | "center" | "right" }>(), { itemAlignment: "left" });
const emit = defineEmits<{ close: []; select: [item: FrameMenuItem] }>();
const owner = useId();
const { target, bounds } = useOverlayBoundary(() => props.anchor);
const content = ref<{ $el: HTMLElement }>();
const surface = computed(() => content.value?.$el?.querySelector<HTMLElement>("[data-reka-menu-content]") ?? content.value?.$el);
const reference = computed(() => props.point ? { getBoundingClientRect: () => new DOMRect(props.point!.x, props.point!.y, 0, 0), contextElement: props.anchor } : props.anchor);
const collisionBoundary = computed(() => typeof target.value === 'string' ? undefined : target.value);
let closed = false;
let restoreFocus = true;
function close() { if (!closed) { closed = true; emit("close"); } }
function select(item: FrameMenuItem) { close(); emit("select", item); }
function interactOutside(event: CustomEvent<{ originalEvent: Event }>) {
  if (props.anchor.contains(event.target as Node)) { event.preventDefault(); return; }
  restoreFocus = false;
}
function restore(event: Event) { event.preventDefault(); if (restoreFocus && props.anchor.isConnected) props.anchor.focus({ preventScroll: true }); }
function autofocus(event: Event) {
  event.preventDefault();
  const menu = event.target as HTMLElement;
  (menu.querySelector<HTMLElement>('[data-reka-collection-item]:not([data-disabled])') ?? menu).focus({ preventScroll: true });
}
onMounted(() => window.addEventListener('resize', close));
onBeforeUnmount(() => window.removeEventListener('resize', close));
</script>
<template>
  <DropdownMenuRoot :open="true" :modal="false" @update:open="!$event && close()">
    <DropdownMenuPortal :to="target">
      <DropdownMenuContent ref="content" :id="id" class="frame-menu" :data-item-alignment="itemAlignment" :data-frame-menu-owner="owner" :aria-label="label ?? 'Menu'" :aria-labelledby="undefined"
        :reference="reference" :side="point || placement === 'right' ? 'right' : 'bottom'" align="start" :side-offset="point ? 0 : 4"
        :collision-boundary="collisionBoundary" :collision-padding="6" :style="{minWidth: Math.min(240, bounds.width - 12) + 'px', maxWidth: Math.max(0,bounds.width - 12) + 'px', maxHeight: 'min(' + Math.max(0,bounds.height - 12) + 'px, var(--reka-dropdown-menu-content-available-height))'}" loop
        @open-auto-focus="autofocus" @close-auto-focus="restore" @interact-outside="interactOutside">
        <MenuList :items="items" :item-alignment="itemAlignment" :owner="owner" :anchor="anchor" @select="select" />
      </DropdownMenuContent>
      <OverlayScrollbars v-if="surface" :root="surface" />
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
