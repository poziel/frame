<script setup lang="ts">
import FrameIconButton from '../actions/FrameIconButton.vue';
import QuickOverlay from './QuickOverlay.vue';

defineProps<{title: string; position?: 'top' | 'center'}>();
const emit = defineEmits<{close: []}>();
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
