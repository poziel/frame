<script setup lang="ts">
import {SwitchRoot, SwitchThumb, Label} from 'reka-ui';
import './shared/controls.css';

defineOptions({inheritAttrs: false});
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      /** Controlled checked state; updates are emitted to the application. */
      modelValue?: boolean;
      /** Prevents changing the checked state through interaction. */
      disabled?: boolean;
      /** Label fallback rendered beside the switch. */
      label?: string;
    }
  >(),
  {tooltip: undefined, modelValue: false}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{
  /** Requests the controlled checked state after interaction. */ 'update:modelValue': [
    value: boolean,
  ];
}>();
defineSlots<{
  /** Label content beside the switch; replaces the label prop. */
  default?(): unknown;
  /** Custom tooltip content; replaces the tooltip text. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <Label class="frame-form-inline"
    ><FrameControlTooltip
      :tooltip="tooltipText"
      :tooltip-placement="tooltipPlacement"
      ><template #default="{describedby}"
        ><SwitchRoot
          v-bind="controlAttrs"
          :aria-describedby="describedBy(describedby)"
          class="frame-switch"
          :model-value="modelValue"
          :disabled="disabled"
          @update:model-value="emit('update:modelValue', $event)"
          ><SwitchThumb class="frame-switch-thumb" /></SwitchRoot></template
      ><template v-if="$slots.tooltip" #tooltip
        ><slot name="tooltip" /></template></FrameControlTooltip
    ><slot>{{ label }}</slot></Label
  >
</template>
