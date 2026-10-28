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
