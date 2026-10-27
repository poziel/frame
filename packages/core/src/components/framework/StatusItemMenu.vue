<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, useId} from 'vue';
import {ContextMenuCommands} from '../../framework/commands/contextMenuCommands';
import {useFrame} from '../../framework/useFrame';
import {StatusMenu} from '../../framework/views/statusMenu';
import FrameContextMenu from '../navigation/FrameContextMenu.vue';
import type {FrameMenuItem} from '../navigation/generalMenu';
import {toolbarStatusPrefix} from '../../framework/views/toolbarStatus';

const props = defineProps<{
  anchor: HTMLElement;
  point: {x: number; y: number};
  targetId?: string;
}>();
const emit = defineEmits<{close: []}>();
const frame = useFrame();
const statusMenu = new StatusMenu(frame);
const contextMenuCommands = new ContextMenuCommands(
  frame,
  'frame.context.status.' + useId(),
  () => 'statusBar',
  (item) => statusMenu.select(props.targetId, item.id)
);
onBeforeUnmount(contextMenuCommands.dispose);
const items = computed(() =>
  contextMenuCommands.bind(statusMenu.items(props.targetId))
);
function select(item: FrameMenuItem) {
  const shell = props.anchor.closest('.workbench');
  if (item.type !== 'separator' && item.command)
    void frame.commands.execute(item.command);
  if (item.id === 'move-target' || item.id === 'manage-position')
    void nextTick(() => {
      [...(shell?.querySelectorAll<HTMLElement>('[data-status-id]') ?? [])]
        .find((element) => element.dataset.statusId === props.targetId)
        ?.querySelector<HTMLElement>('[data-status-control]')
        ?.focus();
    });
  if (item.id === 'toolbar-title')
    void nextTick(() => {
      [
        ...(shell?.querySelectorAll<HTMLElement>('[data-toolbar-control]') ??
          []),
      ]
        .find(
          (element) =>
            element.dataset.toolbarControl ===
            props.targetId?.slice(toolbarStatusPrefix.length)
        )
        ?.focus();
    });
}
</script>
<template>
  <FrameContextMenu
    :anchor="anchor"
    :point="point"
    :items="items"
    label="Status bar actions"
    @select="select"
    @close="emit('close')"
  />
</template>
