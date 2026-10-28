<script setup lang="ts">
import {SliderRoot, SliderTrack, SliderRange, SliderThumb} from 'reka-ui';
import './styles/controls.scss';

defineOptions({inheritAttrs: false});
withDefaults(
  defineProps<{
    /** Controlled numeric value represented by the single slider thumb. */
    modelValue: number;
    /** Name of the hidden input included in native form submission. */
    name?: string;
    /** Identifier of the native form associated with the submitted input. */
    form?: string;
    /** Requires a value when the associated form is validated. */
    required?: boolean;
    /** Smallest value accepted by the numeric control. */
    min?: number;
    /** Largest value accepted by the numeric control. */
    max?: number;
    /** Increment used for keyboard, pointer, and stepper changes. */
    step?: number;
    /** Prevents user interaction with the control. */
    disabled?: boolean;
  }>(),
  {min: 0, max: 100, step: 1}
);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: number];
}>();
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
  /* Border for .frame-slider-track. @token --frame-line */
  --_frame-default-line-ff02b7d326: #454545;
  background: var(--frame-line, var(--_frame-default-line-ff02b7d326));
  border-radius: 999px;
}

.frame-slider-range {
  position: absolute;
  height: 100%;
  /* Elevation shadow for .frame-slider-range. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  background: var(--frame-accent, var(--_frame-default-accent-1583861c13));
}

.frame-slider-thumb {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  /* Foreground for .frame-slider-thumb. @token --frame-text */
  --_frame-default-text-11eec91da6: #ccc;
  background: var(--frame-text, var(--_frame-default-text-11eec91da6));
}
</style>

<style lang="scss">
.frame-slider {
  /* Width for .frame-slider. @token --frame-slider-width */
  --_frame-default-slider-width-b27ae231e5: min(100%, 340px);
  width: var(
    --frame-slider-width,
    var(--_frame-default-slider-width-b27ae231e5)
  ); /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  accent-color: var(--frame-accent);
}
</style>
