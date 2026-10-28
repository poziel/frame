<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import type {ComponentPublicInstance} from 'vue';
import type {
  WorkspaceNode,
  WorkspacePane,
} from '../../framework/workspace/workspaceTypes';
import ResizeHandle from '../layout/ResizeHandle.vue';
import AppIcon from './AppIcon.vue';
import {useFrame} from '../../framework/useFrame';

const workspace = useFrame().workspace;
const props = defineProps<{
  node: WorkspaceNode;
  panes: readonly WorkspacePane[];
  activeId: string;
  multiple: boolean;
}>();
const emit = defineEmits<{
  focus: [id: string];
  close: [id: string];
  resize: [id: string, ratio: number];
  host: [id: string, element: HTMLElement | null];
  menu: [id: string, event: MouseEvent];
}>();
const element = ref<HTMLElement>();
const size = ref(600);
const label = computed(
  () =>
    props.panes.find((pane) => pane.id === props.node.id)?.label ?? 'Workspace'
);
let observer: ResizeObserver | undefined;
let hostId: string | undefined;
function hostRef(value: Element | ComponentPublicInstance | null) {
  if (value instanceof HTMLElement) {
    hostId = props.node.id;
    emit('host', hostId, value);
  } else if (hostId) {
    emit('host', hostId, null);
    hostId = undefined;
  }
}
function context(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  emit('focus', props.node.id);
  emit('menu', props.node.id, event);
}
onMounted(() => {
  observer = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect;
    if (rect && props.node.type === 'split')
      size.value = props.node.axis === 'x' ? rect.width : rect.height;
  });
  if (element.value) observer.observe(element.value);
});
watch(
  [element, () => (props.node.type === 'split' ? props.node.axis : undefined)],
  () => {
    observer?.disconnect();
    if (element.value) observer?.observe(element.value);
  },
  {flush: 'post'}
);
onBeforeUnmount(() => {
  observer?.disconnect();
  if (hostId) emit('host', hostId, null);
});
</script>
<template>
  <section
    v-if="node.type === 'pane'"
    ref="element"
    class="workspace-pane"
    :class="{active: activeId === node.id, multiple}"
    :aria-label="label"
    @pointerdown="emit('focus', node.id)"
    @focusin="emit('focus', node.id)"
    @contextmenu="context"
  >
    <button
      v-if="multiple && workspace.paneMode(node.id) !== 'tabs'"
      class="icon-button pane-close"
      :aria-label="`Close pane: ${label}`"
      @click="emit('close', node.id)"
      ><AppIcon name="close" :size="16"
    /></button>
    <div :ref="hostRef" class="workspace-pane-host" :data-pane-id="node.id" />
  </section>
  <div
    v-else
    ref="element"
    class="workspace-split"
    :class="node.axis"
    :style="
      node.axis === 'x'
        ? {
            gridTemplateColumns: `minmax(0, ${node.ratio}fr) var(--workspace-pane-gap) minmax(0, ${1 - node.ratio}fr)`,
          }
        : {
            gridTemplateRows: `minmax(0, ${node.ratio}fr) var(--workspace-pane-gap) minmax(0, ${1 - node.ratio}fr)`,
          }
    "
  >
    <WorkspacePaneLayout
      :node="node.first"
      :panes="panes"
      :active-id="activeId"
      :multiple="multiple"
      @focus="emit('focus', $event)"
      @close="emit('close', $event)"
      @resize="(id, ratio) => emit('resize', id, ratio)"
      @host="(id, target) => emit('host', id, target)"
      @menu="(id, event) => emit('menu', id, event)"
    />
    <ResizeHandle
      :label="
        node.axis === 'x' ? 'Resize workspace columns' : 'Resize workspace rows'
      "
      :axis="node.axis"
      :value="node.ratio"
      :min="0.1"
      :max="0.9"
      :scale="1 / Math.max(1, size - 1)"
      :step="0.05"
      @change="emit('resize', node.id, $event)"
      @reset="emit('resize', node.id, 0.5)"
    />
    <WorkspacePaneLayout
      :node="node.second"
      :panes="panes"
      :active-id="activeId"
      :multiple="multiple"
      @focus="emit('focus', $event)"
      @close="emit('close', $event)"
      @resize="(id, ratio) => emit('resize', id, ratio)"
      @host="(id, target) => emit('host', id, target)"
      @menu="(id, event) => emit('menu', id, event)"
    />
  </div>
</template>

<style lang="scss">
.workspace-pane,
.workspace-split {
  min-width: var(--frame-workspace-pane-min-width, 0);
  min-height: var(--frame-workspace-pane-min-height, 0);
  width: var(--frame-workspace-pane-width, 100%);
  height: var(--frame-workspace-pane-height, 100%);
  box-sizing: border-box;
}

.workspace-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-pane.multiple {
  border: var(--frame-workspace-pane-multiple-border, 0);
  border-radius: var(--frame-workspace-pane-multiple-border-radius, 0);
}

.workspace-split {
  display: grid;
}

.workspace-split.x > :first-child {
  grid-column: 1;
  grid-row: 1;
}

.workspace-split.x > :last-child {
  grid-column: 3;
  grid-row: 1;
}

.workspace-split.y > :first-child {
  grid-row: 1;
  grid-column: 1;
}

.workspace-split.y > :last-child {
  grid-row: 3;
  grid-column: 1;
}

.workspace-split > .resize-handle {
  position: relative;
}

.workspace-split.x > .resize-handle {
  grid-column: 2;
  grid-row: 1;
  justify-self: center;
}

.workspace-split.y > .resize-handle {
  grid-row: 2;
  grid-column: 1;
  align-self: center;
  width: var(--frame-workspace-split-y-resize-handle-width, 100%);
}

.compact .workspace-pane.multiple {
  border-radius: var(--frame-compact-workspace-pane-multiple-border-radius, 0);
}

.workspace-pane {
  position: relative;
}

.workspace-split {
  background: var(--frame-line);
}

.workspace-pane {
  background: var(--frame-canvas);
}

.pane-close {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;
  color: var(--frame-muted);
}
</style>
