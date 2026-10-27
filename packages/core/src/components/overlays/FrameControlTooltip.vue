<script setup lang="ts">
import FrameTooltip from './FrameTooltip.vue';
import type {ControlTooltipProps} from '../forms/shared/tooltip';
withDefaults(defineProps<ControlTooltipProps>(),{tooltip:undefined});
</script>
<template>
 <FrameTooltip v-if="tooltip!==false&&(tooltip||$slots.tooltip)" :text="tooltip||''" :placement="tooltipPlacement??'bottom'" as-child disable-hoverable-content><template #default="{describedby}">
  <slot :describedby="describedby" />
  </template><template v-if="$slots.tooltip" #content><slot name="tooltip" /></template>
 </FrameTooltip>
 <slot v-else :describedby="undefined" />
</template>
