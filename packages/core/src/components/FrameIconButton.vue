<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import type { Component } from "vue";
import FrameButton from "./FrameButton.vue";
import FrameIcon from "./FrameIcon.vue";
import FrameTooltip from "./FrameTooltip.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ label: string; showLabel?: boolean; shortcut?: string; icon?: string | Component; size?: number; iconRatio?: number; iconSize?: number; hoverHighlight?: boolean; tooltip?: string | boolean; tooltipPlacement?: "top" | "bottom" | "left" | "right"; disabled?: boolean }>(), { size: 26, iconRatio: .62, hoverHighlight: true, tooltip: true, tooltipPlacement: "bottom" });
const attrs = useAttrs();
const describedBy = (tooltipId?: string) => [attrs["aria-describedby"], tooltipId].filter(Boolean).join(" ") || undefined;
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const button = ref<{ element?: HTMLButtonElement; focus: () => void }>();
const element = computed(() => button.value?.element);
const pixels = computed(() => props.iconSize ?? Math.round(props.size * props.iconRatio));
defineExpose({ element, focus: () => button.value?.focus() });
</script>
<template><FrameTooltip :text="typeof tooltip === 'string' ? tooltip : label" :shortcut="shortcut" :disabled="tooltip === false" :placement="tooltipPlacement" v-slot="{ describedby }"><FrameButton ref="button" variant="ghost" type="button" v-bind="$attrs" class="icon-button frame-icon-button" :class="{ 'no-hover-highlight': !hoverHighlight, 'frame-icon-button-labeled': showLabel }" :style="{ '--frame-icon-button-size': `${size}px`, '--frame-icon-button-icon-size': `${pixels}px` }" :aria-label="label" :aria-describedby="describedBy(describedby)" :disabled="disabled" @click="emit('click', $event)"><span v-if="icon" class="frame-icon-button-icon"><FrameIcon v-if="typeof icon === 'string'" :name="icon" :size="pixels"/><component v-else :is="icon"/></span><slot v-else/><span v-if="showLabel" class="frame-icon-button-label">{{label}}</span></FrameButton></FrameTooltip></template>
