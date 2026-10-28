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
      /** Controlled checked state; indeterminate values are not exposed by this wrapper. */
      modelValue?: boolean;
      /** Prevents user interaction with the control. */
      disabled?: boolean;
      /** Label content displayed beside the checkbox when the default slot is absent. */
      label?: string;
    }
  >(),
  {tooltip: undefined, modelValue: false}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: boolean];
}>();

defineSlots<{
  /** Label content beside the checkbox; defaults to label. */
  default?(): unknown;
  /** Custom tooltip content; replaces the tooltip text. */
  tooltip?(): unknown;
}>();
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
  /* Space between children for .frame-checkbox. @token --frame-checkbox-gap */
  --_frame-default-checkbox-gap-aef76cbc8f: 8px;
  gap: var(--frame-checkbox-gap, var(--_frame-default-checkbox-gap-aef76cbc8f));
  color: inherit;
  font: inherit;
  cursor: pointer;
  /* Text line height for .frame-checkbox. @token --frame-checkbox-line-height */
  --_frame-default-checkbox-line-height-b83cfdaaa7: 18px;
  line-height: var(
    --frame-checkbox-line-height,
    var(--_frame-default-checkbox-line-height-b83cfdaaa7)
  );
}
.frame-checkbox input[type='checkbox'] {
  appearance: none;
  position: relative;
  /* Width for .frame-checkbox input[type='checkbox']. @token --frame-checkbox-input-width */
  --_frame-default-checkbox-input-width-7215454c72: 18px;
  width: var(
    --frame-checkbox-input-width,
    var(--_frame-default-checkbox-input-width-7215454c72)
  ); /* Height for .frame-checkbox input[type='checkbox']. @token --frame-checkbox-input-height */
  --_frame-default-checkbox-input-height-f6ec95a448: 18px;
  height: var(
    --frame-checkbox-input-height,
    var(--_frame-default-checkbox-input-height-f6ec95a448)
  );
  flex: 0 0 18px;
  /* Outer spacing for .frame-checkbox input[type='checkbox']. @token --frame-checkbox-input-margin */
  --_frame-default-checkbox-input-margin-eb48aa24fb: 0;
  margin: var(
    --frame-checkbox-input-margin,
    var(--_frame-default-checkbox-input-margin-eb48aa24fb)
  ); /* Border for .frame-checkbox input[type='checkbox']. @token --frame-checkbox-input-border */
  --_frame-default-checkbox-input-border-788bedd99c: 1px solid #6b6b6b;
  border: var(
    --frame-checkbox-input-border,
    var(--_frame-default-checkbox-input-border-788bedd99c)
  ); /* Corner radius for .frame-checkbox input[type='checkbox']. @token --frame-checkbox-input-border-radius */
  --_frame-default-checkbox-input-border-radius-17f1ebbc01: var(
    --frame-radius-medium
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-checkbox-input-border-radius,
    var(--_frame-default-checkbox-input-border-radius-17f1ebbc01)
  ); /* Background for .frame-checkbox input[type='checkbox']. @token --frame-checkbox-input-background */
  --_frame-default-checkbox-input-background-03cd7e822e: #242424;
  background: var(
    --frame-checkbox-input-background,
    var(--_frame-default-checkbox-input-background-03cd7e822e)
  );
  cursor: inherit;
}
.frame-checkbox input:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  /* Width for .frame-checkbox input:checked::after. @token --frame-checkbox-input-checked-after-width */
  --_frame-default-checkbox-input-checked-after-width-492c55b093: 5px;
  width: var(
    --frame-checkbox-input-checked-after-width,
    var(--_frame-default-checkbox-input-checked-after-width-492c55b093)
  ); /* Height for .frame-checkbox input:checked::after. @token --frame-checkbox-input-checked-after-height */
  --_frame-default-checkbox-input-checked-after-height-46caf285e4: 10px;
  height: var(
    --frame-checkbox-input-checked-after-height,
    var(--_frame-default-checkbox-input-checked-after-height-46caf285e4)
  ); /* Border for .frame-checkbox input:checked::after. @token --frame-checkbox-input-checked-after-border */
  --_frame-default-checkbox-input-checked-after-border-53c7e3223a: solid #d4d4d4;
  border: var(
    --frame-checkbox-input-checked-after-border,
    var(--_frame-default-checkbox-input-checked-after-border-53c7e3223a)
  ); /* Border width for .frame-checkbox input:checked::after. @token --frame-checkbox-input-checked-after-border-width */
  --_frame-default-checkbox-input-checked-after-border-width-991296be8f: 0 1.5px
    1.5px 0;
  border-width: var(
    --frame-checkbox-input-checked-after-border-width,
    var(--_frame-default-checkbox-input-checked-after-border-width-991296be8f)
  );
  transform: rotate(45deg);
}
.frame-checkbox:has(input:disabled) {
  /* Opacity for .frame-checkbox:has(input:disabled). @token --frame-checkbox-has-input-disabled-opacity */
  --_frame-default-checkbox-has-input-disabled-opacity-2e1b27fc45: 0.45;
  opacity: var(
    --frame-checkbox-has-input-disabled-opacity,
    var(--_frame-default-checkbox-has-input-disabled-opacity-2e1b27fc45)
  );
  cursor: default;
}
</style>
