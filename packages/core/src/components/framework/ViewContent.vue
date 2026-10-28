<script setup lang="ts">
import type {PanelDefinition} from '../../framework/views/shellViewContainer';

defineProps<{view: PanelDefinition}>();
</script>
<template>
  <div class="frame-view-layout">
    <div
      v-if="view.top"
      class="frame-view-top"
      :class="{'frame-view-padded': view.top.padded !== false}"
      ><component :is="view.top.component" v-bind="view.top.props"
    /></div>
    <div
      class="frame-view-middle"
      :class="{
        'frame-view-padded':
          view.padded !== false && view.children === undefined,
        'frame-view-group': view.children !== undefined,
      }"
      ><slot
    /></div>
    <div
      v-if="view.bottom"
      class="frame-view-bottom"
      :class="{'frame-view-padded': view.bottom.padded !== false}"
      ><component :is="view.bottom.component" v-bind="view.bottom.props"
    /></div>
  </div>
</template>

<style lang="scss">
.frame-view-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.frame-view-top,
.frame-view-bottom {
  flex: none;
  min-width: 0;
}

.frame-view-middle {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
}

.frame-view-padded {
  padding: var(
    --frame-side-content-padding,
    var(--frame-spacing-small) var(--frame-spacing-normal)
  );
}

.frame-view-middle.frame-view-group {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
