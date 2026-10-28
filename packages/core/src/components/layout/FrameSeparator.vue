<script setup lang="ts">
import {Separator, type SeparatorProps, useForwardProps} from 'reka-ui';
import './styles/disclosure-and-layout.scss';

const props = defineProps<SeparatorProps>();
const forwarded = useForwardProps(props);
defineSlots<{
  /** Optional content inside the separator primitive. */ default?(): unknown;
}>();
</script>
<template>
  <Separator v-bind="forwarded" class="frame-separator"><slot /></Separator>
</template>

<style lang="scss">
.frame-separator {
  /* Color of the horizontal or vertical separator. @token --frame-separator-color */
  --_frame-default-separator-color-147: var(--frame-line);
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  background: var(
    --frame-separator-color,
    var(--_frame-default-separator-color-147)
  );
  flex-shrink: 0;
}

.frame-separator[data-orientation='horizontal'] {
  height: 1px;
  width: 100%;
}

.frame-separator[data-orientation='vertical'] {
  width: 1px;
  align-self: stretch;
  min-height: 1em;
}
</style>
