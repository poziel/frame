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
  gap: var(--frame-status-bar-gap, var(--frame-spacing-small, 4px));
  min-width: var(--frame-status-bar-min-width, 0);
  padding: var(--frame-status-bar-padding, 0 var(--frame-spacing-small, 4px));
  background: var(--frame-bg);
  font-size: var(--frame-status-bar-font-size, 10px);
  color: var(--frame-status-bar-color, #8f999e);
}

.status-section {
  display: flex;
  align-items: center;
  gap: var(--frame-status-bar-item-gap, var(--frame-spacing-small, 4px));
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
  color: var(--frame-status-error-color, var(--frame-danger));
}

.status-message-warning {
  color: var(--frame-status-warning-color, #cca700);
}

.status-bar button:hover {
  background: var(--frame-status-bar-button-hover-background, #ffffff0b);
}

@media (max-width: 540px) {
  .status-bar {
    gap: var(--frame-status-bar-gap-2, var(--frame-spacing-small, 4px));
  }
}
</style>
