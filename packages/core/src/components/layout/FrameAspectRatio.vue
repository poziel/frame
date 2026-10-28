<script setup lang="ts">
import {AspectRatio, type AspectRatioProps, useForwardProps} from 'reka-ui';
import '../shared/general-a.css';

const props = defineProps<AspectRatioProps>();
const forwarded = useForwardProps(props);
defineSlots<{
  /** Content fitted to the configured aspect ratio. */ default?(): unknown;
}>();
</script>
<template>
  <AspectRatio v-bind="forwarded" class="frame-aspect-ratio"
    ><slot
  /></AspectRatio>
</template>
