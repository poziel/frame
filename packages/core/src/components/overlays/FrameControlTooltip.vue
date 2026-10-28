<script setup lang="ts">
import FrameTooltip from './FrameTooltip.vue';
import type {ControlTooltipProps} from '../forms/shared/tooltip';

withDefaults(defineProps<ControlTooltipProps>(), {tooltip: undefined});
defineSlots<{
  /** Control content receiving the active tooltip's accessibility description ID. */ default?(
    props: {
    describedby: string | undefined;
  }
  ): unknown;
  /** Custom tooltip body used instead of the tooltip string. */ tooltip?(): unknown;
}>();
</script>
<template>
  <FrameTooltip
    v-if="tooltip !== false && (tooltip || $slots.tooltip)"
    :text="tooltip || ''"
    :placement="tooltipPlacement ?? 'bottom'"
    as-child
    disable-hoverable-content
    ><template #default="{describedby}">
      <slot :describedby="describedby" /> </template
    ><template v-if="$slots.tooltip" #content><slot name="tooltip" /></template>
  </FrameTooltip>
  <slot v-else :describedby="undefined" />
</template>

<style lang="scss">
/* Descriptive control tooltips must never cover another control's hit area. */
[data-reka-popper-content-wrapper]:has(> .frame-tooltip[data-noninteractive]),
.frame-tooltip[data-noninteractive] {
  pointer-events: none;
}
</style>
