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

<style lang="scss">
.visibility-indicator {
  /* Opacity for .visibility-indicator. @token --frame-visibility-indicator-opacity */
  --_frame-default-visibility-indicator-opacity-24daf5188b: 0;
  opacity: var(
    --frame-visibility-indicator-opacity,
    var(--_frame-default-visibility-indicator-opacity-24daf5188b)
  );
  flex-shrink: 0;
}

button:hover > .visibility-indicator,
button:focus > .visibility-indicator,
button.selected > .visibility-indicator {
  /* Opacity for button:hover > .visibility-indicator, button:focus > .visibility-indicator, button.selected > .visibility-indicator. @token --frame-button-hover-visibility-indicator-opacity */
  --_frame-default-button-hover-visibility-indicator-opacity-2257ae5e75: 1;
  opacity: var(
    --frame-button-hover-visibility-indicator-opacity,
    var(--_frame-default-button-hover-visibility-indicator-opacity-2257ae5e75)
  );
}

.menu-row button.active > .visibility-indicator {
  /* Opacity for .menu-row button.active > .visibility-indicator. @token --frame-menu-row-button-active-visibility-indicator-opacity */
  --_frame-default-menu-row-button-active-visibility-indicator-opacity-36f21f14e5: 1;
  opacity: var(
    --frame-menu-row-button-active-visibility-indicator-opacity,
    var(
      --_frame-default-menu-row-button-active-visibility-indicator-opacity-36f21f14e5
    )
  );
}
</style>
