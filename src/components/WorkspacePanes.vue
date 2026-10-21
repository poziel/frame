<script setup lang="ts">
import { computed, ref, shallowReactive, shallowRef } from "vue";
import type { FrameMenuItem, WorkspacePane, WorkspaceSplitDirection } from "../types";
import { useFrame } from "../frame/createFrame";
import WorkspacePaneLayout from "./WorkspacePaneLayout.vue";
import PanePlaceholder from "./PanePlaceholder.vue";
import FrameMenu from "./FrameMenu.vue";
const frame = useFrame();
const { root, panes, activePane } = frame.workspace;
const parking = ref<HTMLElement>();
const hosts = shallowReactive(new Map<string, HTMLElement>());
const menuAnchor = shallowRef<HTMLElement>();
const point = ref({ x: 0, y: 0 });
let menuPane = "";
const menuItems = computed<FrameMenuItem[]>(() => [
  ...(["left", "right", "up", "down"] as const).map(direction => ({ id: direction, label: `Split ${direction[0]!.toUpperCase()}${direction.slice(1)}` })),
  { id: "divider", type: "separator" },
  { id: "close", label: "Close Pane", disabled: panes.value.length === 1 },
]);
function host(id: string, target: HTMLElement | null) { if (target) hosts.set(id, target); else hosts.delete(id); }
function openMenu(id: string, event: MouseEvent) { menuPane = id; menuAnchor.value = event.currentTarget as HTMLElement; point.value = { x: event.clientX || menuAnchor.value.getBoundingClientRect().left, y: event.clientY || menuAnchor.value.getBoundingClientRect().top }; }
function choose(item: FrameMenuItem) { if (item.id === "close") frame.closeWorkspacePane(menuPane); else frame.splitWorkspace(item.id as WorkspaceSplitDirection, menuPane); }
defineSlots<{ default(props: { pane: WorkspacePane }): unknown; pane(props: { pane: WorkspacePane }): unknown }>();
</script>
<template>
  <main id="workspace" class="workspace workspace-panes" tabindex="-1" aria-label="Workspace">
    <WorkspacePaneLayout :node="root" :panes="panes" :active-id="activePane" :multiple="panes.length > 1" @focus="frame.workspace.focus" @close="frame.closeWorkspacePane" @resize="frame.workspace.resize" @host="host" @menu="openMenu"/>
    <div ref="parking" hidden/>
    <template v-if="parking"><Teleport v-for="pane in panes" :key="pane.id" :to="hosts.get(pane.id) ?? parking"><div class="workspace-pane-content">
      <component v-if="pane.component" :is="pane.component" v-bind="pane.props"/>
      <slot v-else-if="pane.id === frame.workspace.initialPaneId" :pane="pane"><PanePlaceholder :active="activePane === pane.id"/></slot>
      <slot v-else name="pane" :pane="pane"><PanePlaceholder :active="activePane === pane.id"/></slot>
    </div></Teleport></template>
    <FrameMenu v-if="menuAnchor" :anchor="menuAnchor" :point="point" :items="menuItems" label="Workspace pane" @select="choose" @close="menuAnchor = undefined"/>
  </main>
</template>
