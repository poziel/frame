<script setup lang="ts">
import {showWorkspaceContent} from './workspaceContent';
import {useFrame, FrameButton} from '@frame/core';
import type {WorkspacePaneContent} from '@frame/core';
import MarkdownDocument from '../markdown/MarkdownDocument.vue';
import {updateReferenceUrl} from './apiNavigation';

/** API prose and tables share the Markdown read by offline consumers. */
const props = defineProps<{
  name: string;
  previous?: WorkspacePaneContent;
  previousView?: string;
}>();
const frame = useFrame();
/** Returns to the caller-owned workspace presentation. */
function back(): void {
  if (!props.previous) return;
  showWorkspaceContent(frame, props.previous);
  if (props.previousView) frame.openSidePanel(props.previousView);
  updateReferenceUrl(
    typeof props.previous.props?.name === 'string'
      ? props.previous.props.name
      : undefined
  );
}
</script>

<template>
  <FrameButton v-if="previous" icon="arrow-left" @click="back"
    >Back to {{ previous.label }}</FrameButton
  >
  <MarkdownDocument :path="'reference/api/' + name + '.md'" />
</template>
