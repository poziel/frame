<script setup lang="ts">
import {TooltipTrigger, injectTooltipRootContext} from 'reka-ui';

const props = defineProps<{
  /** Tooltip content ID associated with the rendered trigger. */
  contentId: string;
}>();
// Keep Frame's scoped describedby contract connected to Reka's accessible content.
injectTooltipRootContext().contentId = props.contentId;
defineSlots<{
  /** Trigger element receiving Reka's tooltip interactions. */ default?(): unknown;
}>();
</script>
<template>
  <TooltipTrigger as-child><slot /></TooltipTrigger>
</template>
