<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {useFrame} from '../../framework/useFrame';
import ViewBarSeparators from './ViewBarSeparators.vue';
import StatusBarItem from './StatusBarItem.vue';
import FrameTooltip from '../overlays/FrameTooltip.vue';
import StatusItemMenu from './StatusItemMenu.vue';

const frame = useFrame();
const root = ref<HTMLElement>();
const targetId = ref<string>();
const point = ref<{x: number; y: number}>();
const items = computed(() =>
  frame.status.items.value.filter(
    (item) => item.available && item.showInStatusBar && item.visible
  )
);
watch(
  () => frame.layout.statusBarVisible,
  () => {
    point.value = undefined;
  }
);
function context(event: MouseEvent, id?: string) {
  targetId.value = id;
  event.preventDefault();
  event.stopPropagation();
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  point.value = {
    x: event.clientX || rect.left,
    y: event.clientY || rect.bottom,
  };
}
</script>
<template>
  <footer
    ref="root"
    v-show="frame.layout.statusBarVisible"
    class="status-bar frame-shell-label"
    aria-label="Status bar"
    @contextmenu="context"
  >
    <div
      data-bar-axis="x"
      class="bar-drop-list status-section status-left"
      aria-label="Left status items"
      ><slot name="leading" /><template
        v-for="item in items.filter((item) => item.side === 'left')"
        :key="item.id"
        ><span
          class="status-drop-gap"
          :data-bar-drop-before="item.id" /><ViewBarSeparators
          :items="frame.status.separators.value"
          :before="item.id"
          :move="frame.status.moveSeparator"
          :can-move="frame.status.allowMove.value"
          @context="context" /><StatusBarItem :item="item" /></template
      ><span
        class="status-drop-gap"
        data-bar-drop-before="" /><ViewBarSeparators
        :items="frame.status.separators.value"
        :move="frame.status.moveSeparator"
        :can-move="frame.status.allowMove.value"
        @context="context"
    /></div>
    <FrameTooltip
      class="status-message-tooltip"
      :text="frame.status.message.value.text"
      placement="top"
      v-slot="{describedby}"
    >
      <div
        class="status-message"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        :aria-describedby="describedby"
        :class="`status-message-${frame.status.message.value.severity}`"
        >{{ frame.status.message.value.text }}</div
      >
    </FrameTooltip>
    <div
      data-bar-axis="x"
      class="bar-drop-list status-section status-right"
      aria-label="Right status items"
      ><slot name="actions" /><template
        v-for="item in items.filter((item) => item.side === 'right')"
        :key="item.id"
        ><span
          class="status-drop-gap"
          :data-bar-drop-before="item.id" /><ViewBarSeparators
          :items="frame.status.separators.value"
          :before="item.id"
          :move="frame.status.moveSeparator"
          :can-move="frame.status.allowMove.value"
          @context="context" /><StatusBarItem :item="item" /></template
    ></div>
    <StatusItemMenu
      v-if="point && root"
      :anchor="root"
      :point="point"
      :target-id="targetId"
      @close="point = undefined"
    />
  </footer>
</template>

<style lang="scss">
.status-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  /* Space between children for .status-bar. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Space between children for .status-bar. @token --frame-status-bar-gap */
  --_frame-default-status-bar-gap-1010f56dc2: var(
    --frame-spacing-small,
    var(--_frame-default-spacing-small-3e5e0f3c4b)
  );
  gap: var(
    --frame-status-bar-gap,
    var(--_frame-default-status-bar-gap-1010f56dc2)
  );
  /* Minimum width for .status-bar. @token --frame-status-bar-min-width */
  --_frame-default-status-bar-min-width-d2a6c839b3: 0;
  min-width: var(
    --frame-status-bar-min-width,
    var(--_frame-default-status-bar-min-width-d2a6c839b3)
  );
  /* Space between children for .status-bar. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Internal spacing for .status-bar. @token --frame-status-bar-padding */
  --_frame-default-status-bar-padding-4ac44f64ef: 0
    var(--frame-spacing-small, var(--_frame-default-spacing-small-3e5e0f3c4b));
  padding: var(
    --frame-status-bar-padding,
    var(--_frame-default-status-bar-padding-4ac44f64ef)
  );
  /* Base shell background behind its registered regions and content. @token --frame-bg @context */
  background: var(--frame-bg);
  /* Text size for .status-bar. @token --frame-status-bar-font-size */
  --_frame-default-status-bar-font-size-2508e91689: 10px;
  font-size: var(
    --frame-status-bar-font-size,
    var(--_frame-default-status-bar-font-size-2508e91689)
  );
  /* Foreground for .status-bar. @token --frame-status-bar-color */
  --_frame-default-status-bar-color-2bacf8f493: #8f999e;
  color: var(
    --frame-status-bar-color,
    var(--_frame-default-status-bar-color-2bacf8f493)
  );
}

.status-section {
  display: flex;
  align-items: center;
  /* Space between children for .status-section. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Space between children for .status-section. @token --frame-status-bar-item-gap */
  --_frame-default-status-bar-item-gap-04ae50f042: var(
    --frame-spacing-small,
    var(--_frame-default-spacing-small-3e5e0f3c4b)
  );
  gap: var(
    --frame-status-bar-item-gap,
    var(--_frame-default-status-bar-item-gap-04ae50f042)
  );
  min-width: 0;
  overflow: hidden;
}

.status-left {
  justify-content: flex-start;
}

.status-right {
  justify-content: flex-end;
}

.status-bar > .status-message-tooltip {
  display: block;
  min-width: 0;
  width: 100%;
}

.status-message {
  width: 100%;
  min-width: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-message-error {
  /* Foreground for .status-message-error. @token --frame-status-error-color */
  --_frame-default-status-error-color-19ea64ddb9: var(--frame-danger);
  /* Error and destructive-action color used for validation messages and invalid field borders. @token --frame-danger @context */
  color: var(
    --frame-status-error-color,
    var(--_frame-default-status-error-color-19ea64ddb9)
  );
}

.status-message-warning {
  /* Foreground for .status-message-warning. @token --frame-status-warning-color */
  --_frame-default-status-warning-color-20f20d2568: #cca700;
  color: var(
    --frame-status-warning-color,
    var(--_frame-default-status-warning-color-20f20d2568)
  );
}

.status-bar button:hover {
  /* Background for .status-bar button:hover. @token --frame-status-bar-button-hover-background */
  --_frame-default-status-bar-button-hover-background-20996b813b: #ffffff0b;
  background: var(
    --frame-status-bar-button-hover-background,
    var(--_frame-default-status-bar-button-hover-background-20996b813b)
  );
}

@media (max-width: 540px) {
  .status-bar {
    /* Space between children for .status-bar. @token --frame-spacing-small */
    --_frame-default-spacing-small-3e5e0f3c4b: 4px;
    /* Space between children for .status-bar. @token --frame-status-bar-gap-2 */
    --_frame-default-status-bar-gap-2-c7379bd963: var(
      --frame-spacing-small,
      var(--_frame-default-spacing-small-3e5e0f3c4b)
    );
    gap: var(
      --frame-status-bar-gap-2,
      var(--_frame-default-status-bar-gap-2-c7379bd963)
    );
  }
}
</style>
