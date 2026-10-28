<script setup lang="ts">
import {ColorSwatch} from 'reka-ui';
import type {ColorSwatchProps} from 'reka-ui';
import '../shared/advanced.css';

defineProps<ColorSwatchProps>();

defineSlots<{
  /** Content over the displayed color swatch. */
  default?(): unknown;
}>();
</script>
<template>
  <ColorSwatch v-bind="$props" class="frame-color-swatch"><slot /></ColorSwatch>
</template>
