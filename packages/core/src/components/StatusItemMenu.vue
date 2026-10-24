<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, useId } from 'vue';
import { createCommandMenu } from '../frame/commandMenu';
import { useFrame } from '../frame/createFrame';
import { statusMenuItems, selectStatusMenuItem } from '../frame/statusMenu';
import FrameContextMenu from './FrameContextMenu.vue';
import type { FrameMenuItem } from '../types';
import { toolbarStatusPrefix } from '../frame/toolbarStatus';
const props = defineProps<{ anchor: HTMLElement; point: { x: number; y: number }; targetId?: string }>();
const emit = defineEmits<{ close: [] }>();
const frame = useFrame();
const commandMenu = createCommandMenu(frame, 'frame.context.status.'+useId(), () => 'statusBar', item => selectStatusMenuItem(frame, props.targetId, item.id));
onBeforeUnmount(commandMenu.dispose);
const items = computed(() => commandMenu.bind(statusMenuItems(frame, props.targetId)));
function select(item: FrameMenuItem) {
  const shell = props.anchor.closest('.workbench');
  if(item.type!=='separator'&&item.command)void frame.commands.execute(item.command);
  if (item.id === 'move-target' || item.id === 'manage-position') void nextTick(() => {
    [...shell?.querySelectorAll<HTMLElement>('[data-status-id]') ?? []]
      .find(element => element.dataset.statusId === props.targetId)?.querySelector<HTMLElement>('[data-status-control]')?.focus();
  });
  if (item.id === 'toolbar-title') void nextTick(() => {
    [...shell?.querySelectorAll<HTMLElement>('[data-toolbar-control]') ?? []]
      .find(element => element.dataset.toolbarControl === props.targetId?.slice(toolbarStatusPrefix.length))?.focus();
  });
}
</script>
<template><FrameContextMenu :anchor="anchor" :point="point" :items="items" label="Status bar actions" @select="select" @close="emit('close')" /></template>
