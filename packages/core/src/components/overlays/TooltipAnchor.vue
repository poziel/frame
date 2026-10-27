<script setup lang="ts">
import { TooltipTrigger, injectTooltipRootContext } from 'reka-ui';
const props=defineProps<{contentId:string}>();
// Keep Frame's scoped describedby contract connected to Reka's accessible content.
injectTooltipRootContext().contentId=props.contentId;
</script>
<template><TooltipTrigger as-child><slot/></TooltipTrigger></template>
