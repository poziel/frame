<script setup lang="ts">
import { computed, ref } from "vue";
import type { FrameMenuItem } from "../types";
import FrameMenu from "./FrameMenu.vue";
const props = defineProps<{ items: readonly FrameMenuItem[] }>();
const emit = defineEmits<{ execute: [id: string] }>();
const openId = ref("");
const anchor = ref<HTMLButtonElement>();
const groups = computed(() => props.items.filter(item => item.type !== "separator"));
const buttons = new Map<string, HTMLButtonElement>();
function setButton(id: string, el: unknown) { if (el instanceof HTMLButtonElement) buttons.set(id, el); else buttons.delete(id); }
function open(id: string, target: HTMLButtonElement) { anchor.value = target; openId.value = openId.value === id ? "" : id; }
function execute(item: FrameMenuItem) { if (item.type !== "separator" && item.command) emit("execute", item.command); }
const openedItems = computed(() => openId.value === "overflow" ? props.items : groups.value.find(item => item.id === openId.value)?.children ?? []);
function keys(event: KeyboardEvent, id: string) {
  if (!["ArrowLeft", "ArrowRight", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const index = groups.value.findIndex(item => item.id === id);
  if (event.key === "ArrowDown") { const button = buttons.get(id); if (button) open(id, button); }
  else buttons.get(groups.value[(index + (event.key === "ArrowRight" ? 1 : -1) + Math.min(3, groups.value.length)) % Math.min(3, groups.value.length)]?.id ?? "")?.focus();
}
</script>
<template>
  <nav class="frame-menubar" role="menubar" aria-label="Application menus">
    <div class="menubar-groups">
      <button v-for="item in groups.slice(0,3)" :key="item.id" :ref="el => setButton(item.id, el)" role="menuitem" aria-haspopup="menu"
        :aria-expanded="openId === item.id" :class="{ active: openId === item.id }" @keydown="keys($event, item.id)"
        @click="item.children ? open(item.id, $event.currentTarget as HTMLButtonElement) : execute(item)"
        @pointerenter="openId && openId !== item.id && open(item.id, $event.currentTarget as HTMLButtonElement)">{{ item.label }}</button>
    </div>
    <button class="menubar-overflow" :class="{ needed: groups.length > 3 }" role="menuitem" aria-label="All application menus" aria-haspopup="menu" :aria-expanded="openId === 'overflow'" @click="open('overflow', $event.currentTarget as HTMLButtonElement)">···</button>
    <FrameMenu v-if="openId && anchor" :anchor="anchor" :items="openedItems" label="Application menu" @close="openId = ''" @select="execute" />
  </nav>
</template>


