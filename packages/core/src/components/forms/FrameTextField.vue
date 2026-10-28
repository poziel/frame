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
        class="frame-text-input"
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
