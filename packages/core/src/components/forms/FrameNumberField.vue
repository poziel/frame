<script setup lang="ts">
import {
  NumberFieldRoot,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameTextField from './FrameTextField.vue';
import './styles/controls.scss';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      modelValue: number;
      id?: string;
      min?: number;
      max?: number;
      step?: number;
      disabled?: boolean;
      label?: string;
      controls?: 'buttons' | 'none' | 'stacked';
      size?: 'default' | 'compact';
    }
  >(),
  {tooltip: undefined, controls: 'buttons', size: 'default'}
);
const {tooltipText, controlAttrs} = useControlTooltip(props);
const emit = defineEmits<{'update:modelValue': [value: number]}>();
</script>
<template>
  <div
    v-bind="controlAttrs"
    v-if="controls === 'stacked'"
    class="frame-number-field frame-form-inline-layout frame-input-surface frame-input-focus-within"
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
    class="frame-number-field frame-form-inline-layout frame-input-surface frame-input-focus-within"
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
      class="frame-control-button frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
      aria-label="Decrease"
      ><FrameIcon name="remove" :size="12"
    /></NumberFieldDecrement>
    <NumberFieldInput as-child
      ><FrameTextField
        :tooltip="tooltipText"
        :tooltip-placement="tooltipPlacement"
        :id="id"
        class="frame-form-input frame-control-surface frame-control-focus frame-input-surface frame-input-focus-within"
        :aria-label="label"
        ><template v-if="$slots.tooltip" #tooltip
          ><slot name="tooltip" /></template></FrameTextField
    ></NumberFieldInput>
    <NumberFieldIncrement
      v-if="controls === 'buttons'"
      class="frame-control-button frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
      aria-label="Increase"
      ><FrameIcon name="add" :size="12"
    /></NumberFieldIncrement>
  </NumberFieldRoot>
</template>

<style lang="scss">
.frame-number-native::-webkit-inner-spin-button {
  margin: 0;
  padding: 0;
  opacity: 1;
  background: transparent;
}

.frame-number-field[data-controls='stacked'] > .frame-number-native {
  width: 100%;
  max-width: none;
  min-width: 0;
  flex: 1 1 0;
  height: 100%;
  padding: 1px 0 1px 6px;
  background: transparent;
  box-sizing: border-box;
  text-align: right;
}

.frame-number-field > .frame-number-native:disabled {
  opacity: 1;
}
</style>
