<script setup lang="ts">
import {AspectRatio, type AspectRatioProps, useForwardProps} from 'reka-ui';
import './styles/disclosure-and-layout.scss';

const props = defineProps<AspectRatioProps>();
const forwarded = useForwardProps(props);
</script>
<template>
  <AspectRatio v-bind="forwarded" class="frame-aspect-ratio"
    ><slot
  /></AspectRatio>
</template>

<style lang="scss">
.frame-aspect-ratio {
  overflow: hidden;
  background: var(--frame-aspect-ratio-background, var(--frame-surface));
  color: var(--frame-text);
}

.frame-aspect-ratio > img,
.frame-aspect-ratio > video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
