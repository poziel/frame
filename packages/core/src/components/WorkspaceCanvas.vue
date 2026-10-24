<script setup lang="ts">
import logo from "../../../../assets/frame.svg";
defineProps<{ embedded?: boolean }>();
defineEmits<{ commands: []; toggleSidebar: []; togglePanel: [] }>();
</script>

<template>
  <component :is="embedded ? 'section' : 'main'" :id="embedded ? undefined : 'workspace'" class="workspace" tabindex="-1" aria-label="Workspace">
    <slot>
      <section class="empty-workspace" aria-label="Welcome to Frame">
        <h1 class="sr-only">Frame workspace</h1>
        <img :src="logo" class="canvas-mark" width="210" height="210" alt="" draggable="false" style="user-select:none;-webkit-user-drag:none" />
        <div class="canvas-shortcuts">
          <button @click="$emit('commands')"><span>Show all commands</span><span><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></span></button>
          <button @click="$emit('toggleSidebar')"><span>Toggle primary sidebar</span><span><kbd>Ctrl</kbd> + <kbd>B</kbd></span></button>
          <button @click="$emit('togglePanel')"><span>Toggle panel</span><span><kbd>Ctrl</kbd> + <kbd>J</kbd></span></button>
        </div>
      </section>
    </slot>
  </component>
</template>
