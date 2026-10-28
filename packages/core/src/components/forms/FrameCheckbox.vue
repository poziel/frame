<script setup lang="ts">
import {CheckboxRoot, CheckboxIndicator, Label} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import './styles/controls.scss';

defineOptions({inheritAttrs: false});
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      modelValue?: boolean;
      disabled?: boolean;
      label?: string;
    }
  >(),
  {tooltip: undefined, modelValue: false}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{'update:modelValue': [value: boolean]}>();
</script>
<template>
  <Label class="frame-checkbox"
    ><FrameControlTooltip
      :tooltip="tooltipText"
      :tooltip-placement="tooltipPlacement"
      ><template #default="{describedby}"
        ><CheckboxRoot
          v-bind="controlAttrs"
          :aria-describedby="describedBy(describedby)"
          class="frame-check-control frame-control-surface frame-control-action frame-control-focus frame-control-disabled"
          :model-value="modelValue"
          :disabled="disabled"
          @update:model-value="emit('update:modelValue', $event === true)"
          ><CheckboxIndicator class="frame-check-indicator"
            ><FrameIcon
              name="check"
              :size="14" /></CheckboxIndicator></CheckboxRoot></template
      ><template v-if="$slots.tooltip" #tooltip
        ><slot name="tooltip" /></template></FrameControlTooltip
    ><span v-if="label || $slots.default"
      ><slot>{{ label }}</slot></span
    ></Label
  >
</template>

<style lang="scss">
.frame-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--frame-checkbox-gap, 8px);
  color: inherit;
  font: inherit;
  cursor: pointer;
  line-height: var(--frame-checkbox-line-height, 18px);
}
.frame-checkbox input[type='checkbox'] {
  appearance: none;
  position: relative;
  width: var(--frame-checkbox-input-width, 18px);
  height: var(--frame-checkbox-input-height, 18px);
  flex: 0 0 18px;
  margin: var(--frame-checkbox-input-margin, 0);
  border: var(--frame-checkbox-input-border, 1px solid #6b6b6b);
  border-radius: var(
    --frame-checkbox-input-border-radius,
    var(--frame-radius-medium)
  );
  background: var(--frame-checkbox-input-background, #242424);
  cursor: inherit;
}
.frame-checkbox input:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: var(--frame-checkbox-input-checked-after-width, 5px);
  height: var(--frame-checkbox-input-checked-after-height, 10px);
  border: var(--frame-checkbox-input-checked-after-border, solid #d4d4d4);
  border-width: var(
    --frame-checkbox-input-checked-after-border-width,
    0 1.5px 1.5px 0
  );
  transform: rotate(45deg);
}
.frame-checkbox:has(input:disabled) {
  opacity: var(--frame-checkbox-has-input-disabled-opacity, 0.45);
  cursor: default;
}
</style>
