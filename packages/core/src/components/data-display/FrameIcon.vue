<script setup lang="ts">
import {computed} from 'vue';
import {Icon, addCollection} from '@iconify/vue';
import {icons} from '@iconify-json/codicon';

addCollection(icons);
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {
  useControlTooltip,
  type ControlTooltipProps,
} from '../forms/shared/tooltip';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      /** Iconify icon name; unprefixed names use the codicon collection. */
      name: string;
      /** Iconify collection prefix; overrides any prefix in name. */
      pack?: string;
      /** Width and height; numeric values are pixels and strings retain their CSS units. */
      size?: number | string;
      /** Rotation of the icon in degrees. */
      angle?: number;
      /** Mirrors the icon horizontally. */
      flipHorizontal?: boolean;
      /** Mirrors the icon vertically. */
      flipVertical?: boolean;
    }
  >(),
  {tooltip: undefined, size: 16}
);
const {tooltipText, controlAttrs} = useControlTooltip(props);
const icon = computed(() =>
  props.pack
    ? `${props.pack}:${props.name}`
    : props.name.includes(':')
      ? props.name
      : `codicon:${props.name}`
);

defineSlots<{
  /** Custom tooltip content for the decorative icon. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <FrameControlTooltip
    :tooltip="tooltipText"
    :tooltip-placement="tooltipPlacement"
    ><span
      v-bind="controlAttrs"
      class="frame-icon"
      :style="{
        width: typeof size === 'number' ? `${size}px` : size,
        transform: `rotate(${angle ?? 0}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`,
        height: typeof size === 'number' ? `${size}px` : size,
      }"
      aria-hidden="true"
      ><Icon :icon="icon" width="100%" height="100%" /></span
    ><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template
  ></FrameControlTooltip>
</template>

<style lang="scss">
.frame-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  max-height: 100%;
  vertical-align: middle;
  /* Text line height for .frame-icon. @token --frame-icon-line-height */
  --_frame-default-icon-line-height-88a7de6930: 1;
  line-height: var(
    --frame-icon-line-height,
    var(--_frame-default-icon-line-height-88a7de6930)
  );
}
.frame-icon > svg {
  display: block;
  /* Width for .frame-icon > svg. @token --frame-icon-svg-width */
  --_frame-default-icon-svg-width-c14d71c586: 100%;
  width: var(
    --frame-icon-svg-width,
    var(--_frame-default-icon-svg-width-c14d71c586)
  ); /* Height for .frame-icon > svg. @token --frame-icon-svg-height */
  --_frame-default-icon-svg-height-82bef0fd8d: 100%;
  height: var(
    --frame-icon-svg-height,
    var(--_frame-default-icon-svg-height-82bef0fd8d)
  );
}
</style>
