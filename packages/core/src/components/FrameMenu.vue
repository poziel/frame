<script setup lang="ts">
import { onBeforeUnmount, onMounted, useId } from "vue";
import type { FrameMenuItem } from "../types";
import MenuList from "./MenuList.vue";
const props = defineProps<{ id?: string; anchor: HTMLElement; items: readonly FrameMenuItem[]; label?: string; placement?: "bottom" | "right"; point?: { x: number; y: number } }>();
const emit = defineEmits<{ close: []; select: [item: FrameMenuItem] }>();
const owner = useId();
function close() { emit("close"); if (props.anchor.isConnected) props.anchor.focus(); }
function outside(event: PointerEvent) {
  const target = event.target as Element;
  if (props.anchor.contains(target)) return;
  if (target.closest("[data-frame-menu-owner]")?.getAttribute("data-frame-menu-owner") !== owner) close();
}
function focusOut(event: FocusEvent) {
  const target = event.target as Element;
  if (!props.anchor.contains(target) && target.closest("[data-frame-menu-owner]")?.getAttribute("data-frame-menu-owner") !== owner) emit("close");
}
function select(item: FrameMenuItem) { close(); emit("select", item); }
onMounted(() => { window.addEventListener("pointerdown", outside); window.addEventListener("focusin", focusOut); window.addEventListener("resize", close); });
onBeforeUnmount(() => { window.removeEventListener("pointerdown", outside); window.removeEventListener("focusin", focusOut); window.removeEventListener("resize", close); });
</script>
<template>
  <MenuList :menu-id="id" :items="items" :owner="owner" :anchor="anchor" :point="point" :placement="placement" :label="label ?? 'Menu'" autofocus @select="select" @dismiss="close" @back="close" />
</template>

