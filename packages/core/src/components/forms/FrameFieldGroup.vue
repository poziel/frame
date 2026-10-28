<script setup lang="ts">
import './styles/controls.scss';

defineProps<{disabled?: boolean}>();
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
  width: var(--frame-input-group-width, min(100%, 340px));
  min-width: 0;
  background: var(
    --frame-input-group-background,
    var(--frame-control-background)
  );
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
  padding: var(
    --frame-input-group-addon-padding,
    0 var(--frame-spacing-small, 4px)
  );
  color: var(--frame-input-group-addon-color, var(--frame-muted));
}
</style>
