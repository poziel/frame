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
  /* Width for .empty-workspace. @token --frame-empty-workspace-width */
  --_frame-default-empty-workspace-width-d9e000d49f: 100%;
  width: var(
    --frame-empty-workspace-width,
    var(--_frame-default-empty-workspace-width-d9e000d49f)
  );
  /* Minimum height for .empty-workspace. @token --frame-empty-workspace-min-height */
  --_frame-default-empty-workspace-min-height-37af5ed9bb: min-content;
  min-height: var(
    --frame-empty-workspace-min-height,
    var(--_frame-default-empty-workspace-min-height-37af5ed9bb)
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Internal spacing for .empty-workspace. @token --frame-empty-workspace-padding */
  --_frame-default-empty-workspace-padding-5f7e8b4a87: 35px 24px;
  padding: var(
    --frame-empty-workspace-padding,
    var(--_frame-default-empty-workspace-padding-5f7e8b4a87)
  );
  user-select: none;
}

.canvas-mark {
  /* Foreground for .canvas-mark. @token --frame-canvas-mark-color */
  --_frame-default-canvas-mark-color-c59f35347a: #0c0e0f;
  color: var(
    --frame-canvas-mark-color,
    var(--_frame-default-canvas-mark-color-c59f35347a)
  );
  /* Width for .canvas-mark. @token --frame-canvas-mark-width */
  --_frame-default-canvas-mark-width-d7772052bb: clamp(120px, 24vw, 210px);
  width: var(
    --frame-canvas-mark-width,
    var(--_frame-default-canvas-mark-width-d7772052bb)
  );
  height: auto;
  /* Bottom outer spacing for .canvas-mark. @token --frame-canvas-mark-margin-bottom */
  --_frame-default-canvas-mark-margin-bottom-31936ee8cb: 28px;
  margin-bottom: var(
    --frame-canvas-mark-margin-bottom,
    var(--_frame-default-canvas-mark-margin-bottom-31936ee8cb)
  );
}

.canvas-shortcuts {
  /* Width for .canvas-shortcuts. @token --frame-canvas-shortcuts-width */
  --_frame-default-canvas-shortcuts-width-adc6c481f8: 290px;
  width: var(
    --frame-canvas-shortcuts-width,
    var(--_frame-default-canvas-shortcuts-width-adc6c481f8)
  );
  /* Maximum width for .canvas-shortcuts. @token --frame-canvas-shortcuts-max-width */
  --_frame-default-canvas-shortcuts-max-width-e8b1a305d0: 100%;
  max-width: var(
    --frame-canvas-shortcuts-max-width,
    var(--_frame-default-canvas-shortcuts-max-width-e8b1a305d0)
  );
  display: grid;
  /* Space between children for .canvas-shortcuts. @token --frame-canvas-shortcuts-gap */
  --_frame-default-canvas-shortcuts-gap-4a86e745bb: 2px;
  gap: var(
    --frame-canvas-shortcuts-gap,
    var(--_frame-default-canvas-shortcuts-gap-4a86e745bb)
  );
}

.canvas-shortcuts button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Space between children for .canvas-shortcuts button. @token --frame-canvas-shortcuts-button-gap */
  --_frame-default-canvas-shortcuts-button-gap-f33ea70891: 15px;
  gap: var(
    --frame-canvas-shortcuts-button-gap,
    var(--_frame-default-canvas-shortcuts-button-gap-f33ea70891)
  );
  /* Width for .canvas-shortcuts button. @token --frame-canvas-shortcuts-button-width */
  --_frame-default-canvas-shortcuts-button-width-590cd6b084: 100%;
  width: var(
    --frame-canvas-shortcuts-button-width,
    var(--_frame-default-canvas-shortcuts-button-width-590cd6b084)
  );
  /* Text size for .canvas-shortcuts button. @token --frame-canvas-shortcuts-button-font-size */
  --_frame-default-canvas-shortcuts-button-font-size-f03b1072d0: 12px;
  font-size: var(
    --frame-canvas-shortcuts-button-font-size,
    var(--_frame-default-canvas-shortcuts-button-font-size-f03b1072d0)
  );
  /* Internal spacing for .canvas-shortcuts button. @token --frame-canvas-shortcuts-button-padding */
  --_frame-default-canvas-shortcuts-button-padding-a031b87cb7: 5px 0;
  padding: var(
    --frame-canvas-shortcuts-button-padding,
    var(--_frame-default-canvas-shortcuts-button-padding-a031b87cb7)
  );
  /* Foreground for .canvas-shortcuts button. @token --frame-canvas-shortcuts-button-color */
  --_frame-default-canvas-shortcuts-button-color-c2afb29d18: #929ca2;
  color: var(
    --frame-canvas-shortcuts-button-color,
    var(--_frame-default-canvas-shortcuts-button-color-c2afb29d18)
  );
  text-align: left;
}

