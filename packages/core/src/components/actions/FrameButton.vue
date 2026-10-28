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
      /** Visual treatment applied to the button. */
      variant?: 'ghost' | 'primary' | 'secondary';
      /** Text used as fallback content when the default slot is omitted. */
      label?: string;
      /** Icon displayed before button content. */
      icon?: string;
      /** Disables native button activation. */
      disabled?: boolean;
      /** Native button behavior within a form. */
      type?: 'button' | 'submit' | 'reset';
    }
  >(),
  {tooltip: undefined, variant: 'ghost', type: 'button'}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{
  /** Native click event from the button. */ click: [event: MouseEvent];
}>();
const element = ref<HTMLButtonElement>();
defineSlots<{
  /** Button content; replaces the label fallback while retaining the leading icon. */
  default?(): unknown;
  /** Custom tooltip content; replaces the tooltip text. */
  tooltip?(): unknown;
}>();
defineExpose({
  /** Native button element, undefined before mounting; refs unwrap on the public instance. */
  element,
  /** Focuses the native button when mounted. */
  focus: () => {
    element.value?.focus();
  },
});
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
