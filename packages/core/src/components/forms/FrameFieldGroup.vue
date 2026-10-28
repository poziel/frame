<script setup lang="ts">
import './styles/controls.scss';

defineProps<{
  /** Prevents user interaction with the control. */
  disabled?: boolean;
}>();

defineSlots<{
  /** Input control displayed between the optional addons. */
  default?(): unknown;
  /** Addon displayed before the input control. */
  prefix?(): unknown;
  /** Addon displayed after the input control. */
  suffix?(): unknown;
}>();
</script>
<template>
  <div
    class="frame-input-group frame-input-surface"
    role="group"
    :data-disabled="disabled || undefined"
    :aria-disabled="disabled || undefined"
  >
    <span v-if="$slots.prefix" class="frame-input-addon" data-side="prefix"
      ><slot name="prefix"
    /></span>
    <div class="frame-input-group-control"><slot /></div>
    <span v-if="$slots.suffix" class="frame-input-addon" data-side="suffix"
      ><slot name="suffix"
    /></span>
  </div>
</template>

<style lang="scss">
.frame-input-group {
  display: inline-flex;
  align-items: stretch;
  /* Preferred width of the grouped input surface. @token --frame-input-group-width */
  --_frame-default-input-group-width-115: min(100%, 340px);
  width: var(
    --frame-input-group-width,
    var(--_frame-default-input-group-width-115)
  );
  min-width: 0;
  /* Surface behind the grouped input and its addons. @token --frame-input-group-background */
  --_frame-default-input-group-background-116: var(--frame-control-background);
  /* Resting fill of text-entry controls and other control surfaces. @token --frame-control-background @context */
  background: var(
    --frame-input-group-background,
    var(--_frame-default-input-group-background-116)
  ); /* Foreground for text and icons on resting control surfaces. @token --frame-control-text @context */
  color: var(--frame-control-text);
  box-sizing: border-box;
}

.frame-input-group-control {
  display: flex;
  flex: 1;
  min-width: 0;
}

.frame-input-addon {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  /* Space between children for .frame-input-addon. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Internal spacing of an input prefix or suffix addon. @token --frame-input-group-addon-padding */
  --_frame-default-input-group-addon-padding-117: 0
    var(--frame-spacing-small, var(--_frame-default-spacing-small-3e5e0f3c4b));
  padding: var(
    --frame-input-group-addon-padding,
    var(--_frame-default-input-group-addon-padding-117)
  ); /* Foreground of an input prefix or suffix addon. @token --frame-input-group-addon-color */
  --_frame-default-input-group-addon-color-118: var(--frame-muted);
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(
    --frame-input-group-addon-color,
    var(--_frame-default-input-group-addon-color-118)
  );
}
</style>
