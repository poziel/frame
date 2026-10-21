<script setup lang="ts">
import { ref } from "vue";
import type { FrameMenuItem } from "../types";
import FrameMenu from "./FrameMenu.vue";
import FrameTooltip from "./FrameTooltip.vue";
defineProps<{ items: readonly FrameMenuItem[] }>();
defineEmits<{ execute: [id: string] }>();
const open = ref(false);
const anchor = ref<HTMLButtonElement>();
</script>
<template>
  <FrameTooltip text="Application menu" v-slot="{ describedby }">
    <button ref="anchor" class="rail-button" aria-label="Application menu" :aria-describedby="describedby" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 4.5h12M2 8h12M2 11.5h12" /></svg>
    </button>
  </FrameTooltip>
  <FrameMenu v-if="open && anchor" :anchor="anchor" :items="items" label="Application menu" @close="open = false" @select="item => item.type !== 'separator' && item.command && $emit('execute', item.command)" />
</template>
