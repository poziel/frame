<script setup lang="ts">
import {computed} from 'vue';
import logo from '../../../../../assets/frame.svg';
import {useFrame} from '../../framework/useFrame';
import FrameButton from '../actions/FrameButton.vue';

defineProps<{active: boolean}>();
const frame = useFrame();
const actions = computed(() =>
  (frame.workspace.options.welcome?.commands ?? []).flatMap((id) => {
    const command = frame.commands.get(id);
    return command && frame.commands.isVisible(id) ? [command] : [];
  })
);
</script>
<template>
  <div class="pane-placeholder" :class="{'is-focused': active}"
    ><img
      :src="logo"
      alt="Frame"
      draggable="false"
      style="user-select: none; -webkit-user-drag: none"
    /><div v-if="actions.length" class="pane-welcome-actions"
      ><FrameButton
        v-for="command in actions"
        :key="command.id"
        variant="ghost"
        :disabled="!frame.commands.isEnabled(command.id)"
        @click="frame.commands.execute(command.id)"
        ><span>{{ command.label }}</span
        ><kbd v-if="command.shortcut">{{ command.shortcut }}</kbd></FrameButton
      ></div
    ></div
  >
</template>

<style lang="scss">
.pane-placeholder {
  user-select: none;
}

.pane-placeholder {
  /* Internal spacing for .pane-placeholder. @token --frame-pane-placeholder-padding */
  --_frame-default-pane-placeholder-padding-0d2d641a94: 24px;
  padding: var(
    --frame-pane-placeholder-padding,
    var(--_frame-default-pane-placeholder-padding-0d2d641a94)
  );
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
}

.pane-placeholder h2 {
  /* Text size for .pane-placeholder h2. @token --frame-pane-placeholder-h2-font-size */
  --_frame-default-pane-placeholder-h2-font-size-984133ffdd: 16px;
  font-size: var(
    --frame-pane-placeholder-h2-font-size,
    var(--_frame-default-pane-placeholder-h2-font-size-984133ffdd)
  );
  /* Text weight for .pane-placeholder h2. @token --frame-pane-placeholder-h2-font-weight */
  --_frame-default-pane-placeholder-h2-font-weight-c4e8145b82: 500;
  font-weight: var(
    --frame-pane-placeholder-h2-font-weight,
    var(--_frame-default-pane-placeholder-h2-font-weight-c4e8145b82)
  );
}

.pane-placeholder > img {
  /* Width for .pane-placeholder > img. @token --frame-pane-placeholder-img-width */
  --_frame-default-pane-placeholder-img-width-3976ef4776: min(42%, 220px);
  width: var(
    --frame-pane-placeholder-img-width,
    var(--_frame-default-pane-placeholder-img-width-3976ef4776)
  );
  /* Maximum height for .pane-placeholder > img. @token --frame-pane-placeholder-img-max-height */
  --_frame-default-pane-placeholder-img-max-height-473c7da838: 55%;
  max-height: var(
    --frame-pane-placeholder-img-max-height,
    var(--_frame-default-pane-placeholder-img-max-height-473c7da838)
  );
  object-fit: contain;
  /* Opacity for .pane-placeholder > img. @token --frame-pane-placeholder-img-opacity */
  --_frame-default-pane-placeholder-img-opacity-16e6da2a5d: 0.06;
  opacity: var(
    --frame-pane-placeholder-img-opacity,
    var(--_frame-default-pane-placeholder-img-opacity-16e6da2a5d)
  );
  filter: grayscale(1);
  pointer-events: none;
}

.pane-placeholder.is-focused > img {
  /* Opacity for .pane-placeholder.is-focused > img. @token --frame-pane-placeholder-is-focused-img-opacity */
  --_frame-default-pane-placeholder-is-focused-img-opacity-afc20b73c5: 0.15;
  opacity: var(
    --frame-pane-placeholder-is-focused-img-opacity,
    var(--_frame-default-pane-placeholder-is-focused-img-opacity-afc20b73c5)
  );
}

.pane-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
.pane-welcome-actions {
  display: flex;
  flex-direction: column;
  min-width: 240px;
  max-width: 100%;
}
.pane-welcome-actions .frame-button {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  padding: 6px 10px;
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
}
.pane-welcome-actions kbd {
  font: inherit;
  font-size: 0.85em;
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
  white-space: nowrap;
}
</style>
