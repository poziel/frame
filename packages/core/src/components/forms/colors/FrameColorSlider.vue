<script setup lang="ts">
import { computed, shallowRef, watch, toRef } from 'vue';
import { orientColorGradient } from '../shared/colorSlider';
import { getSliderBackgroundStyle, normalizeColor, useDirection, ColorSliderRoot, useForwardPropsEmits, ColorSliderTrack, ColorSliderThumb } from 'reka-ui';
import type { ColorSliderRootProps, ColorSliderRootEmits } from 'reka-ui';
import '../shared/advanced.css';
const props=defineProps<ColorSliderRootProps>();
const emit=defineEmits<ColorSliderRootEmits>();
const forwarded=useForwardPropsEmits(props,emit);
const current = shallowRef(props.modelValue ?? props.defaultValue ?? '#ff0000');
watch(() => props.modelValue, value => { if (value !== undefined) current.value = value; });
const direction = useDirection(toRef(props,'dir'));
const trackStyle = computed(() => {
  const style = getSliderBackgroundStyle(normalizeColor(current.value),props.channel,props.colorSpace);
  return { ...style, background: orientColorGradient(style.background ?? '',props.orientation,props.inverted,direction.value) };
});
</script>
<template><ColorSliderRoot v-bind="forwarded" class="frame-color-slider" @update:color="current=$event"><ColorSliderTrack :style="trackStyle" class="frame-color-track"><ColorSliderThumb :aria-disabled="disabled || undefined" class="frame-color-thumb" /></ColorSliderTrack></ColorSliderRoot></template>
