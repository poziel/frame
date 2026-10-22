<script setup lang="ts">
import { ColorSliderRoot, useForwardPropsEmits, ColorSliderTrack, ColorSliderThumb } from 'reka-ui';
import type { ColorSliderRootProps, ColorSliderRootEmits } from 'reka-ui';
import '../forms/advanced.css';
const props=defineProps<ColorSliderRootProps>();
const emit=defineEmits<ColorSliderRootEmits>();
const forwarded=useForwardPropsEmits(props,emit);
</script>
<template><ColorSliderRoot v-bind="forwarded" class="frame-color-slider"><ColorSliderTrack class="frame-color-track"><ColorSliderThumb :aria-disabled="disabled || undefined" class="frame-color-thumb" /></ColorSliderTrack></ColorSliderRoot></template>
