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
  padding: var(--frame-pane-placeholder-padding, 24px);
  color: var(--frame-muted);
}

.pane-placeholder h2 {
  font-size: var(--frame-pane-placeholder-h2-font-size, 16px);
  font-weight: var(--frame-pane-placeholder-h2-font-weight, 500);
}

.pane-placeholder > img {
  width: var(--frame-pane-placeholder-img-width, min(42%, 220px));
  max-height: var(--frame-pane-placeholder-img-max-height, 55%);
  object-fit: contain;
  opacity: var(--frame-pane-placeholder-img-opacity, 0.06);
  filter: grayscale(1);
  pointer-events: none;
}

.pane-placeholder.is-focused > img {
  opacity: var(--frame-pane-placeholder-is-focused-img-opacity, 0.15);
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
  color: var(--frame-muted);
}
.pane-welcome-actions kbd {
  font: inherit;
  font-size: 0.85em;
  color: var(--frame-muted);
  white-space: nowrap;
}
</style>
