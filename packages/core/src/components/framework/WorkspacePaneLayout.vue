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
  /* Minimum width for .workspace-pane, .workspace-split. @token --frame-workspace-pane-min-width */
  --_frame-default-workspace-pane-min-width-76fd3c38af: 0;
  min-width: var(
    --frame-workspace-pane-min-width,
    var(--_frame-default-workspace-pane-min-width-76fd3c38af)
  );
  /* Minimum height for .workspace-pane, .workspace-split. @token --frame-workspace-pane-min-height */
  --_frame-default-workspace-pane-min-height-d5b5e50df1: 0;
  min-height: var(
    --frame-workspace-pane-min-height,
    var(--_frame-default-workspace-pane-min-height-d5b5e50df1)
  );
  /* Width for .workspace-pane, .workspace-split. @token --frame-workspace-pane-width */
  --_frame-default-workspace-pane-width-ed6eb127d8: 100%;
  width: var(
    --frame-workspace-pane-width,
    var(--_frame-default-workspace-pane-width-ed6eb127d8)
  );
  /* Height for .workspace-pane, .workspace-split. @token --frame-workspace-pane-height */
  --_frame-default-workspace-pane-height-2932feaeac: 100%;
  height: var(
    --frame-workspace-pane-height,
    var(--_frame-default-workspace-pane-height-2932feaeac)
  );
  box-sizing: border-box;
}

.workspace-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-pane.multiple {
  /* Border for .workspace-pane.multiple. @token --frame-workspace-pane-multiple-border */
  --_frame-default-workspace-pane-multiple-border-0009e24016: 0;
  border: var(
    --frame-workspace-pane-multiple-border,
    var(--_frame-default-workspace-pane-multiple-border-0009e24016)
  );
  /* Corner radius for .workspace-pane.multiple. @token --frame-workspace-pane-multiple-border-radius */
  --_frame-default-workspace-pane-multiple-border-radius-e7d1e51ac1: 0;
  border-radius: var(
    --frame-workspace-pane-multiple-border-radius,
    var(--_frame-default-workspace-pane-multiple-border-radius-e7d1e51ac1)
  );
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
  /* Width for .workspace-split.y > .resize-handle. @token --frame-workspace-split-y-resize-handle-width */
  --_frame-default-workspace-split-y-resize-handle-width-e5f41d9f68: 100%;
  width: var(
    --frame-workspace-split-y-resize-handle-width,
    var(--_frame-default-workspace-split-y-resize-handle-width-e5f41d9f68)
  );
}

.compact .workspace-pane.multiple {
  /* Corner radius for .compact .workspace-pane.multiple. @token --frame-compact-workspace-pane-multiple-border-radius */
  --_frame-default-compact-workspace-pane-multiple-border-radius-fef47e4cad: 0;
  border-radius: var(
    --frame-compact-workspace-pane-multiple-border-radius,
    var(
      --_frame-default-compact-workspace-pane-multiple-border-radius-fef47e4cad
    )
  );
}

.workspace-pane {
  position: relative;
}

.workspace-split {
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  background: var(--frame-line);
}

.workspace-pane {
  /* Content canvas background used by workspace panes and recessed content. @token --frame-canvas @context */
  background: var(--frame-canvas);
}

.pane-close {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
}
</style>
