<script setup lang="ts">
import {ref, type InputTypeHTMLAttribute} from 'vue';
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      modelValue?: string | number;
      type?: InputTypeHTMLAttribute;
      disabled?: boolean;
      placeholder?: string;
    }
  >(),
  {tooltip: undefined, type: 'text'}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{'update:modelValue': [value: string | number]}>();
defineOptions({inheritAttrs: false});
const element = ref<HTMLInputElement>();
function input(event: Event) {
  const target = event.target as HTMLInputElement;
  emit(
    'update:modelValue',
    target.type === 'number' && target.value !== ''
      ? target.valueAsNumber
      : target.value
  );
}
defineExpose({element, focus: () => element.value?.focus()});
</script>
<template>
  <FrameControlTooltip
    :tooltip="tooltipText"
    :tooltip-placement="tooltipPlacement"
    ><template #default="{describedby}"
      ><input
        v-bind="controlAttrs"
        :aria-describedby="describedBy(describedby)"
        ref="element"
        class="frame-text-input frame-input-surface frame-input-focus-within"
        :type="type"
        :value="
          modelValue ?? ($attrs.value as string | number | undefined) ?? ''
        "
        :disabled="disabled"
        :placeholder="placeholder"
        @input="input" /></template
    ><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template
  ></FrameControlTooltip>
</template>

<style lang="scss">
.frame-text-input {
  width: var(--frame-text-input-width, min(100%, 340px));
  padding: var(--frame-text-input-padding, 6px 8px);
  min-height: var(--frame-text-input-min-height, 28px);
  color: var(--frame-text-input-color, var(--frame-control-text));
  background: var(
    --frame-text-input-background,
    var(--frame-control-background)
  );
  border: var(--frame-text-input-border, 1px solid var(--frame-control-border));
  border-radius: var(
    --frame-text-input-border-radius,
    var(--frame-input-radius)
  );
  font: inherit;
}
.frame-text-input:disabled {
  opacity: var(--frame-text-input-disabled-opacity, 0.45);
}
</style>
