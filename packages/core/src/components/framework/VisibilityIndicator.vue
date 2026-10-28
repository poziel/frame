<script setup lang="ts">
import FrameIcon from '../data-display/FrameIcon.vue';

defineProps<{
  /** Selects the visible or hidden indicator icon. */
  visible: boolean;
}>();
</script>
<template>
  <FrameIcon
    class="visibility-indicator"
    :name="visible ? 'eye' : 'eye-closed'"
    :size="15"
  />
</template>
