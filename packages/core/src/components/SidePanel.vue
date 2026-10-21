<script setup lang="ts">
import PanelActions from "./PanelActions.vue";
import type { PanelAction } from "../types";

import FrameIconButton from "./FrameIconButton.vue";
defineProps<{ title: string; actions?: readonly PanelAction[]; padded?: boolean; empty?: boolean }>();
defineEmits<{ close: [] }>();
</script>
<template>
  <aside id="side-panel" class="side-panel" data-view-region="primary" :aria-label="title">
    <header class="section-header">
      <h2>{{ title }}</h2>
      <PanelActions :actions="actions"/><slot name="actions"/>
      <FrameIconButton label="Hide primary sidebar" icon="layout-sidebar-left" shortcut="Ctrl+B" :icon-size="15" @click="$emit('close')"/>
    </header>
    <p v-if="empty" class="empty-view-region">Drag a view here to display.</p>
    <div class="side-content" :class="{ unpadded: padded === false }"><slot /></div>
  </aside>
</template>
