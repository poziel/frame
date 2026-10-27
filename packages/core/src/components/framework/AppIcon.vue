<script setup lang="ts">
import FrameIcon from "../data-display/FrameIcon.vue";
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 18 });
const aliases: Record<string, string> = { workspace: "layout", activity: "pulse", preferences: "settings-gear", sidebar: "layout-sidebar-left", panel: "layout-panel", command: "terminal", arrow: "arrow-right", chevron: "chevron-right" };
</script>
<template><FrameIcon :name="aliases[name] ?? name" :size="size"/></template>
