<script setup lang="ts">
import {Primitive} from 'reka-ui';
import {ref} from 'vue';

const element = ref<HTMLTextAreaElement>();
defineExpose({element, focus: () => element.value?.focus()});
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      modelValue?: string;
      disabled?: boolean;
      placeholder?: string;
      rows?: number;
    }
  >(),
  {tooltip: undefined, modelValue: '', rows: 4}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{'update:modelValue': [value: string]}>();
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
  width: var(--frame-text-area-width, min(100%, 460px));
  min-height: var(--frame-text-area-min-height, 90px);
  resize: vertical;
  padding: var(--frame-text-area-padding, 8px);
  color: var(--frame-text-area-color, var(--frame-control-text));
  background: var(
    --frame-text-area-background,
    var(--frame-control-background)
  );
  border: var(--frame-text-area-border, 1px solid var(--frame-control-border));
  border-radius: var(
    --frame-text-area-border-radius,
    var(--frame-input-radius)
  );
  font: inherit;
}
</style>
