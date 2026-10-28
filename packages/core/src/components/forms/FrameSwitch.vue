<script setup lang="ts">
import {SwitchRoot, SwitchThumb, Label} from 'reka-ui';
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
  <Label class="frame-form-inline frame-form-inline-layout"
    ><FrameControlTooltip
      :tooltip="tooltipText"
      :tooltip-placement="tooltipPlacement"
      ><template #default="{describedby}"
        ><SwitchRoot
          v-bind="controlAttrs"
          :aria-describedby="describedBy(describedby)"
          class="frame-switch frame-control-focus frame-control-disabled"
          :model-value="modelValue"
          :disabled="disabled"
          @update:model-value="emit('update:modelValue', $event)"
          ><SwitchThumb class="frame-switch-thumb" /></SwitchRoot></template
      ><template v-if="$slots.tooltip" #tooltip
        ><slot name="tooltip" /></template></FrameControlTooltip
    ><slot>{{ label }}</slot></Label
  >
</template>

<style lang="scss">
.frame-switch {
  display: inline-flex;
  align-items: center;
  width: 32px;
  height: 18px;
  border: 1px solid var(--frame-line, #454545);
  border-radius: 999px;
  background: var(--frame-surface, #242424);
  padding: 2px;
  box-sizing: border-box;
  cursor: pointer;
}

.frame-switch[data-state='checked'] {
  background: var(--frame-accent, #0078d4);
}

.frame-switch-thumb {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--frame-text, #ccc);
  transition: transform var(--frame-duration, 150ms) var(--frame-ease, ease-out);
}

.frame-switch-thumb[data-state='checked'] {
  transform: translateX(14px);
}
</style>
