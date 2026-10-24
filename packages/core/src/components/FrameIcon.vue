<script setup lang="ts">
import { computed } from "vue";
import { Icon, addCollection } from "@iconify/vue";
import { icons } from "@iconify-json/codicon";
addCollection(icons);
const props = withDefaults(defineProps<{ name: string; pack?: string; size?: number | string; angle?: number; flipHorizontal?: boolean; flipVertical?: boolean }>(), { size: 16 });
const icon = computed(() => props.pack ? `${props.pack}:${props.name}` : props.name.includes(":") ? props.name : `codicon:${props.name}`);
</script>
<template><span class="frame-icon" :style="{ width: typeof size === 'number' ? `${size}px` : size, transform: `rotate(${angle ?? 0}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`, height: typeof size === 'number' ? `${size}px` : size }" aria-hidden="true"><Icon :icon="icon" width="100%" height="100%"/></span></template>
