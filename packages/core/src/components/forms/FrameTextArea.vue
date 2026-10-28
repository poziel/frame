<script setup lang="ts">
import {Primitive} from 'reka-ui';
import {ref} from 'vue';

const element = ref<HTMLTextAreaElement>();
defineExpose({
  /** Native textarea element; undefined before mount and unwrapped on component refs. */
  element,
  /** Focuses the native textarea when mounted. */

  focus: () => element.value?.focus(),
});
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      /** Controlled textarea text. */
      modelValue?: string;
      /** Prevents user interaction with the control. */
      disabled?: boolean;
      /** Hint displayed while the editable value is empty. */
      placeholder?: string;
      /** Initial visible row count of the textarea. */
      rows?: number;
    }
  >(),
  {tooltip: undefined, modelValue: '', rows: 4}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string];
}>();

defineSlots<{
  /** Custom tooltip content for the textarea. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <FrameControlTooltip
    :tooltip="tooltipText"
    :tooltip-placement="tooltipPlacement"
    ><template #default="{describedby}"
      ><Primitive as-child>
        <textarea
          ref="element"
          v-bind="controlAttrs"
          :aria-describedby="describedBy(describedby)"
          class="frame-text-area frame-input-surface frame-input-focus-within"
          :value="modelValue"
          :disabled="disabled"
          :placeholder="placeholder"
          :rows="rows"
          @input="
            emit(
              'update:modelValue',
              ($event.target as HTMLTextAreaElement).value
            )
          "
        /></Primitive></template
    ><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template
  ></FrameControlTooltip>
</template>

<style lang="scss">
.frame-text-area {
  /* Width for .frame-text-area. @token --frame-text-area-width */
  --_frame-default-text-area-width-82572cf342: min(100%, 460px);
  width: var(
    --frame-text-area-width,
    var(--_frame-default-text-area-width-82572cf342)
  ); /* Minimum height for .frame-text-area. @token --frame-text-area-min-height */
  --_frame-default-text-area-min-height-e10b48f0bc: 90px;
  min-height: var(
    --frame-text-area-min-height,
    var(--_frame-default-text-area-min-height-e10b48f0bc)
  );
  resize: vertical;
  /* Internal spacing for .frame-text-area. @token --frame-text-area-padding */
  --_frame-default-text-area-padding-82a79339c2: 8px;
  padding: var(
    --frame-text-area-padding,
    var(--_frame-default-text-area-padding-82a79339c2)
  ); /* Foreground for .frame-text-area. @token --frame-text-area-color */
  --_frame-default-text-area-color-2c5b678495: var(--frame-control-text);
  /* Foreground for text and icons on resting control surfaces. @token --frame-control-text @context */
  color: var(
    --frame-text-area-color,
    var(--_frame-default-text-area-color-2c5b678495)
  ); /* Background for .frame-text-area. @token --frame-text-area-background */
  --_frame-default-text-area-background-7fc43b0f55: var(
    --frame-control-background
  );
  /* Resting fill of text-entry controls and other control surfaces. @token --frame-control-background @context */
  background: var(
    --frame-text-area-background,
    var(--_frame-default-text-area-background-7fc43b0f55)
  ); /* Border for .frame-text-area. @token --frame-text-area-border */
  --_frame-default-text-area-border-0dc88e7ecf: 1px solid
    var(--frame-control-border);
  /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border: var(
    --frame-text-area-border,
    var(--_frame-default-text-area-border-0dc88e7ecf)
  ); /* Corner radius of the text area. @token --frame-text-area-border-radius */
  --_frame-default-text-area-border-radius-9: var(--frame-input-radius);
  /* Shared corner radius for text fields, text areas, selects, and composed input surfaces. @token --frame-input-radius @context */
  border-radius: var(
    --frame-text-area-border-radius,
    var(--_frame-default-text-area-border-radius-9)
  );
  font: inherit;
}
</style>
