<script setup lang="ts">
import {computed, shallowRef, watch, toRef} from 'vue';
import {orientColorGradient} from '../shared/colorSlider';
import {
  getSliderBackgroundStyle,
  normalizeColor,
  useDirection,
  ColorSliderRoot,
  useForwardPropsEmits,
  ColorSliderTrack,
  ColorSliderThumb,
} from 'reka-ui';
import type {ColorSliderRootProps, ColorSliderRootEmits} from 'reka-ui';
import '../styles/advanced.scss';

const props = defineProps<ColorSliderRootProps>();
const emit = defineEmits<ColorSliderRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
const current = shallowRef(props.modelValue ?? props.defaultValue ?? '#ff0000');
watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) current.value = value;
  }
);
const direction = useDirection(toRef(props, 'dir'));
const trackStyle = computed(() => {
  const style = getSliderBackgroundStyle(
    normalizeColor(current.value),
    props.channel,
    props.colorSpace
  );
  return {
    ...style,
    background: orientColorGradient(
      style.background ?? '',
      props.orientation,
      props.inverted,
      direction.value
    ),
  };
});
</script>
<template>
  <ColorSliderRoot
    v-bind="forwarded"
    class="frame-color-slider"
    @update:color="current = $event"
    ><ColorSliderTrack :style="trackStyle" class="frame-color-track"
      ><ColorSliderThumb
        :aria-disabled="disabled || undefined"
        class="frame-color-thumb frame-advanced-focus" /></ColorSliderTrack
  ></ColorSliderRoot>
</template>

<style lang="scss">
.frame-color-slider {
  display: flex;
  position: relative;
  align-items: center;
  width: 220px;
  height: 22px;
  touch-action: none;
}

.frame-color-slider[data-orientation='vertical'] {
  width: 22px;
  height: 160px;
}

.frame-color-track {
  display: block;
  flex: 1;
  height: 12px;
  border-radius: var(--frame-control-radius);
}

.frame-color-slider[data-orientation='vertical'] .frame-color-track {
  height: 100%;
  width: 12px;
  flex: initial;
}
</style>
