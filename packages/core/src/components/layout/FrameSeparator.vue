<script setup lang="ts">
import {Separator, type SeparatorProps, useForwardProps} from 'reka-ui';
import '../shared/general-a.css';

const props = defineProps<SeparatorProps>();
const forwarded = useForwardProps(props);
defineSlots<{
  /** Optional content inside the separator primitive. */ default?(): unknown;
}>();
</script>
<template>
  <Separator v-bind="forwarded" class="frame-separator"><slot /></Separator>
</template>
