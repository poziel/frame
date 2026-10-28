<script setup lang="ts">
import DockRegion from './DockRegion.vue';
import {useFrame} from '../../framework/useFrame';
import PanelActions from './PanelActions.vue';
import type {PanelAction} from '../../framework/views/shellViewContainer';

import FrameIconButton from '../actions/FrameIconButton.vue';

const props = withDefaults(
  defineProps<{
    /** Sidebar region coordinated through the injected Frame instance; defaults to primary. */
    region?: 'primary' | 'secondary';
    /** Visible heading and accessible name for this presentation. */
    title: string;
    /** Optional CSS color for the sidebar heading. */
    titleColor?: string;
    /** Header action definitions; available actions overflow when the header cannot fit them. */
    actions?: readonly PanelAction[];
    /** Whether content receives the standard region padding; false removes it. */
    padded?: boolean;
    /** Displays the empty-region drop placeholder without removing the content slot. */
    empty?: boolean;
  }>(),
  {region: 'primary'}
);
const frame = useFrame();
defineEmits<{
  /** Requests dismissal of this presentation without disposing its owning controller. */
  close: [];
  /** Reports the sidebar header context-menu event to its owning shell. */
  context: [event: MouseEvent];
}>();
defineSlots<{
  /** Sidebar content whose presentation is coordinated by the injected Frame. */ default?(): unknown;
  /** Additional header controls after registered actions. */ actions?(): unknown;
}>();
</script>
<template>
  <aside
    :id="region === 'primary' ? 'side-panel' : 'secondary-panel'"
    class="side-panel"
    :data-view-region="region"
    :aria-label="title"
  >
    <DockRegion
      :region="region === 'primary' ? 'primarySidebar' : 'secondarySidebar'"
      mode="inside"
      class="frame-dock-anchor-content"
    >
      <header
        class="section-header frame-shell-label"
        @contextmenu="$emit('context', $event)"
      >
        <h2 class="side-title" :style="{color: titleColor}">{{ title }}</h2>
        <PanelActions
          :actions="actions"
          :feature="
            region === 'primary' ? 'primarySidebar' : 'secondarySidebar'
          "
        /><slot name="actions" />
        <FrameIconButton
          :label="
            region === 'primary'
              ? 'Hide primary sidebar'
              : 'Hide secondary sidebar'
          "
          :icon="
            (
              region === 'primary'
                ? frame.layout.primarySide === 'left'
                : frame.layout.primarySide === 'right'
            )
              ? 'layout-sidebar-left'
              : 'layout-sidebar-right'
          "
          :shortcut="region === 'primary' ? 'Ctrl+B' : 'Ctrl+Alt+B'"
          :icon-size="15"
          @click="$emit('close')"
        />
      </header>
      <p v-if="empty" class="empty-view-region">Drag a view here to display.</p>
      <div class="side-content" :class="{unpadded: padded === false}"
        ><slot
      /></div> </DockRegion
  ></aside>
</template>
