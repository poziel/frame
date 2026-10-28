<script setup lang="ts">
import {computed, ref, useAttrs} from 'vue';
import type {Component} from 'vue';
import FrameButton from './FrameButton.vue';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameTooltip from '../overlays/FrameTooltip.vue';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<{
    /** Accessible button name and fallback tooltip text. */
    label: string;
    /** Rotation of the icon in degrees. */
    angle?: number;
    /** Mirrors the icon horizontally. */
    flipHorizontal?: boolean;
    /** Mirrors the icon vertically. */
    flipVertical?: boolean;
    /** Selects the icon-button visual treatment. */
    variant?: 'ghost' | 'icon';
    /** Displays the label beside the icon. */
    showLabel?: boolean;
    /** Keyboard shortcut displayed in the tooltip. */
    shortcut?: string;
    /** Iconify name or Vue component used as the icon; absent icons use the default slot. */
    icon?: string | Component;
    /** Button width and height in pixels. */
    size?: number;
    /** Fraction of the button size used for the icon when iconSize is omitted. */
    iconRatio?: number;
    /** Explicit icon size in pixels; overrides size multiplied by iconRatio. */
    iconSize?: number;
    /** Displays the button highlight on hover. */
    hoverHighlight?: boolean;
    /** Tooltip text, true to use title or label, or false to disable it. */
    tooltip?: string | boolean;
    /** Preferred side for the tooltip. */
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    /** Prevents user interaction with the control. */
    disabled?: boolean;
  }>(),
  {
    size: 26,
    iconRatio: 0.62,
    hoverHighlight: true,
    tooltip: true,
    tooltipPlacement: 'bottom',
  }
);
const attrs = useAttrs();
const buttonAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'title'))
);
const describedBy = (tooltipId?: string) =>
  [attrs['aria-describedby'], tooltipId].filter(Boolean).join(' ') || undefined;
const emit = defineEmits<{
  /** Native click event from the button. */
  click: [event: MouseEvent];
}>();
const button = ref<{element?: HTMLButtonElement; focus: () => void}>();
const element = computed(() => button.value?.element);
const pixels = computed(
  () => props.iconSize ?? Math.round(props.size * props.iconRatio)
);
defineExpose({
  /** Underlying native button element; undefined before mount and unwrapped on component refs. */
  element,
  /** Focuses the underlying button when mounted. */

  focus: () => button.value?.focus(),
});

defineSlots<{
  /** Icon content used when the icon prop is omitted. */
  default?(): unknown;
  /** Custom tooltip content; replaces the text and shortcut presentation. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <FrameTooltip
    :text="
      typeof tooltip === 'string'
        ? tooltip
        : typeof attrs.title === 'string'
          ? attrs.title
          : label
    "
    :shortcut="shortcut"
    :disabled="tooltip === false"
    :placement="tooltipPlacement"
    ><template #default="{describedby}"
      ><FrameButton
        ref="button"
        variant="ghost"
        type="button"
        v-bind="buttonAttrs"
        class="icon-button frame-icon-button"
        :class="{
          'no-hover-highlight': !hoverHighlight,
          'frame-icon-button-icon-only': variant === 'icon',
          'frame-icon-button-labeled': showLabel,
        }"
        :style="{
          '--frame-icon-button-size': `${size}px`,
          '--frame-icon-button-icon-size': `${pixels}px`,
        }"
        :aria-label="label"
        :aria-describedby="describedBy(describedby)"
        :disabled="disabled"
        @click="emit('click', $event)"
        ><span
          v-if="icon"
          class="frame-icon-button-icon"
          :style="{
            transform: `rotate(${angle ?? 0}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`,
          }"
          ><FrameIcon
            v-if="typeof icon === 'string'"
            :name="icon"
            :size="pixels" /><component v-else :is="icon" /></span
        ><slot v-else /><span
          v-if="showLabel"
          class="frame-icon-button-label"
          >{{ label }}</span
        ></FrameButton
      ></template
    ><template v-if="$slots.tooltip" #content><slot name="tooltip" /></template
  ></FrameTooltip>
</template>
