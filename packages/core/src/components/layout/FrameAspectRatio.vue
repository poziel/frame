<script setup lang="ts">
import {AspectRatio, type AspectRatioProps, useForwardProps} from 'reka-ui';
import './styles/disclosure-and-layout.scss';

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

<style lang="scss">
.frame-aspect-ratio {
  overflow: hidden;
  /* Surface behind aspect-ratio content. @token --frame-aspect-ratio-background */
  --_frame-default-aspect-ratio-background-133: var(--frame-surface);
  /* Neutral raised surface behind grouped content and control compositions. @token --frame-surface @context */
  background: var(
    --frame-aspect-ratio-background,
    var(--_frame-default-aspect-ratio-background-133)
  ); /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
}

.frame-aspect-ratio > img,
.frame-aspect-ratio > video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
