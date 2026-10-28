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

<style lang="scss">
button.frame-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Space between the button icon and label. @token --frame-button-frame-button-gap */
  --_frame-default-button-frame-button-gap: 7px;
  gap: var(
    --frame-button-frame-button-gap,
    var(--_frame-default-button-frame-button-gap)
  ); /* Minimum height of an ordinary button. @token --frame-button-frame-button-min-height */
  --_frame-default-button-frame-button-min-height: 28px;
  min-height: var(
    --frame-button-frame-button-min-height,
    var(--_frame-default-button-frame-button-min-height)
  ); /* Vertical inset inside ordinary controls and text-entry surfaces. @token --frame-control-padding-y @context */
  /* Horizontal inset inside ordinary controls and text-entry surfaces. @token --frame-control-padding-x @context */
  padding: var(--frame-control-padding-y) var(--frame-control-padding-x); /* Resting button border, including its width and style. @token --frame-button-frame-button-border */
  --_frame-default-button-frame-button-border: 1px solid transparent;
  border: var(
    --frame-button-frame-button-border,
    var(--_frame-default-button-frame-button-border)
  ); /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(
    --frame-control-radius
  ); /* Foreground of a button without an explicit variant override. @token --frame-button-frame-button-color */
  --_frame-default-button-frame-button-color: #d4d4d4;
  color: var(
    --frame-button-frame-button-color,
    var(--_frame-default-button-frame-button-color)
  );
  font: inherit;
  cursor: pointer;
  /* Resting surface of a button without a variant fill. @token --frame-button-frame-button-background */
  --_frame-default-button-frame-button-background: transparent;
  background: var(
    --frame-button-frame-button-background,
    var(--_frame-default-button-frame-button-background)
  );
}
button.frame-button.ghost:hover:not(:disabled) {
  /* Hover surface of an enabled ghost button. @token --frame-button-frame-button-ghost-hover-not-disabled-background */
  --_frame-default-button-frame-button-ghost-hover-not-disabled-background: #ffffff0d;
  background: var(
    --frame-button-frame-button-ghost-hover-not-disabled-background,
    var(
      --_frame-default-button-frame-button-ghost-hover-not-disabled-background
    )
  );
}
button.frame-button.secondary {
  /* Resting fill of the secondary button variant. @token --frame-button-frame-button-secondary-background */
  --_frame-default-button-frame-button-secondary-background: #25292c;
  background: var(
    --frame-button-frame-button-secondary-background,
    var(--_frame-default-button-frame-button-secondary-background)
  ); /* Border color of the secondary button variant. @token --frame-button-frame-button-secondary-border-color */
  --_frame-default-button-frame-button-secondary-border-color: #3c4246;
  border-color: var(
    --frame-button-frame-button-secondary-border-color,
    var(--_frame-default-button-frame-button-secondary-border-color)
  );
}
button.frame-button.secondary:hover:not(:disabled) {
  /* Hover fill of an enabled secondary button. @token --frame-button-frame-button-secondary-hover-not-disabled-background */
  --_frame-default-button-frame-button-secondary-hover-not-disabled-background: #30363a;
  background: var(
    --frame-button-frame-button-secondary-hover-not-disabled-background,
    var(
      --_frame-default-button-frame-button-secondary-hover-not-disabled-background
    )
  );
}
button.frame-button.primary {
  /* Fill of the primary button variant, following the active accent by default. @token --frame-button-primary-background */
  --_frame-default-button-primary-background: var(--frame-accent);
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  background: var(
    --frame-button-primary-background,
    var(--_frame-default-button-primary-background)
  ); /* Border color of the primary button variant. @token --frame-button-primary-border */
  --_frame-default-button-primary-border: transparent;
  border-color: var(
    --frame-button-primary-border,
    var(--_frame-default-button-primary-border)
  ); /* Text and icon foreground on a primary button. @token --frame-button-frame-button-primary-color */
  --_frame-default-button-frame-button-primary-color: #fff;
  color: var(
    --frame-button-frame-button-primary-color,
    var(--_frame-default-button-frame-button-primary-color)
  );
}
button.frame-button.primary:hover:not(:disabled) {
  /* Filter applied while an enabled primary button is hovered. @token --frame-button-primary-hover-filter */
  --_frame-default-button-primary-hover-filter: brightness(1.12);
  filter: var(
    --frame-button-primary-hover-filter,
    var(--_frame-default-button-primary-hover-filter)
  );
}
button.frame-button:disabled {
  /* Opacity applied to a disabled button. @token --frame-button-frame-button-disabled-opacity */
  --_frame-default-button-frame-button-disabled-opacity: 0.45;
  opacity: var(
    --frame-button-frame-button-disabled-opacity,
    var(--_frame-default-button-frame-button-disabled-opacity)
  );
  cursor: default;
}
button.frame-button.frame-icon-button {
  /* Internal padding of the icon button specialization. @token --frame-button-frame-button-frame-icon-button-padding */
  --_frame-default-button-frame-button-frame-icon-button-padding: 0;
  padding: var(
    --frame-button-frame-button-frame-icon-button-padding,
    var(--_frame-default-button-frame-button-frame-icon-button-padding)
  ); /* Minimum height before the icon button geometry applies. @token --frame-button-frame-button-frame-icon-button-min-height */
  --_frame-default-button-frame-button-frame-icon-button-min-height: 0;
  min-height: var(
    --frame-button-frame-button-frame-icon-button-min-height,
    var(--_frame-default-button-frame-button-frame-icon-button-min-height)
  ); /* Border of the icon button specialization. @token --frame-button-frame-button-frame-icon-button-border */
  --_frame-default-button-frame-button-frame-icon-button-border: 0;
  border: var(
    --frame-button-frame-button-frame-icon-button-border,
    var(--_frame-default-button-frame-button-frame-icon-button-border)
  ); /* Gap between content in the icon button specialization. @token --frame-button-frame-button-frame-icon-button-gap */
  --_frame-default-button-frame-button-frame-icon-button-gap: 0;
  gap: var(
    --frame-button-frame-button-frame-icon-button-gap,
    var(--_frame-default-button-frame-button-frame-icon-button-gap)
  );
}
button.frame-button.frame-icon-button.no-hover-highlight:hover {
  /* Hover surface when the icon button suppresses highlighting. @token --frame-button-frame-button-frame-icon-button-no-hover-highlight-hover-background */
  --_frame-default-button-frame-button-frame-icon-button-no-hover-highlight-hover-background: transparent;
  background: var(
    --frame-button-frame-button-frame-icon-button-no-hover-highlight-hover-background,
    var(
      --_frame-default-button-frame-button-frame-icon-button-no-hover-highlight-hover-background
    )
  );
  color: inherit;
}
</style>
