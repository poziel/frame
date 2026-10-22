<script setup lang="ts">
import { computed, ref } from "vue";
import { useFrame } from "../frame/createFrame";
import FrameIcon from "./FrameIcon.vue";
import FrameMenu from "./FrameMenu.vue";
import FrameIconButton from "./FrameIconButton.vue";
import type { FrameMenuItem } from "../types";
const frame = useFrame();
const button = ref<{element?: HTMLButtonElement}>(); const anchor = computed(() => button.value?.element); const open = ref(false);
function select(item: FrameMenuItem) { if (item.type !== "separator" && item.command) void frame.executeCommand(item.command); }
</script>
<template><div v-if="frame.features.settings" class="activity-manage"><FrameIconButton ref="button" class="rail-button" label="Manage" tooltip-placement="right" aria-haspopup="menu" :aria-expanded="open" @click="open = !open"><FrameIcon name="settings-gear" :size="20"/></FrameIconButton><FrameMenu v-if="open && anchor" :anchor="anchor" placement="right" :items="frame.manageMenuItems.value" label="Manage" @select="select" @close="open = false"/></div></template>
