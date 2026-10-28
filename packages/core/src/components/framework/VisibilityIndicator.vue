<script setup lang="ts">
import FrameIcon from '../data-display/FrameIcon.vue';

defineProps<{visible: boolean}>();
</script>
<template>
  <FrameIcon
    class="visibility-indicator"
    :name="visible ? 'eye' : 'eye-closed'"
    :size="15"
  />
</template>

<style lang="scss">
.visibility-indicator {
  opacity: var(--frame-visibility-indicator-opacity, 0);
  flex-shrink: 0;
}

button:hover > .visibility-indicator,
button:focus > .visibility-indicator,
button.selected > .visibility-indicator {
  opacity: var(--frame-button-hover-visibility-indicator-opacity, 1);
}

.menu-row button.active > .visibility-indicator {
  opacity: var(--frame-menu-row-button-active-visibility-indicator-opacity, 1);
}
</style>
