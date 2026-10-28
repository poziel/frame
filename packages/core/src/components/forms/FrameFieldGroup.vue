<script setup lang="ts">
import './shared/controls.css';

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
    class="frame-input-group"
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
