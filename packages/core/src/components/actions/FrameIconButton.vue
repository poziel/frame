<script setup lang="ts">
import {computed, ref, useAttrs} from 'vue';
import type {Component} from 'vue';
import FrameButton from './FrameButton.vue';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameTooltip from '../overlays/FrameTooltip.vue';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<{
    label: string;
    angle?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    variant?: 'ghost' | 'icon';
    showLabel?: boolean;
    shortcut?: string;
    icon?: string | Component;
    size?: number;
    iconRatio?: number;
    iconSize?: number;
    hoverHighlight?: boolean;
    tooltip?: string | boolean;
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
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
const emit = defineEmits<{click: [event: MouseEvent]}>();
const button = ref<{element?: HTMLButtonElement; focus: () => void}>();
const element = computed(() => button.value?.element);
const pixels = computed(
  () => props.iconSize ?? Math.round(props.size * props.iconRatio)
);
defineExpose({element, focus: () => button.value?.focus()});
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

<style lang="scss">
.frame-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--frame-icon-button-padding, 0);
  gap: var(--frame-icon-button-gap, 0);
  flex-shrink: 0;
  line-height: var(--frame-icon-button-line-height, 0);
  vertical-align: middle;
}
.frame-icon-button.no-hover-highlight:hover {
  background: var(
    --frame-icon-button-no-hover-highlight-hover-background,
    transparent
  );
  color: inherit;
}
.frame-icon-button > .frame-icon {
  margin: var(--frame-icon-button-frame-icon-margin, 0);
}

/* Icon buttons own a square slot, while standalone FrameIcon sizing stays independent. */
button.frame-button.frame-icon-button {
  inline-size: var(--frame-icon-button-size, 26px);
  block-size: var(--frame-icon-button-size, 26px);
  aspect-ratio: 1;
}
.frame-icon-button-icon {
  /* Center oversized children symmetrically when their padding cannot fit the slot. */
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  inline-size: var(--frame-icon-button-icon-size, 16px);
  aspect-ratio: 1;
}
.frame-icon-button-icon > :is(svg, .frame-icon) {
  display: block;
  width: 100%;
  height: 100%;
}
button.frame-button.frame-icon-button.frame-icon-button-labeled {
  inline-size: auto;
  aspect-ratio: auto;
  gap: var(--frame-icon-button-label-gap, var(--frame-spacing-small, 4px));
  padding-inline: var(
    --frame-icon-button-label-padding,
    var(--frame-spacing-small, 4px)
  );
}
.frame-icon-button-label {
  font-size: var(--frame-icon-button-label-font-size, inherit);
  line-height: 1;
  padding-inline-end: var(--frame-icon-button-label-end-padding, 2px);
}

/* Icon-only emphasis preserves the hit target without painting a hover surface. */
button.frame-button.frame-icon-button.frame-icon-button-icon-only,
button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover,
button.frame-button.frame-icon-button.frame-icon-button-icon-only:active {
  background: transparent;
}
button.frame-button.frame-icon-button.frame-icon-button-icon-only {
  color: var(--frame-muted);
}
button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover:not(
    :disabled
  )
  > .frame-icon-button-icon {
  color: var(
    --frame-icon-button-icon-hover-color,
    color-mix(in srgb, var(--frame-text) 65%, white)
  );
}
</style>
