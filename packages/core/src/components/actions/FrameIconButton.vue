<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import type { Component } from "vue";
import FrameButton from "./FrameButton.vue";
import FrameIcon from "../data-display/FrameIcon.vue";
import FrameTooltip from "../overlays/FrameTooltip.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ label: string; angle?: number; flipHorizontal?: boolean; flipVertical?: boolean; variant?: "ghost" | "icon"; showLabel?: boolean; shortcut?: string; icon?: string | Component; size?: number; iconRatio?: number; iconSize?: number; hoverHighlight?: boolean; tooltip?: string | boolean; tooltipPlacement?: "top" | "bottom" | "left" | "right"; disabled?: boolean }>(), { size: 26, iconRatio: .62, hoverHighlight: true, tooltip: true, tooltipPlacement: "bottom" });
const attrs = useAttrs();
const buttonAttrs=computed(()=>Object.fromEntries(Object.entries(attrs).filter((
  [key]
)=>key!=="title")));
const describedBy = (tooltipId?: string) => [attrs["aria-describedby"], tooltipId].filter(Boolean).join(" ") || undefined;
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const button = ref<{ element?: HTMLButtonElement; focus: () => void }>();
const element = computed(() => button.value?.element);
const pixels = computed(() => props.iconSize ?? Math.round(props.size * props.iconRatio));
defineExpose({ element, focus: () => button.value?.focus() });
</script>
<template><FrameTooltip :text="typeof tooltip === 'string' ? tooltip : typeof attrs.title === 'string' ? attrs.title : label" :shortcut="shortcut" :disabled="tooltip === false" :placement="tooltipPlacement"><template #default="{describedby}"><FrameButton ref="button" variant="ghost" type="button" v-bind="buttonAttrs" class="icon-button frame-icon-button" :class="{ 'no-hover-highlight': !hoverHighlight, 'frame-icon-button-icon-only': variant === 'icon', 'frame-icon-button-labeled': showLabel }" :style="{ '--frame-icon-button-size': `${size}px`, '--frame-icon-button-icon-size': `${pixels}px` }" :aria-label="label" :aria-describedby="describedBy(describedby)" :disabled="disabled" @click="emit('click', $event)"><span v-if="icon" class="frame-icon-button-icon" :style="{ transform: `rotate(${angle ?? 0}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})` }"><FrameIcon v-if="typeof icon === 'string'" :name="icon" :size="pixels"/><component v-else :is="icon"/></span><slot v-else/><span v-if="showLabel" class="frame-icon-button-label">{{label}}</span></FrameButton></template><template v-if="$slots.tooltip" #content><slot name="tooltip" /></template></FrameTooltip></template>
