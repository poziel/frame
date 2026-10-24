<script setup lang="ts">
import { showWorkspaceContent } from './workspaceContent';
import FrameButton from "../../../core/src/components/FrameButton.vue";
import BundledIconCatalog from "./BundledIconCatalog.vue";
import OnlineIcons from "./OnlineIcons.vue";
import { useFrame } from "../../../core/src/frame/createFrame";
import ComponentExamplePage from "./ComponentExamplePage.vue";
defineProps<{ online?: boolean }>();
const frame = useFrame();
function back() { showWorkspaceContent(frame, { label: "Icons", component: ComponentExamplePage, props: { componentId: "icons" } }); }
</script>
<template><div class="icon-library-page" :class="{ online }"><header><FrameButton icon="arrow-left" @click="back">Icons documentation</FrameButton><h1>{{ online ? 'Online icons' : 'Included icons' }}</h1></header><OnlineIcons v-if="online"/><BundledIconCatalog v-else/></div></template>
