<script setup lang="ts">
import { useFrame } from "../frame/createFrame";
import PanelActions from "./PanelActions.vue";
import type { PanelAction } from "../types";

import FrameIconButton from "./FrameIconButton.vue";
const props=withDefaults(defineProps<{ region?: "primary" | "secondary"; title: string; actions?: readonly PanelAction[]; padded?: boolean; empty?: boolean }>(), {region:"primary"});
const frame=useFrame();
defineEmits<{ close: []; context: [event:MouseEvent] }>();
</script>
<template>
  <aside :id="region==='primary'?'side-panel':'secondary-panel'" class="side-panel" :data-view-region="region" :aria-label="title">
    <header class="section-header" @contextmenu="$emit('context',$event)">
      <h2 class="side-title">{{ title }}</h2>
      <PanelActions :actions="actions" :feature="region==='primary'?'primarySidebar':'secondarySidebar'"/><slot name="actions"/>
      <FrameIconButton :label="region==='primary'?'Hide primary sidebar':'Hide secondary sidebar'" :icon="(region==='primary'?frame.layout.primarySide==='left':frame.layout.primarySide==='right')?'layout-sidebar-left':'layout-sidebar-right'" :shortcut="region==='primary'?'Ctrl+B':'Ctrl+Alt+B'" :icon-size="15" @click="$emit('close')"/>
    </header>
    <p v-if="empty" class="empty-view-region">Drag a view here to display.</p>
    <div class="side-content" :class="{ unpadded: padded === false }"><slot /></div>
  </aside>
</template>
