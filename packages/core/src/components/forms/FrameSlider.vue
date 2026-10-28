<script setup lang="ts">
import {SliderRoot, SliderTrack, SliderRange, SliderThumb} from 'reka-ui';
import './styles/controls.scss';

defineOptions({inheritAttrs: false});
withDefaults(
  defineProps<{
    modelValue: number;
    name?: string;
    form?: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }>(),
  {min: 0, max: 100, step: 1}
);
const emit = defineEmits<{'update:modelValue': [value: number]}>();
</script>
<template>
  <SliderRoot
    name=""
    :required="required"
    class="frame-slider frame-slider-root frame-control-disabled"
    :model-value="[modelValue]"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event?.[0] ?? modelValue)"
    ><SliderTrack class="frame-slider-track"
      ><SliderRange class="frame-slider-range" /></SliderTrack
    ><SliderThumb
      v-bind="$attrs"
      class="frame-slider-thumb frame-control-focus" /></SliderRoot
  ><input
    v-if="name"
    type="hidden"
    :name="name"
    :form="form"
    :value="modelValue"
    :disabled="disabled"
  />
</template>

<style lang="scss">
.frame-slider-root {
  position: relative;
  display: flex;
  align-items: center;
  height: 20px;
  touch-action: none;
  user-select: none;
}

.frame-slider-track {
  position: relative;
  flex: 1;
  height: 4px;
  background: var(--frame-line, #454545);
  border-radius: 999px;
}

.frame-slider-range {
  position: absolute;
  height: 100%;
  background: var(--frame-accent, #0078d4);
}

.frame-slider-thumb {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--frame-text, #ccc);
}
</style>

<style lang="scss">
.frame-slider {
  width: var(--frame-slider-width, min(100%, 340px));
  accent-color: var(--frame-accent);
}
</style>
