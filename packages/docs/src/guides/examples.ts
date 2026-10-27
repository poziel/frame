// Keep sample imports outside Vue SFCs: Vite's TS dependency scan also matches imports inside strings.
export const setupExample=`<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import '@frame/core/style.css';
import ProjectView from './ProjectView.vue';

const frame = createFrame({ navigation: true });
frame.setWorkspacePane(frame.workspace.activePane.value, {
  label: 'My project',
  component: ProjectView,
});

onBeforeUnmount(() => frame.dispose());
</script>

<template>
  <FrameShell :frame="frame" title-text="My application" />
</template>`;
export const viewExample=`import { useFrame } from '@frame/core';
import SearchView from './SearchView.vue';

const frame = useFrame();
const unregister = frame.registerView({
  id: 'project.search',
  label: 'Search',
  component: SearchView,
}, 'primary');

frame.openSidePanel('project.search');
// Call unregister() when this contribution is no longer needed.`;
