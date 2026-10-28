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

<style lang="scss">
.frame-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Internal spacing for .frame-icon-button. @token --frame-icon-button-padding */
  --_frame-default-icon-button-padding-17c951afd2: 0;
  padding: var(
    --frame-icon-button-padding,
    var(--_frame-default-icon-button-padding-17c951afd2)
  ); /* Space between children for .frame-icon-button. @token --frame-icon-button-gap */
  --_frame-default-icon-button-gap-25ca7c5603: 0;
  gap: var(
    --frame-icon-button-gap,
    var(--_frame-default-icon-button-gap-25ca7c5603)
  );
  flex-shrink: 0;
  /* Text line height for .frame-icon-button. @token --frame-icon-button-line-height */
  --_frame-default-icon-button-line-height-0376d32f75: 0;
  line-height: var(
    --frame-icon-button-line-height,
    var(--_frame-default-icon-button-line-height-0376d32f75)
  );
  vertical-align: middle;
}
.frame-icon-button.no-hover-highlight:hover {
  /* Background for .frame-icon-button.no-hover-highlight:hover. @token --frame-icon-button-no-hover-highlight-hover-background */
  --_frame-default-icon-button-no-hover-highlight-hover-background-088bd31dd0: transparent;
  background: var(
    --frame-icon-button-no-hover-highlight-hover-background,
    var(
      --_frame-default-icon-button-no-hover-highlight-hover-background-088bd31dd0
    )
  );
  color: inherit;
}
.frame-icon-button > .frame-icon {
  /* Outer spacing for .frame-icon-button > .frame-icon. @token --frame-icon-button-frame-icon-margin */
  --_frame-default-icon-button-frame-icon-margin-6650644af3: 0;
  margin: var(
    --frame-icon-button-frame-icon-margin,
    var(--_frame-default-icon-button-frame-icon-margin-6650644af3)
  );
}

/* Icon buttons own a square slot, while standalone FrameIcon sizing stays independent. */
button.frame-button.frame-icon-button {
  /* Value of inline-size for button.frame-button.frame-icon-button. @token --frame-icon-button-size */
  --_frame-default-icon-button-size-b359de267c: 26px;
  inline-size: var(
    --frame-icon-button-size,
    var(--_frame-default-icon-button-size-b359de267c)
  ); /* Value of inline-size for button.frame-button.frame-icon-button. @token --frame-icon-button-size */
  --_frame-default-icon-button-size-b359de267c: 26px;
  block-size: var(
    --frame-icon-button-size,
    var(--_frame-default-icon-button-size-b359de267c)
  );
  aspect-ratio: 1;
}
.frame-icon-button-icon {
  /* Center oversized children symmetrically when their padding cannot fit the slot. */
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  /* Value of inline-size for .frame-icon-button-icon. @token --frame-icon-button-icon-size */
  --_frame-default-icon-button-icon-size-e9c4a71991: 16px;
  inline-size: var(
    --frame-icon-button-icon-size,
    var(--_frame-default-icon-button-icon-size-e9c4a71991)
  );
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
  /* Space between children for button.frame-button.frame-icon-button.frame-icon-button-labeled. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Space between children for button.frame-button.frame-icon-button.frame-icon-button-labeled. @token --frame-icon-button-label-gap */
  --_frame-default-icon-button-label-gap-8aadcc2cd7: var(
    --frame-spacing-small,
    var(--_frame-default-spacing-small-3e5e0f3c4b)
  );
  gap: var(
    --frame-icon-button-label-gap,
    var(--_frame-default-icon-button-label-gap-8aadcc2cd7)
  ); /* Space between children for button.frame-button.frame-icon-button.frame-icon-button-labeled. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Value of padding-inline for button.frame-button.frame-icon-button.frame-icon-button-labeled. @token --frame-icon-button-label-padding */
  --_frame-default-icon-button-label-padding-99c1daa22b: var(
    --frame-spacing-small,
    var(--_frame-default-spacing-small-3e5e0f3c4b)
  );
  padding-inline: var(
    --frame-icon-button-label-padding,
    var(--_frame-default-icon-button-label-padding-99c1daa22b)
  );
}
.frame-icon-button-label {
  /* Label size inherits from the actual font-size property. CSS-wide keywords stay at the property use site. @token --frame-icon-button-label-font-size */
  font-size: var(--frame-icon-button-label-font-size, inherit);
  line-height: 1;
  /* Value of padding-inline-end for .frame-icon-button-label. @token --frame-icon-button-label-end-padding */
  --_frame-default-icon-button-label-end-padding-831b2d2411: 2px;
  padding-inline-end: var(
    --frame-icon-button-label-end-padding,
    var(--_frame-default-icon-button-label-end-padding-831b2d2411)
  );
}

/* Icon-only emphasis preserves the hit target without painting a hover surface. */
button.frame-button.frame-icon-button.frame-icon-button-icon-only,
button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover,
button.frame-button.frame-icon-button.frame-icon-button-icon-only:active {
  background: transparent;
}
button.frame-button.frame-icon-button.frame-icon-button-icon-only {
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
}
button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover:not(
    :disabled
  )
  > .frame-icon-button-icon {
  /* Foreground for button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover:not( :disabled ) > .frame-icon-button-icon. @token --frame-icon-button-icon-hover-color */
  --_frame-default-icon-button-icon-hover-color-fe3104f2fb: color-mix(
    in srgb,
    var(--frame-text) 65%,
    white
  );
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(
    --frame-icon-button-icon-hover-color,
    var(--_frame-default-icon-button-icon-hover-color-fe3104f2fb)
  );
}
</style>
