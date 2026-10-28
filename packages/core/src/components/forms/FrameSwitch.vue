<script setup lang="ts">
import {SwitchRoot, SwitchThumb, Label} from 'reka-ui';
import './styles/controls.scss';

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
  /* Border for .frame-switch. @token --frame-line */
  --_frame-default-line-ff02b7d326: #454545;
  border: 1px solid var(--frame-line, var(--_frame-default-line-ff02b7d326));
  border-radius: 999px;
  /* Background for .frame-switch. @token --frame-surface */
  --_frame-default-surface-63d5630960: #242424;
  background: var(--frame-surface, var(--_frame-default-surface-63d5630960));
  padding: 2px;
  box-sizing: border-box;
  cursor: pointer;
}

.frame-switch[data-state='checked'] {
  /* Elevation shadow for .frame-switch[data-state='checked']. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  background: var(--frame-accent, var(--_frame-default-accent-1583861c13));
}

.frame-switch-thumb {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  /* Foreground for .frame-switch-thumb. @token --frame-text */
  --_frame-default-text-11eec91da6: #ccc;
  background: var(
    --frame-text,
    var(--_frame-default-text-11eec91da6)
  ); /* Duration of the switch thumb movement. @token --frame-duration */
  --_frame-default-duration: 150ms;
  /* Timing curve of the switch thumb movement. @token --frame-ease */
  --_frame-default-ease: ease-out;
  transition: transform var(--frame-duration, var(--_frame-default-duration))
    var(--frame-ease, var(--_frame-default-ease));
}

.frame-switch-thumb[data-state='checked'] {
  transform: translateX(14px);
}
</style>
