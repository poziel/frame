<script setup lang="ts">
import {
  FieldRoot,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  useForwardProps,
} from 'reka-ui';
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {computed} from 'vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';
import type {FieldRootProps} from 'reka-ui';
import './styles/advanced.scss';

const props = withDefaults(
  defineProps<
    FieldRootProps &
      ControlTooltipProps & {
        /** Label rendered before the slotted control. */
        label?: string;
        /** Supporting description associated with the control. */
        description?: string;
        /** Explicit validation error; also marks the field invalid. */
        error?: string;
      }
  >(),
  {tooltip: undefined}
);
defineOptions({inheritAttrs: false});
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const forwarded = useForwardProps(
  computed(() => {
    const {tooltip, tooltipPlacement, ...root} = props;
    return root;
  })
);

defineSlots<{
  /** Form control composed through the field primitive to associate labels and descriptions. */
  default?(): unknown;
  /** Custom tooltip content for the field. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <FrameControlTooltip
    :tooltip="tooltipText"
    :tooltip-placement="tooltipPlacement"
    ><template #default="{describedby}"
      ><FieldRoot
        v-bind="{...controlAttrs, ...forwarded}"
        :invalid="invalid || !!error"
        class="frame-field"
        ><FieldLabel v-if="label" class="frame-field-label">{{
          label
        }}</FieldLabel
        ><FieldControl as-child :aria-describedby="describedBy(describedby)"
          ><slot /></FieldControl
        ><FieldDescription v-if="description" class="frame-field-description">{{
          description
        }}</FieldDescription
        ><FieldError class="frame-field-error"
          ><template v-if="error">{{ error }}</template></FieldError
        ></FieldRoot
      ></template
    ><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template
  ></FrameControlTooltip>
</template>

<style lang="scss">
.frame-field :is(input, textarea, select) {
  font: inherit;
}

.frame-field {
  display: flex;
  flex-direction: column;
  /* Standard space between related content items and control children. @token --frame-gap @context */
  gap: var(--frame-gap);
  min-width: 0;
}

.frame-field-label {
  font-weight: 500;
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
}

.frame-field-error {
  font-size: 11px;
  /* Foreground of field validation messages. @token --frame-danger */
  --_frame-default-danger-125: #f48771;
  color: var(--frame-danger, var(--_frame-default-danger-125));
}

.frame-field [data-invalid],
.frame-field [aria-invalid='true'] {
  /* Foreground of field validation messages. @token --frame-danger */
  --_frame-default-danger-125: #f48771;
  border-color: var(--frame-danger, var(--_frame-default-danger-125));
}
</style>
