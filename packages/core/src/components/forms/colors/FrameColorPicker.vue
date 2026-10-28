<script setup lang="ts">
import {computed, ref, useAttrs, watch} from 'vue';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  ColorSwatch,
  colorToString,
  type Color,
} from 'reka-ui';
import FrameHsvRectangle from './FrameHsvRectangle.vue';
import FrameColorField from './FrameColorField.vue';
import {useOverlayBoundary} from '../../overlays/overlays';
import '../styles/advanced.scss';

defineOptions({inheritAttrs: false});
const props = defineProps<{
  /** Controlled color text; interactive color changes emit hexadecimal text. */
  modelValue: string;
  /** Prevents user interaction with the control. */
  disabled?: boolean;
  /** Name of the hidden input included in native form submission. */
  name?: string;
  /** Requires a value when the associated form is validated. */
  required?: boolean;
  /** Identifier of the native form associated with the submitted input. */
  form?: string;
}>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string];
}>();
const attrs = useAttrs();
const label = computed(() => String(attrs['aria-label'] ?? 'Color'));
const open = ref(false),
  anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => anchor.value);
const collisionBoundary = computed(() =>
  typeof target.value === 'string' ? undefined : target.value
);
const limits = computed(() => ({
  maxHeight: Math.max(0, bounds.value.height - 16) + 'px',
  maxWidth: Math.max(0, bounds.value.width - 16) + 'px',
}));
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) open.value = false;
  }
);
function update(value: string | Color) {
  if (!props.disabled)
    emit(
      'update:modelValue',
      typeof value === 'string' ? value : colorToString(value, 'hex')
    );
}
</script>
<template>
  <PopoverRoot v-model:open="open">
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      :form="form"
    />
    <span ref="anchor" class="frame-color-picker-anchor">
      <input
        v-if="required"
        class="frame-color-validation"
        tabindex="-1"
        aria-hidden="true"
        :value="modelValue"
        :disabled="disabled"
        :form="form"
        required
        @invalid="open = true"
      />
      <PopoverTrigger
        v-bind="$attrs"
        :aria-label="label"
        :disabled="disabled"
        class="frame-color-picker frame-color-trigger"
      >
        <ColorSwatch :color="modelValue" class="frame-color-trigger-swatch" />
      </PopoverTrigger>
    </span>
    <PopoverPortal :to="target">
      <PopoverContent
        :aria-label="label"
        class="frame-color-picker-popover frame-overlay-surface"
        :collision-boundary="collisionBoundary"
        :collision-padding="8"
        :side-offset="4"
        :style="limits"
      >
        <FrameHsvRectangle
          :model-value="modelValue"
          :disabled="disabled"
          @update:model-value="update"
        />
        <FrameColorField
          :model-value="modelValue"
          :disabled="disabled"
          :aria-label="label + ' value'"
          :aria-describedby="$attrs['aria-describedby']"
          :required="required"
          @update:model-value="update"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
<style lang="scss">
.frame-color-validation {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.frame-color-picker-anchor {
  display: inline-flex;
}
.frame-color-picker.frame-color-trigger {
  display: inline-flex;
  width: 70px;
  height: 36px;
  box-sizing: border-box;
  padding: 3px;
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border: 1px solid var(--frame-line); /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(
    --frame-control-radius
  ); /* Content canvas background used by workspace panes and recessed content. @token --frame-canvas @context */
  background: var(--frame-canvas);
  cursor: pointer;
}
.frame-color-trigger:disabled {
  opacity: 0.5;
  cursor: default;
}
.frame-color-trigger:focus-visible {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  outline: 1px solid var(--frame-accent);
  outline-offset: 2px;
}
.frame-color-trigger-swatch {
  display: block;
  width: 100%;
  height: 100%;
  /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(--frame-control-radius);
}
.frame-color-picker-popover {
  display: grid;
  /* Standard space between related content items and control children. @token --frame-gap @context */
  gap: var(--frame-gap);
  box-sizing: border-box;
  /* Standard inset around content in panels, disclosures, and application surfaces. @token --frame-content-padding @context */
  padding: var(
    --frame-content-padding
  ); /* Shared translucent fill for floating surfaces over the application canvas. @token --frame-overlay-background @context */
  background: var(
    --frame-overlay-background
  ); /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(
    --frame-text
  ); /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border: 1px solid var(--frame-line); /* Shared corner radius of panel containers and larger floating surfaces. @token --frame-panel-radius @context */
  border-radius: var(
    --frame-panel-radius
  ); /* Elevation shadow separating floating overlays from underlying content. @token --frame-overlay-shadow @context */
  box-shadow: var(
    --frame-overlay-shadow
  ); /* Primary font family inherited by shell content and ordinary controls. @token --frame-font-body @context */
  font-family: var(
    --frame-font-body
  ); /* Base text size inherited by shell content and ordinary controls. @token --frame-font-size-body @context */
  font-size: var(--frame-font-size-body);
  overflow: auto;
  pointer-events: auto;
  z-index: 125;
}
.frame-color-picker-popover .frame-advanced-input {
  width: 220px;
  max-width: 100%;
}
</style>

<style lang="scss">
.frame-color-picker {
  /* Width for .frame-color-picker. @token --frame-color-picker-width */
  --_frame-default-color-picker-width-93bdb05d22: 70px;
  width: var(
    --frame-color-picker-width,
    var(--_frame-default-color-picker-width-93bdb05d22)
  ); /* Height for .frame-color-picker. @token --frame-color-picker-height */
  --_frame-default-color-picker-height-8323ad334f: 36px;
  height: var(
    --frame-color-picker-height,
    var(--_frame-default-color-picker-height-8323ad334f)
  ); /* Internal spacing for .frame-color-picker. @token --frame-color-picker-padding */
  --_frame-default-color-picker-padding-7ac33b896d: 3px;
  padding: var(
    --frame-color-picker-padding,
    var(--_frame-default-color-picker-padding-7ac33b896d)
  ); /* Border for .frame-color-picker. @token --frame-color-picker-border */
  --_frame-default-color-picker-border-cb31552a65: 1px solid #3c4246;
  border: var(
    --frame-color-picker-border,
    var(--_frame-default-color-picker-border-cb31552a65)
  ); /* Corner radius for .frame-color-picker. @token --frame-color-picker-border-radius */
  --_frame-default-color-picker-border-radius-92adb8016d: var(
    --frame-radius-medium
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-color-picker-border-radius,
    var(--_frame-default-color-picker-border-radius-92adb8016d)
  ); /* Background for .frame-color-picker. @token --frame-color-picker-background */
  --_frame-default-color-picker-background-00250f87fa: #1b1d1e;
  background: var(
    --frame-color-picker-background,
    var(--_frame-default-color-picker-background-00250f87fa)
  );
}
</style>
