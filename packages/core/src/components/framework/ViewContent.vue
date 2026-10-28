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
  /* Internal spacing for .frame-view-padded. @token --frame-side-content-padding */
  --_frame-default-side-content-padding-c20e08c6f1: var(--frame-spacing-small)
    var(--frame-spacing-normal);
  /* Compact shared spacing step used by menu insets, view rails, and dense content groups. @token --frame-spacing-small @context */
  /* Normal shared spacing step used for content insets and separation. @token --frame-spacing-normal @context */
  padding: var(
    --frame-side-content-padding,
    var(--_frame-default-side-content-padding-c20e08c6f1)
  );
}

.frame-view-middle.frame-view-group {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
