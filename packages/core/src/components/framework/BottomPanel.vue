<script setup lang="ts">
import DockRegion from './DockRegion.vue';
import PanelViewBar from './PanelViewBar.vue';
import ViewVisibilityMenu from './ViewVisibilityMenu.vue';
import ViewSections from './ViewSections.vue';
import PanelActions from './PanelActions.vue';
import {useFrame} from '../../framework/useFrame';
import type {PanelDefinition} from '../../framework/views/shellViewContainer';
import {computed, ref, useId} from 'vue';
import FrameIconButton from '../actions/FrameIconButton.vue';

const props = defineProps<{
  tabs: readonly PanelDefinition[];
  activeId: string;
  label?: string;
  regionId?: string;
  closeLabel?: string;
  managed?: boolean;
  contentId?: string;
}>();
const emit = defineEmits<{select: [id: string]; close: []}>();
const frame = useFrame();
const region = () =>
  props.regionId === 'secondary-panel'
    ? ('secondary' as const)
    : ('bottom' as const);
const maximized = computed(() => frame.layout.maximizedRegion === region());
const maximizeLabel = computed(
  () =>
    `${maximized.value ? 'Restore' : 'Maximize'} ${region() === 'secondary' ? 'secondary sidebar' : 'panel'}`
);
const uid = useId();
const viewBar = ref<{openContext: (event: MouseEvent) => void}>();
function headerContext(event: MouseEvent) {
  if (!event.defaultPrevented) viewBar.value?.openContext(event);
}
const visibleTabs = computed(() =>
  !props.managed
    ? props.tabs
    : region() === 'secondary'
      ? props.tabs.filter((tab) => frame.secondaryViewBar.isVisible(tab.id))
      : props.tabs.filter((tab) => frame.panelViewBar.isVisible(tab.id))
);
</script>
<template>
  <section
    :id="regionId ?? 'bottom-panel'"
    class="bottom-panel"
    :data-view-region="region()"
    @dragover.prevent
    @drop="frame.dropView($event, region())"
    :aria-label="label ?? 'Panel'"
  >
    <DockRegion
      :region="'panel'"
      mode="inside"
      class="frame-dock-anchor-content"
    >
      <header
        v-if="tabs.find((tab) => tab.id === activeId)?.showHeader !== false"
        class="panel-header frame-shell-label"
        @contextmenu="headerContext"
      >
        <PanelViewBar
          v-show="
            region() === 'secondary'
              ? frame.secondaryViewBar.visible.value
              : frame.panelViewBar.visible.value
          "
          ref="viewBar"
          :tabs="tabs"
          :active-id="activeId"
          :secondary="region() === 'secondary'"
          :uid="uid"
          :content-id="contentId"
          :managed="managed"
          @select="emit('select', $event)"
        />
        <ViewVisibilityMenu
          v-if="
            tabs.find((tab) => tab.id === activeId)?.children !== undefined ||
            !!tabs.find((tab) => tab.id === activeId)?.top ||
            !!tabs.find((tab) => tab.id === activeId)?.bottom ||
            !!tabs.find((tab) => tab.id === activeId)?.top ||
            !!tabs.find((tab) => tab.id === activeId)?.bottom
          "
          :view-id="activeId"
        />
        <PanelActions
          :actions="tabs.find((tab) => tab.id === activeId)?.actions"
          :feature="region() === 'secondary' ? 'secondarySidebar' : 'panel'"
        />
        <span
          v-if="tabs.find((tab) => tab.id === activeId)?.actions?.length"
          class="panel-action-separator"
          role="separator"
          aria-orientation="vertical"
        />
        <FrameIconButton
          :label="maximizeLabel"
          :icon="maximized ? 'screen-normal' : 'screen-full'"
          :aria-pressed="maximized"
          tooltip-placement="top"
          @click="
            frame.commands.execute(
              region() === 'secondary'
                ? 'frame.secondary.maximize'
                : 'frame.panel.maximize'
            )
          "
        />
        <FrameIconButton
          :label="closeLabel ?? 'Hide panel'"
          icon="close"
          :shortcut="regionId === 'secondary-panel' ? 'Ctrl+Alt+B' : 'Ctrl+J'"
          tooltip-placement="top"
          @click="emit('close')"
        />
      </header>
      <p v-if="!visibleTabs.length" class="empty-view-region">{{
        tabs.length ? 'No views selected.' : 'Drag a view here to display.'
      }}</p>
      <div
        v-if="managed"
        v-show="visibleTabs.length"
        :id="contentId"
        class="panel-content view-host"
        :class="{
          unpadded:
            tabs.find((tab) => tab.id === activeId)?.padded === false ||
            tabs.find((tab) => tab.id === activeId)?.children !== undefined,
        }"
        tabindex="0"
        role="tabpanel"
        :aria-label="tabs.find((tab) => tab.id === activeId)?.label"
      />
      <div
        v-for="tab in managed ? [] : tabs"
        v-show="activeId === tab.id"
        :id="`${uid}-content-${tab.id}`"
        :key="tab.id"
        role="tabpanel"
        :aria-labelledby="`${uid}-tab-${tab.id}`"
        tabindex="0"
        class="panel-content"
        :class="{unpadded: tab.padded === false}"
      >
        <ViewSections
          v-if="tab.children !== undefined"
          :view-id="tab.id"
        /><component v-else :is="tab.component" v-bind="tab.props" />
      </div> </DockRegion
  ></section>
</template>
