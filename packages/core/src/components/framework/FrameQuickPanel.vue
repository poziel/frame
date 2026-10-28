<script setup lang="ts">
import FrameIconButton from '../actions/FrameIconButton.vue';
import QuickOverlay from './QuickOverlay.vue';

defineProps<{
  /** Visible heading and accessible name for this presentation. */
  title: string;
  /** Preferred quick-input placement at the top or center of the owning shell. */
  position?: 'top' | 'center';
}>();
const emit = defineEmits<{
  /** Requests dismissal of this presentation without disposing its owning controller. */
  close: [];
}>();
defineSlots<{
  /** Scrollable panel body. */ default?(): unknown;
  /** Additional header controls before the close button. */ 'header-actions'?(): unknown;
}>();
</script>
<template>
  <QuickOverlay
    :title="title"
    :position="position"
    panel
    scroll
    @close="emit('close')"
  >
    <template #header
      ><header class="quick-panel-header"
        ><span>{{ title }}</span
        ><div class="quick-panel-actions"
          ><slot name="header-actions" /><FrameIconButton
            label="Close panel"
            icon="close"
            :tooltip="false"
            @click="emit('close')" /></div></header
    ></template>
    <slot />
  </QuickOverlay>
</template>

<style lang="scss">
.quick-panel-actions {
  display: flex;
  position: absolute;
  right: 0;
  align-items: center;
}

.quick-panel-header {
  flex-shrink: 0;
}
</style>
