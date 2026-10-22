<script setup lang="ts">
import ViewSections from "./ViewSections.vue";
import PanelActions from "./PanelActions.vue";
import { useFrame } from "../frame/createFrame";
import type { PanelDefinition } from "../types";
import { computed, nextTick, ref, useId } from "vue";
import FrameIconButton from "./FrameIconButton.vue";

const props = defineProps<{ tabs: readonly PanelDefinition[]; activeId: string; label?: string; regionId?: string; closeLabel?: string; managed?: boolean; contentId?: string }>();
const emit = defineEmits<{ select: [id: string]; close: [] }>();
const frame = useFrame();
const region = () => props.regionId === "secondary-panel" ? "secondary" as const : "bottom" as const;
const maximized = computed(() => frame.layout.maximizedRegion === region());
const maximizeLabel = computed(() => `${maximized.value ? 'Restore' : 'Maximize'} ${region() === 'secondary' ? 'secondary sidebar' : 'bottom panel'}`);
const uid = useId();
const tablist = ref<HTMLElement>();
async function onKey(event: KeyboardEvent) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const current = props.tabs.findIndex(tab => tab.id === props.activeId);
  const index = event.key === "Home" ? 0 : event.key === "End" ? props.tabs.length - 1
    : (current + (event.key === "ArrowRight" ? 1 : -1) + props.tabs.length) % props.tabs.length;
  const tab = props.tabs[index];
  if (!tab) return;
  emit("select", tab.id);
  await nextTick();
  tablist.value?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
}
</script>
<template>
  <section :id="regionId ?? 'bottom-panel'" class="bottom-panel" :data-view-region="region()" @dragover.prevent @drop="frame.dropView($event, region())" :aria-label="label ?? 'Bottom panel'">
    <header class="panel-header">
      <div ref="tablist" role="tablist" aria-label="Panel tabs" class="panel-tabs" data-view-axis="x" @keydown="onKey">
        <button v-for="tab in tabs" :id="`${uid}-tab-${tab.id}`" :key="tab.id" role="tab"
          :aria-selected="activeId === tab.id" :aria-controls="managed ? contentId : `${uid}-content-${tab.id}`"
          :draggable="false" :data-view-id="tab.id" @keydown="frame.viewKey($event, tab.id, region())" @pointerdown="frame.beginViewDrag($event, tab.id, region())" @dragover.prevent @drop="frame.dropView($event, region(), tab.id)"
          :tabindex="activeId === tab.id ? 0 : -1" @click="emit('select', tab.id)"><component v-if="tab.icon" :is="tab.icon" class="tab-icon"/>{{ tab.label }}</button>
      </div>
      <PanelActions :actions="tabs.find(tab => tab.id === activeId)?.actions"/>
      <span v-if="tabs.find(tab => tab.id === activeId)?.actions?.length" class="panel-action-separator" role="separator" aria-orientation="vertical"/>
      <FrameIconButton :label="maximizeLabel" :icon="maximized ? 'screen-normal' : 'screen-full'" :aria-pressed="maximized" tooltip-placement="top" @click="frame.layout.maximizedRegion = maximized ? null : region()"/>
      <FrameIconButton :label="closeLabel ?? 'Hide bottom panel'" icon="close" :shortcut="regionId === 'secondary-panel' ? 'Ctrl+Alt+B' : 'Ctrl+J'" tooltip-placement="top" @click="emit('close')"/>
    </header>
    <p v-if="!tabs.length" class="empty-view-region">Drag a view here to display.</p>
    <div v-if="managed" v-show="tabs.length" :id="contentId" class="panel-content view-host" :class="{ unpadded: tabs.find(tab => tab.id === activeId)?.padded === false || tabs.find(tab => tab.id === activeId)?.children !== undefined }" tabindex="0" role="tabpanel" :aria-label="tabs.find(tab => tab.id === activeId)?.label"/>
    <div v-for="tab in managed ? [] : tabs" v-show="activeId === tab.id" :id="`${uid}-content-${tab.id}`" :key="tab.id"
      role="tabpanel" :aria-labelledby="`${uid}-tab-${tab.id}`" tabindex="0" class="panel-content" :class="{ unpadded: tab.padded === false }">
      <ViewSections v-if="tab.children !== undefined" :view-id="tab.id"/><component v-else :is="tab.component" v-bind="tab.props" />
    </div>
  </section>
</template>

