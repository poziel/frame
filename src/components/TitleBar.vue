<script setup lang="ts">
import type { FrameMenuItem } from "../types";
import { computed, reactive } from "vue";
import { useFrame } from "../frame/createFrame";
import ContextMenu from "./ContextMenu.vue";
import { regionIcon } from "../frame/layoutIcons";
import logo from "../../public/frame.svg";
import AppIcon from "./AppIcon.vue";
import FrameTooltip from "./FrameTooltip.vue";
import MenuBar from "./MenuBar.vue";
defineProps<{ sidebarVisible: boolean; panelVisible: boolean; native: boolean; maximized: boolean; menuItems: readonly FrameMenuItem[]; titleText: string; showSearch: boolean; menuBarVisible: boolean; zenMode: boolean; primarySide: "left" | "right"; secondaryVisible: boolean }>();
const frame = useFrame();
const visible = reactive(new Set<string>());
const builtins = [ { id: "primary", label: "Toggle Primary Side Bar" }, { id: "bottom", label: "Toggle Panel" }, { id: "secondary", label: "Toggle Secondary Side Bar" } ];
const toolbarMenu = computed<FrameMenuItem[]>(() => [...builtins.map(item => ({ ...item, visibility: true, checked: visible.has(item.id) })), ...frame.toolbarActions.map(item => ({ id: item.id, label: item.label, visibility: true, checked: !!item.visible }))]);
function chooseToolbar(item: FrameMenuItem) {
  const action = frame.toolbarActions.find(action => action.id === item.id);
  if (action) action.visible = !action.visible;
  else if (visible.has(item.id)) visible.delete(item.id); else visible.add(item.id);
}
const emit = defineEmits<{ commands: []; execute: [id: string] }>();
</script>
<template>
  <header class="titlebar">
    <div class="titlebar-leading">
      <span v-if="!zenMode" class="app-mark" aria-label="Frame"><img :src="logo" alt="" width="18" height="18"/></span>
      <MenuBar v-if="menuBarVisible && !zenMode" :items="menuItems" @execute="emit('execute', $event)" />
    </div>
    <div class="titlebar-drag" data-tauri-drag-region />
    <FrameTooltip v-if="showSearch" text="Quick actions" shortcut="Ctrl+P" class="command-tooltip" v-slot="{ describedby }">
      <button class="workspace-command" aria-label="Open quick actions" :aria-describedby="describedby" @click="emit('commands')">
        <span>{{ titleText }}</span><AppIcon name="chevron" :size="12" />
      </button>
    </FrameTooltip>
    <div v-if="!showSearch" class="titlebar-text" data-tauri-drag-region>{{ titleText }}</div>
    <div class="titlebar-drag" data-tauri-drag-region />
    <div class="titlebar-layout">
      <ContextMenu :items="toolbarMenu" label="Title bar actions" @select="chooseToolbar"><FrameTooltip text="Customize layout" v-slot="{ describedby }"><button class="titlebar-button" aria-label="Customize layout" :aria-describedby="describedby" @click="emit('execute', 'frame.layout.customize')"><AppIcon name="layout" :size="16"/></button></FrameTooltip></ContextMenu>
      <FrameTooltip v-if="visible.has('primary')" text="Toggle primary sidebar" shortcut="Ctrl+B" v-slot="{ describedby }">
        <button class="titlebar-button" aria-label="Toggle primary sidebar" :aria-describedby="describedby" :aria-expanded="sidebarVisible" aria-controls="side-panel" @click="emit('execute', 'frame.sidebar.toggle')"><AppIcon :name="regionIcon('primary', sidebarVisible, primarySide)" :size="16" /></button>
      </FrameTooltip>
      <FrameTooltip v-if="visible.has('bottom')" text="Toggle bottom panel" shortcut="Ctrl+J" v-slot="{ describedby }">
        <button class="titlebar-button" aria-label="Toggle bottom panel" :aria-describedby="describedby" :aria-expanded="panelVisible" aria-controls="bottom-panel" @click="emit('execute', 'frame.panel.toggle')"><AppIcon :name="regionIcon('panel', panelVisible, primarySide)" :size="16" /></button>
      </FrameTooltip>
      <FrameTooltip v-if="visible.has('secondary')" text="Toggle secondary sidebar" shortcut="Ctrl+Alt+B" v-slot="{ describedby }"><button class="titlebar-button" aria-label="Toggle secondary sidebar" :aria-describedby="describedby" :aria-expanded="secondaryVisible" @click="emit('execute', 'frame.secondary.toggle')"><AppIcon :name="regionIcon('secondary', secondaryVisible, primarySide)" :size="16" /></button></FrameTooltip>
      <FrameTooltip v-for="action in frame.toolbarActions.filter(item => item.visible)" :key="action.id" :text="action.label"><button class="titlebar-button" :aria-label="action.label" :disabled="action.disabled" @click="action.run"><component v-if="action.icon" :is="action.icon"/><span v-else>{{ action.label }}</span></button></FrameTooltip>
    </div>
    <div class="window-controls" aria-label="Window controls">
      <FrameTooltip text="Minimize window" v-slot="{ describedby }">
        <button :disabled="!native" class="window-control" aria-label="Minimize window" :aria-describedby="describedby" @click="emit('execute', 'frame.window.minimize')"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6.5h10" stroke="currentColor" /></svg></button>
      </FrameTooltip>
      <FrameTooltip :text="maximized ? 'Restore window' : 'Maximize window'" v-slot="{ describedby }">
        <button :disabled="!native" class="window-control" :aria-label="maximized ? 'Restore window' : 'Maximize window'" :aria-describedby="describedby" @click="emit('execute', 'frame.window.maximize')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path v-if="maximized" d="M3.5 3.5v-2h7v7h-2 M1.5 3.5h7v7h-7z" /><path v-else d="M1.5 1.5h9v9h-9z" /></svg>
        </button>
      </FrameTooltip>
      <FrameTooltip text="Close window" v-slot="{ describedby }">
        <button :disabled="!native" class="window-control window-close" aria-label="Close window" :aria-describedby="describedby" @click="emit('execute', 'frame.window.close')"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m1.5 1.5 9 9m-9 0 9-9" stroke="currentColor" /></svg></button>
      </FrameTooltip>
    </div>
  </header>
</template>



