<script setup lang="ts">
import {ref} from 'vue';
import {Primitive} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {
  useControlTooltip,
  type ControlTooltipProps,
} from '../forms/shared/tooltip';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      variant?: 'ghost' | 'primary' | 'secondary';
      label?: string;
      icon?: string;
      disabled?: boolean;
      type?: 'button' | 'submit' | 'reset';
    }
  >(),
  {tooltip: undefined, variant: 'ghost', type: 'button'}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{click: [event: MouseEvent]}>();
const element = ref<HTMLButtonElement>();
defineExpose({element, focus: () => element.value?.focus()});
</script>
<template>
  <FrameControlTooltip
    :tooltip="tooltipText"
    :tooltip-placement="tooltipPlacement"
    ><template #default="{describedby}"
      ><Primitive as-child
        ><button
          ref="element"
          v-bind="controlAttrs"
          :aria-describedby="describedBy(describedby)"
          class="frame-button"
          :class="variant"
          :type="type"
          :disabled="disabled"
          @click="emit('click', $event)"
          ><FrameIcon v-if="icon" :name="icon" :size="16" /><slot>{{
            label
          }}</slot></button
        ></Primitive
      ></template
    ><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template
  ></FrameControlTooltip>
</template>

<style lang="scss">
button.frame-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--frame-button-frame-button-gap, 7px);
  min-height: var(--frame-button-frame-button-min-height, 28px);
  padding: var(--frame-control-padding-y) var(--frame-control-padding-x);
  border: var(--frame-button-frame-button-border, 1px solid transparent);
  border-radius: var(--frame-control-radius);
  color: var(--frame-button-frame-button-color, #d4d4d4);
  font: inherit;
  cursor: pointer;
  background: var(--frame-button-frame-button-background, transparent);
}
button.frame-button.ghost:hover:not(:disabled) {
  background: var(
    --frame-button-frame-button-ghost-hover-not-disabled-background,
    #ffffff0d
  );
}
button.frame-button.secondary {
  background: var(--frame-button-frame-button-secondary-background, #25292c);
  border-color: var(
    --frame-button-frame-button-secondary-border-color,
    #3c4246
  );
}
button.frame-button.secondary:hover:not(:disabled) {
  background: var(
    --frame-button-frame-button-secondary-hover-not-disabled-background,
    #30363a
  );
}
button.frame-button.primary {
  background: var(--frame-button-primary-background, var(--frame-accent));
  border-color: var(--frame-button-primary-border, transparent);
  color: var(--frame-button-frame-button-primary-color, #fff);
}
button.frame-button.primary:hover:not(:disabled) {
  filter: var(--frame-button-primary-hover-filter, brightness(1.12));
}
button.frame-button:disabled {
  opacity: var(--frame-button-frame-button-disabled-opacity, 0.45);
  cursor: default;
}
button.frame-button.frame-icon-button {
  padding: var(--frame-button-frame-button-frame-icon-button-padding, 0);
  min-height: var(--frame-button-frame-button-frame-icon-button-min-height, 0);
  border: var(--frame-button-frame-button-frame-icon-button-border, 0);
  gap: var(--frame-button-frame-button-frame-icon-button-gap, 0);
}
button.frame-button.frame-icon-button.no-hover-highlight:hover {
  background: var(
    --frame-button-frame-button-frame-icon-button-no-hover-highlight-hover-background,
    transparent
  );
  color: inherit;
}
</style>
