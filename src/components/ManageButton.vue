<script setup lang="ts">
import { ref } from "vue";
import { useFrame } from "../frame/createFrame";
import FrameIcon from "./FrameIcon.vue";
import FrameMenu from "./FrameMenu.vue";
import FrameTooltip from "./FrameTooltip.vue";
import type { FrameMenuItem } from "../types";
const frame = useFrame();
const anchor = ref<HTMLElement>(); const open = ref(false);
function select(item: FrameMenuItem) { if (item.type !== "separator" && item.command) void frame.executeCommand(item.command); }
</script>
<template><div v-if="frame.features.settings" class="activity-manage"><FrameTooltip text="Manage" placement="right" v-slot="{ describedby }"><button ref="anchor" class="rail-button" aria-label="Manage" aria-haspopup="menu" :aria-expanded="open" :aria-describedby="describedby" @click="open = !open"><FrameIcon name="settings-gear" :size="20"/></button></FrameTooltip><FrameMenu v-if="open && anchor" :anchor="anchor" placement="right" :items="frame.manageMenuItems.value" label="Manage" @select="select" @close="open = false"/></div></template>
