<script setup lang="ts">
import { Separator, type SeparatorProps, useForwardProps } from 'reka-ui';
import '../general-a.css';
const props = defineProps<SeparatorProps>();
const forwarded = useForwardProps(props);
</script>
<template><Separator v-bind="forwarded" class="frame-separator"><slot/></Separator></template>
