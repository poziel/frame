<script setup lang="ts">
import {SliderRoot, SliderTrack, SliderRange, SliderThumb} from 'reka-ui';
import './shared/controls.css';

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
    class="frame-slider frame-slider-root"
    :model-value="[modelValue]"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event?.[0] ?? modelValue)"
    ><SliderTrack class="frame-slider-track"
      ><SliderRange class="frame-slider-range" /></SliderTrack
    ><SliderThumb v-bind="$attrs" class="frame-slider-thumb" /></SliderRoot
  ><input
    v-if="name"
    type="hidden"
    :name="name"
    :form="form"
    :value="modelValue"
    :disabled="disabled"
  />
</template>
