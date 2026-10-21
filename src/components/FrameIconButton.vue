<script setup lang="ts">
import { computed, ref } from "vue";
import type { Component } from "vue";
import FrameButton from "./FrameButton.vue";
import FrameIcon from "./FrameIcon.vue";
import FrameTooltip from "./FrameTooltip.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ label: string; shortcut?: string; icon?: string | Component; size?: number; iconRatio?: number; iconSize?: number; hoverHighlight?: boolean; tooltip?: string | boolean; tooltipPlacement?: "top" | "bottom" | "left" | "right"; disabled?: boolean }>(), { size: 26, iconRatio: .62, hoverHighlight: true, tooltip: true, tooltipPlacement: "bottom" });
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const button = ref<{ element?: HTMLButtonElement; focus: () => void }>();
const element = computed(() => button.value?.element);
const pixels = computed(() => props.iconSize ?? Math.round(props.size * props.iconRatio));
defineExpose({ element, focus: () => button.value?.focus() });
</script>
<template><FrameTooltip :text="typeof tooltip === 'string' ? tooltip : label" :shortcut="shortcut" :disabled="tooltip === false" :placement="tooltipPlacement" v-slot="{ describedby }"><FrameButton ref="button" variant="ghost" type="button" v-bind="$attrs" class="icon-button frame-icon-button" :class="{ 'no-hover-highlight': !hoverHighlight }" :style="{ width: `${size}px`, height: `${size}px` }" :aria-label="label" :aria-describedby="describedby" :disabled="disabled" @click="emit('click', $event)"><FrameIcon v-if="typeof icon === 'string'" :name="icon" :size="pixels"/><component v-else-if="icon" :is="icon" :style="{ width: `${pixels}px`, height: `${pixels}px` }"/><slot v-else/></FrameButton></FrameTooltip></template>
