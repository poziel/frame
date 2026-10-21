<script setup lang="ts">
import { ref, shallowRef } from "vue";
import FrameMenu from "./FrameMenu.vue";
import type { FrameMenuItem } from "../types";
defineProps<{ items: readonly FrameMenuItem[]; label?: string }>();
const emit = defineEmits<{ select: [item: FrameMenuItem] }>();
const anchor = shallowRef<HTMLElement>(); const point = ref({ x: 0, y: 0 });
function open(event: MouseEvent) { event.preventDefault(); event.stopPropagation(); anchor.value = event.currentTarget as HTMLElement; point.value = { x: event.clientX || anchor.value.getBoundingClientRect().left, y: event.clientY || anchor.value.getBoundingClientRect().bottom }; }
</script>
<template><div class="context-menu-target" tabindex="0" @contextmenu="open"><slot/><FrameMenu v-if="anchor && items.length" :anchor="anchor" :point="point" :items="items" :label="label" @close="anchor = undefined" @select="emit('select', $event)"/></div></template>