.canvas-shortcuts button:hover > span:first-child {
  /* Foreground for .canvas-shortcuts button:hover > span:first-child. @token --frame-canvas-shortcuts-button-hover-span-first-child-color */
  --_frame-default-canvas-shortcuts-button-hover-span-first-child-color-be5622fce4: #c5cdd1;
  color: var(
    --frame-canvas-shortcuts-button-hover-span-first-child-color,
    var(
      --_frame-default-canvas-shortcuts-button-hover-span-first-child-color-be5622fce4
    )
  );
}

.canvas-shortcuts button > span:last-child {
  white-space: nowrap;
  /* Text size for .canvas-shortcuts button > span:last-child. @token --frame-canvas-shortcuts-button-span-last-child-font-size */
  --_frame-default-canvas-shortcuts-button-span-last-child-font-size-879e610690: 10px;
  font-size: var(
    --frame-canvas-shortcuts-button-span-last-child-font-size,
    var(
      --_frame-default-canvas-shortcuts-button-span-last-child-font-size-879e610690
    )
  );
  /* Foreground for .canvas-shortcuts button > span:last-child. @token --frame-canvas-shortcuts-button-span-last-child-color */
  --_frame-default-canvas-shortcuts-button-span-last-child-color-3ae0ac744c: #737c81;
  color: var(
    --frame-canvas-shortcuts-button-span-last-child-color,
    var(
      --_frame-default-canvas-shortcuts-button-span-last-child-color-3ae0ac744c
    )
  );
}

.canvas-mark {
  /* Opacity for .canvas-mark. @token --frame-canvas-mark-opacity */
  --_frame-default-canvas-mark-opacity-bcf1c7a0f1: 0.08;
  opacity: var(
    --frame-canvas-mark-opacity,
    var(--_frame-default-canvas-mark-opacity-bcf1c7a0f1)
  );
  filter: grayscale(1);
  object-fit: contain;
}

// Keep responsive overrides with their bases when this style block is imported alone.
@media (max-width: 540px) {
  .canvas-shortcuts button {
    /* Text size for .canvas-shortcuts button. @token --frame-canvas-shortcuts-button-font-size-2 */
    --_frame-default-canvas-shortcuts-button-font-size-2-db87c4e133: 10px;
    font-size: var(
      --frame-canvas-shortcuts-button-font-size-2,
      var(--_frame-default-canvas-shortcuts-button-font-size-2-db87c4e133)
    );
    /* Space between children for .canvas-shortcuts button. @token --frame-canvas-shortcuts-button-gap-2 */
    --_frame-default-canvas-shortcuts-button-gap-2-86c642535f: 8px;
    gap: var(
      --frame-canvas-shortcuts-button-gap-2,
      var(--_frame-default-canvas-shortcuts-button-gap-2-86c642535f)
    );
  }
  .canvas-shortcuts kbd {
    /* Text size for .canvas-shortcuts kbd. @token --frame-canvas-shortcuts-kbd-font-size */
    --_frame-default-canvas-shortcuts-kbd-font-size-508c6db931: 9px;
    font-size: var(
      --frame-canvas-shortcuts-kbd-font-size,
      var(--_frame-default-canvas-shortcuts-kbd-font-size-508c6db931)
    );
    /* Internal spacing for .canvas-shortcuts kbd. @token --frame-canvas-shortcuts-kbd-padding */
    --_frame-default-canvas-shortcuts-kbd-padding-38724a8ff0: 0 3px;
    padding: var(
      --frame-canvas-shortcuts-kbd-padding,
      var(--_frame-default-canvas-shortcuts-kbd-padding-38724a8ff0)
    );
  }
  .empty-workspace {
    /* Internal spacing for .empty-workspace. @token --frame-empty-workspace-padding-2 */
    --_frame-default-empty-workspace-padding-2-dd7e10764a: 24px 16px;
    padding: var(
      --frame-empty-workspace-padding-2,
      var(--_frame-default-empty-workspace-padding-2-dd7e10764a)
    );
  }
}
</style>
