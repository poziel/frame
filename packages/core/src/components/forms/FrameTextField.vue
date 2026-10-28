<script setup lang="ts">
import {ref, type InputTypeHTMLAttribute} from 'vue';
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      /** Controlled input value; when omitted the native value attribute supplies the display. */
      modelValue?: string | number;
      /** Native input type; number inputs emit numbers for nonempty values and strings when empty. */
      type?: InputTypeHTMLAttribute;
      /** Prevents user interaction with the control. */
      disabled?: boolean;
      /** Hint displayed while the editable value is empty. */
      placeholder?: string;
    }
  >(),
  {tooltip: undefined, type: 'text'}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string | number];
}>();
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
defineExpose({
  /** Native input element; undefined before mount and unwrapped on component refs. */
  element,
  /** Focuses the native input when mounted. */

  focus: () => element.value?.focus(),
});

defineSlots<{
  /** Custom tooltip content for the input. */
  tooltip?(): unknown;
}>();
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
  /* Width for .frame-text-input. @token --frame-text-input-width */
  --_frame-default-text-input-width-8a29c05039: min(100%, 340px);
  width: var(
    --frame-text-input-width,
    var(--_frame-default-text-input-width-8a29c05039)
  ); /* Internal spacing for .frame-text-input. @token --frame-text-input-padding */
  --_frame-default-text-input-padding-bf91bcf2c1: 6px 8px;
  padding: var(
    --frame-text-input-padding,
    var(--_frame-default-text-input-padding-bf91bcf2c1)
  ); /* Minimum height for .frame-text-input. @token --frame-text-input-min-height */
  --_frame-default-text-input-min-height-9a174aa1f9: 28px;
  min-height: var(
    --frame-text-input-min-height,
    var(--_frame-default-text-input-min-height-9a174aa1f9)
  ); /* Foreground for .frame-text-input. @token --frame-text-input-color */
  --_frame-default-text-input-color-cefbc21fee: var(--frame-control-text);
  /* Foreground for text and icons on resting control surfaces. @token --frame-control-text @context */
  color: var(
    --frame-text-input-color,
    var(--_frame-default-text-input-color-cefbc21fee)
  ); /* Background for .frame-text-input. @token --frame-text-input-background */
  --_frame-default-text-input-background-d24bea3c23: var(
    --frame-control-background
  );
  /* Resting fill of text-entry controls and other control surfaces. @token --frame-control-background @context */
  background: var(
    --frame-text-input-background,
    var(--_frame-default-text-input-background-d24bea3c23)
  ); /* Border for .frame-text-input. @token --frame-text-input-border */
  --_frame-default-text-input-border-e0ef072024: 1px solid
    var(--frame-control-border);
  /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border: var(
    --frame-text-input-border,
    var(--_frame-default-text-input-border-e0ef072024)
  ); /* Corner radius of the text input. @token --frame-text-input-border-radius */
  --_frame-default-text-input-border-radius-2: var(--frame-input-radius);
  /* Shared corner radius for text fields, text areas, selects, and composed input surfaces. @token --frame-input-radius @context */
  border-radius: var(
    --frame-text-input-border-radius,
    var(--_frame-default-text-input-border-radius-2)
  );
  font: inherit;
}
.frame-text-input:disabled {
  /* Opacity for .frame-text-input:disabled. @token --frame-text-input-disabled-opacity */
  --_frame-default-text-input-disabled-opacity-095c67d4a3: 0.45;
  opacity: var(
    --frame-text-input-disabled-opacity,
    var(--_frame-default-text-input-disabled-opacity-095c67d4a3)
  );
}
</style>
