<script setup lang="ts">
import {CheckboxRoot, CheckboxIndicator, Label} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import './shared/controls.css';

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
          class="frame-check-control"
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
