<script setup lang="ts">
import {computed, ref} from 'vue';
import {useFrame} from '../../framework/useFrame';
import FrameSettings from './FrameSettings.vue';
import FrameKeybindings from './FrameKeybindings.vue';
import PreferencesHeaderActions from './PreferencesHeaderActions.vue';

const props = defineProps<{kind: 'settings' | 'keybindings'}>();
const frame = useFrame();
const page = computed(() => frame[props.kind]);
const inModal = computed(() =>
  frame.modals.some((modal) => modal.id === `frame.${props.kind}`)
);
const label = computed(() =>
  props.kind === 'settings' ? 'settings' : 'keyboard shortcuts'
);
const searchInput = ref<HTMLInputElement>();
</script>
<template>
  <div
    class="settings-presentation"
    :data-frame-settings-surface="kind === 'settings' ? '' : undefined"
    :data-frame-keybindings-surface="kind === 'keybindings' ? '' : undefined"
  >
    <div class="preferences-toolbar">
      <input
        v-if="page.mode.value === 'form'"
        ref="searchInput"
        v-model="page.search.value"
        class="preferences-search"
        type="search"
        :aria-label="`Search ${label}`"
        :placeholder="`Search ${label}`"
      />
      <div v-if="!inModal" class="settings-presentation-actions"
        ><PreferencesHeaderActions :kind="kind"
      /></div>
    </div>
    <FrameSettings
      v-if="kind === 'settings'"
      v-show="page.mode.value === 'form'"
    />
    <FrameKeybindings
      v-else
      v-show="page.mode.value === 'form'"
      v-model:search="page.search.value"
      hide-search
      @focus-search="searchInput?.focus()"
    />
    <component
      :is="page.editor.value.component"
      v-if="page.mode.value === 'json' && page.editor.value"
      v-bind="page.editor.value.props"
    />
    <p
      v-if="kind === 'keybindings' && frame.keybindings.error.value"
      role="alert"
      >{{ frame.keybindings.error.value }}</p
    >
  </div>
</template>
<style scoped>
.settings-presentation {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.settings-presentation > :not(.preferences-toolbar):not([role='alert']) {
  flex: 1;
  min-height: 0;
}
.preferences-toolbar {
  display: flex;
  align-items: center;
  gap: var(--frame-modal-header-gap, 8px);
  padding: 8px 10px;
  flex-shrink: 0;
}
.preferences-search {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  background: var(--frame-control-background, var(--frame-bg));
  color: var(--frame-text);
  border: 1px solid var(--frame-border-color);
  border-radius: var(--frame-radius-medium, 4px);
  font: inherit;
}
.preferences-search:focus-visible {
  outline: 1px solid var(--frame-accent);
  outline-offset: -1px;
}
.settings-presentation-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--frame-modal-header-gap, 8px);
  margin-left: auto;
}
</style>
