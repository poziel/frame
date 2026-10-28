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
          class="frame-text-area"
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
