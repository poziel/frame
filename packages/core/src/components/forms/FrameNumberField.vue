<script setup lang="ts">
import {
  NumberFieldRoot,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameTextField from './FrameTextField.vue';
import './shared/controls.css';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      /** Controlled numeric value of the input. */
      modelValue: number;
      /** Id applied to the editable input. */
      id?: string;
      /** Smallest value accepted by the numeric control. */
      min?: number;
      /** Largest value accepted by the numeric control. */
      max?: number;
      /** Increment used for keyboard, pointer, and stepper changes. */
      step?: number;
      /** Prevents user interaction with the control. */
      disabled?: boolean;
      /** Accessible name of the control. */
      label?: string;
      /** Chooses button steppers, a native input without buttons, or stacked steppers. */
      controls?: 'buttons' | 'none' | 'stacked';
      /** Selects the default or compact number-field presentation. */
      size?: 'default' | 'compact';
    }
  >(),
  {tooltip: undefined, controls: 'buttons', size: 'default'}
);
const {tooltipText, controlAttrs} = useControlTooltip(props);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: number];
}>();

defineSlots<{
  /** Custom tooltip content for the numeric input. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <div
    v-bind="controlAttrs"
    v-if="controls === 'stacked'"
    class="frame-number-field"
    :data-controls="controls"
    :data-size="size"
    :data-disabled="disabled || undefined"
  >
    <FrameTextField
      :tooltip="tooltipText"
      :tooltip-placement="tooltipPlacement"
      class="frame-number-native"
      :id="id"
      type="number"
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="label"
      @update:model-value="
        emit(
          'update:modelValue',
          typeof $event === 'number' ? $event : Number($event)
        )
      "
      ><template v-if="$slots.tooltip" #tooltip
        ><slot name="tooltip" /></template
    ></FrameTextField>
  </div>
  <NumberFieldRoot
    v-bind="controlAttrs"
    v-else
    class="frame-number-field"
    :data-controls="controls"
    :data-size="size"
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event ?? Number.NaN)"
  >
    <NumberFieldDecrement
      v-if="controls === 'buttons'"
      class="frame-control-button"
      aria-label="Decrease"
      ><FrameIcon name="remove" :size="12"
    /></NumberFieldDecrement>
    <NumberFieldInput as-child
      ><FrameTextField
        :tooltip="tooltipText"
        :tooltip-placement="tooltipPlacement"
        :id="id"
        class="frame-form-input"
        :aria-label="label"
        ><template v-if="$slots.tooltip" #tooltip
          ><slot name="tooltip" /></template></FrameTextField
    ></NumberFieldInput>
    <NumberFieldIncrement
      v-if="controls === 'buttons'"
      class="frame-control-button"
      aria-label="Increase"
      ><FrameIcon name="add" :size="12"
    /></NumberFieldIncrement>
  </NumberFieldRoot>
</template>
