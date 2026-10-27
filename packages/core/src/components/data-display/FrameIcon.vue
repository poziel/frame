<script setup lang="ts">
import { computed } from "vue";
import { Icon, addCollection } from "@iconify/vue";
import { icons } from "@iconify-json/codicon";
addCollection(icons);
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip,type ControlTooltipProps} from '../forms/shared/tooltip';
defineOptions({inheritAttrs:false});
const props = withDefaults(defineProps<ControlTooltipProps & { name: string; pack?: string; size?: number | string; angle?: number; flipHorizontal?: boolean; flipVertical?: boolean }>(), {tooltip:undefined, size: 16 });
const {tooltipText,controlAttrs}=useControlTooltip(props);
const icon = computed(() => props.pack ? `${props.pack}:${props.name}` : props.name.includes(":") ? props.name : `codicon:${props.name}`);
</script>
<template><FrameControlTooltip :tooltip="tooltipText" :tooltip-placement="tooltipPlacement"><span v-bind="controlAttrs" class="frame-icon" :style="{ width: typeof size === 'number' ? `${size}px` : size, transform: `rotate(${angle ?? 0}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`, height: typeof size === 'number' ? `${size}px` : size }" aria-hidden="true"><Icon :icon="icon" width="100%" height="100%"/></span><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template></FrameControlTooltip></template>
