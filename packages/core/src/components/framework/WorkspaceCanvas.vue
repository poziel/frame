<script setup lang="ts">
import logo from '../../../../../assets/frame.svg';

defineProps<{embedded?: boolean}>();
defineEmits<{commands: []; toggleSidebar: []; togglePanel: []}>();
</script>

<template>
  <component
    :is="embedded ? 'section' : 'main'"
    :id="embedded ? undefined : 'workspace'"
    class="workspace frame-workspace-surface"
    tabindex="-1"
    aria-label="Workspace"
  >
    <slot>
      <section class="empty-workspace" aria-label="Welcome to Frame">
        <h1 class="sr-only">Frame workspace</h1>
        <img
          :src="logo"
          class="canvas-mark"
          width="210"
          height="210"
          alt=""
          draggable="false"
          style="user-select: none; -webkit-user-drag: none"
        />
        <div class="canvas-shortcuts">
          <button @click="$emit('commands')"
            ><span>Show all commands</span
            ><span
              ><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></span
            ></button
          >
          <button @click="$emit('toggleSidebar')"
            ><span>Toggle primary sidebar</span
            ><span><kbd>Ctrl</kbd> + <kbd>B</kbd></span></button
          >
          <button @click="$emit('togglePanel')"
            ><span>Toggle panel</span
            ><span><kbd>Ctrl</kbd> + <kbd>J</kbd></span></button
          >
        </div>
      </section>
    </slot>
  </component>
</template>

<style lang="scss">
/* WorkspaceCanvas exposes a slot; future tools occupy this surface. */

.empty-workspace {
  width: var(--frame-empty-workspace-width, 100%);
  min-height: var(--frame-empty-workspace-min-height, min-content);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--frame-empty-workspace-padding, 35px 24px);
  user-select: none;
}

.canvas-mark {
  color: var(--frame-canvas-mark-color, #0c0e0f);
  width: var(--frame-canvas-mark-width, clamp(120px, 24vw, 210px));
  height: auto;
  margin-bottom: var(--frame-canvas-mark-margin-bottom, 28px);
}

.canvas-shortcuts {
  width: var(--frame-canvas-shortcuts-width, 290px);
  max-width: var(--frame-canvas-shortcuts-max-width, 100%);
  display: grid;
  gap: var(--frame-canvas-shortcuts-gap, 2px);
}

.canvas-shortcuts button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--frame-canvas-shortcuts-button-gap, 15px);
  width: var(--frame-canvas-shortcuts-button-width, 100%);
  font-size: var(--frame-canvas-shortcuts-button-font-size, 12px);
  padding: var(--frame-canvas-shortcuts-button-padding, 5px 0);
  color: var(--frame-canvas-shortcuts-button-color, #929ca2);
  text-align: left;
}

.canvas-shortcuts button:hover > span:first-child {
  color: var(
    --frame-canvas-shortcuts-button-hover-span-first-child-color,
    #c5cdd1
  );
}

.canvas-shortcuts button > span:last-child {
  white-space: nowrap;
  font-size: var(
    --frame-canvas-shortcuts-button-span-last-child-font-size,
    10px
  );
  color: var(--frame-canvas-shortcuts-button-span-last-child-color, #737c81);
}

.canvas-mark {
  opacity: var(--frame-canvas-mark-opacity, 0.08);
  filter: grayscale(1);
  object-fit: contain;
}

// Keep responsive overrides with their bases when this style block is imported alone.
@media (max-width: 540px) {
  .canvas-shortcuts button {
    font-size: var(--frame-canvas-shortcuts-button-font-size-2, 10px);
    gap: var(--frame-canvas-shortcuts-button-gap-2, 8px);
  }
  .canvas-shortcuts kbd {
    font-size: var(--frame-canvas-shortcuts-kbd-font-size, 9px);
    padding: var(--frame-canvas-shortcuts-kbd-padding, 0 3px);
  }
  .empty-workspace {
    padding: var(--frame-empty-workspace-padding-2, 24px 16px);
  }
}
</style>
