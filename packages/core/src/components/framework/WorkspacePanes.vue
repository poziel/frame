<script setup lang="ts">
import FrameContextMenu from '../navigation/FrameContextMenu.vue';
import {
  computed,
  ref,
  shallowReactive,
  shallowRef,
  useSlots,
  watchEffect,
  watch,
  nextTick,
} from 'vue';
import type {FrameMenuItem} from '../navigation/generalMenu';
import type {
  WorkspacePane,
  WorkspaceSplitDirection,
} from '../../framework/workspace/workspaceTypes';
import {useFrame} from '../../framework/useFrame';
import WorkspacePaneLayout from './WorkspacePaneLayout.vue';
import WorkspaceTabs from './WorkspaceTabs.vue';
import PanePlaceholder from './PanePlaceholder.vue';
import type {WorkspaceTab} from '../../framework/workspace/workspaceTypes';

const frame = useFrame();
const slots = useSlots();
const w = frame.workspace;
const {root, panes, activePane} = frame.workspace;
watchEffect(
  (onCleanup) => {
    const releases = panes.value
      .filter(
        (p) =>
          w.paneMode(p.id) === 'plain' &&
          (p.id === w.initialPaneId ? !!slots.default : !!slots.pane)
      )
      .map((p) => w.registerPaneContent(p.id));
    onCleanup(() => releases.forEach((release) => release()));
  },
  {flush: 'sync'}
);
const parking = ref<HTMLElement>();
const workspaceRoot = ref<HTMLElement>();
watch(panes, async () => {
  const focused = document.activeElement;
  const owned = !!focused && !!workspaceRoot.value?.contains(focused);
  await nextTick();
  if (
    owned &&
    focused &&
    (!focused.isConnected || document.activeElement === document.body)
  ) {
    const target = hosts
      .get(activePane.value)
      ?.querySelector<HTMLElement>('[role=tab][data-state=active]');
    (target ?? workspaceRoot.value)?.focus({preventScroll: true});
  }
});
const tabHosts = shallowReactive(new Map<string, HTMLElement>());
function tabHost(id: string, el: unknown) {
  if (el instanceof HTMLElement) tabHosts.set(id, el);
  else tabHosts.delete(id);
}
const hosts = shallowReactive(new Map<string, HTMLElement>());
const dropPane = ref<string>();
function previewPane(id: string, event: DragEvent) {
  const tab = w.draggedTab.value;
  if (
    !tab ||
    !event.dataTransfer?.types.includes(w.dragMime) ||
    !w.canMoveTab(tab, id)
  )
    return;
  event.preventDefault();
  dropPane.value = id;
}
function dropTab(id: string, event: DragEvent) {
  dropPane.value = undefined;
  const tab = w.readTabDrag(event.dataTransfer?.getData(w.dragMime) ?? '');
  if (tab && w.canMoveTab(tab, id)) {
    event.preventDefault();
    w.moveTab(tab, id, undefined, 'drag');
  }
}
const menuAnchor = shallowRef<HTMLElement>();
const point = ref({x: 0, y: 0});
let menuPane = '';
const menuItems = computed<FrameMenuItem[]>(() => [
  ...(['left', 'right', 'up', 'down'] as const).map((direction) => ({
    id: direction,
    label: `Split ${direction[0]!.toUpperCase()}${direction.slice(1)}`,
    disabled: !w.canSplit(menuPane),
  })),
  {id: 'divider', type: 'separator'},
  {id: 'close', label: 'Close Pane', disabled: panes.value.length === 1},
]);
function host(id: string, target: HTMLElement | null) {
  if (target) hosts.set(id, target);
  else hosts.delete(id);
}
function openMenu(id: string, event: MouseEvent) {
  if (!w.options.allowPaneCreation && panes.value.length === 1) return;
  menuPane = id;
  menuAnchor.value = event.currentTarget as HTMLElement;
  point.value = {
    x: event.clientX || menuAnchor.value.getBoundingClientRect().left,
    y: event.clientY || menuAnchor.value.getBoundingClientRect().top,
  };
}
function choose(item: FrameMenuItem) {
  if (item.id === 'close') void w.requestClosePane(menuPane, 'menu');
  else if (w.canSplit(menuPane))
    frame.splitWorkspace(item.id as WorkspaceSplitDirection, menuPane);
}
defineSlots<{
  /** Initial pane content, preserved across layout changes while that pane survives. */
  default?(props: {pane: WorkspacePane}): unknown;
  /** Host content for additional plain panes; Frame registers and releases its presentation lifetime. */
  pane?(props: {pane: WorkspacePane}): unknown;
  /** Label content for a document tab, including whether it is active. */
  tab?(props: {tab: WorkspaceTab; active: boolean}): unknown;
  /** Empty presentation for a tabbed pane. */
  empty?(props: {pane: WorkspacePane}): unknown;
  /** Additional actions within a pane's document tab strip. */
  actions?(props: {pane: WorkspacePane}): unknown;
}>();
</script>
<template>
  <main
    ref="workspaceRoot"
    id="workspace"
    class="workspace workspace-panes"
    tabindex="-1"
    aria-label="Workspace"
  >
    <WorkspacePaneLayout
      :node="root"
      :panes="panes"
      :active-id="activePane"
      :multiple="panes.length > 1"
      @focus="frame.workspace.focus"
      @close="(id) => w.requestClosePane(id, 'button')"
      @resize="frame.workspace.resize"
      @host="host"
      @menu="openMenu"
    />
    <div ref="parking" hidden />
    <template v-if="parking">
      <Teleport
        v-for="pane in panes"
        :key="pane.id"
        :to="hosts.get(pane.id) ?? parking"
      >
        <div
          class="workspace-pane-content"
          :class="{
            'workspace-drop-target':
              dropPane === pane.id && !!w.draggedTab.value,
          }"
          @dragover="previewPane(pane.id, $event)"
          @dragleave="
            (event) => {
              if (
                !(event.currentTarget as HTMLElement).contains(
                  event.relatedTarget as Node
                )
              )
                dropPane = undefined;
            }
          "
          @drop="dropTab(pane.id, $event)"
        >
          <WorkspaceTabs
            v-if="w.paneMode(pane.id) === 'tabs'"
            :pane-id="pane.id"
            ><template v-if="$slots.tab" #tab="scope"
              ><slot name="tab" v-bind="scope" /></template
            ><template #actions><slot name="actions" :pane="pane" /></template
          ></WorkspaceTabs>
          <div
            v-if="w.paneMode(pane.id) === 'tabs'"
            :ref="(el) => tabHost(pane.id, el)"
            class="workspace-tab-content-host"
          >
            <slot
              v-if="!w.tabs.value.some((t) => t.paneId === pane.id)"
              name="empty"
              :pane="pane"
              ><PanePlaceholder :active="activePane === pane.id"
            /></slot>
          </div>
          <component
            v-else-if="pane.component"
            :is="pane.component"
            v-bind="pane.props"
          />
          <slot v-else-if="pane.id === w.initialPaneId" :pane="pane"
            ><PanePlaceholder
              :active="activePane === pane.id"
              @dblclick="
                w.canCreateTab(pane.id) && w.requestTab(pane.id, 'double-click')
              "
          /></slot>
          <slot v-else name="pane" :pane="pane"
            ><PanePlaceholder
              :active="activePane === pane.id"
              @dblclick="
                w.canCreateTab(pane.id) && w.requestTab(pane.id, 'double-click')
              "
          /></slot>
        </div>
      </Teleport>
      <Teleport
        v-for="tab in w.tabs.value"
        :key="tab.id"
        :to="tabHosts.get(tab.paneId) ?? parking"
        ><div
          v-show="w.activeTabs.value[tab.paneId] === tab.id"
          :id="`${w.dragMime}-${tab.id}-panel`"
          role="tabpanel"
          :aria-labelledby="`${w.dragMime}-${tab.id}-trigger`"
          :aria-label="tab.title"
          class="workspace-tab-content"
          :data-tab-content="tab.id"
          ><component
            v-if="tab.component"
            :is="tab.component"
            v-bind="tab.props" /><PanePlaceholder
            v-else
            :active="activePane === tab.paneId" /></div
      ></Teleport>
    </template>
    <FrameContextMenu
      v-if="menuAnchor"
      :anchor="menuAnchor"
      :point="point"
      :items="menuItems"
      label="Workspace pane"
      @select="choose"
      @close="menuAnchor = undefined"
    />
  </main>
</template>
