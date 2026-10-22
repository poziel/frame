<script setup lang="ts">
import { AspectRatio, type AspectRatioProps, useForwardProps } from 'reka-ui';
import '../general-a.css';
const props = defineProps<AspectRatioProps>();
const forwarded = useForwardProps(props);
</script>
<template><AspectRatio v-bind="forwarded" class="frame-aspect-ratio"><slot/></AspectRatio></template>
