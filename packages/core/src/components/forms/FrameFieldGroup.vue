<script setup lang="ts">
import './shared/controls.css';
defineProps<{ disabled?: boolean }>();
</script>
<template>
  <div class="frame-input-group" role="group" :data-disabled="disabled || undefined" :aria-disabled="disabled || undefined">
    <span v-if="$slots.prefix" class="frame-input-addon" data-side="prefix"><slot name="prefix" /></span>
    <div class="frame-input-group-control"><slot /></div>
    <span v-if="$slots.suffix" class="frame-input-addon" data-side="suffix"><slot name="suffix" /></span>
  </div>
</template>
