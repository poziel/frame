<script setup lang="ts">
import {Separator, type SeparatorProps, useForwardProps} from 'reka-ui';
import './styles/disclosure-and-layout.scss';

const props = defineProps<SeparatorProps>();
const forwarded = useForwardProps(props);
</script>
<template>
  <Separator v-bind="forwarded" class="frame-separator"><slot /></Separator>
</template>

<style lang="scss">
.frame-separator {
  background: var(--frame-separator-color, var(--frame-line));
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
