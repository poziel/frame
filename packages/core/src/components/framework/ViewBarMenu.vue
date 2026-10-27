<script setup lang="ts">
import { computed, ref } from "vue";
import type {FrameMenuItem} from '../navigation/generalMenu';
import FrameDropdownMenu from "../navigation/FrameDropdownMenu.vue";
import FrameIconButton from "../actions/FrameIconButton.vue";
defineProps<{ items: readonly FrameMenuItem[] }>();
defineEmits<{ execute: [id: string] }>();
const open = ref(false);
const button = ref<{element?:HTMLButtonElement}>();
const anchor = computed(()=>button.value?.element);
</script>
<template>
    <FrameIconButton ref="button" class="rail-button" label="Application menu" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 4.5h12M2 8h12M2 11.5h12" /></svg>
    </FrameIconButton>
  <FrameDropdownMenu v-if="open && anchor" :anchor="anchor" :items="items" label="Application menu" @close="open = false" @select="item => item.type !== 'separator' && item.command && $emit('execute', item.command)" />
</template>
