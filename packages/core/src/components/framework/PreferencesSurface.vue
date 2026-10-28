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
<style lang="scss" scoped>
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
  /* Space between children for .preferences-toolbar. @token --frame-modal-header-gap */
  --_frame-default-modal-header-gap-6eb82ae436: 8px;
  gap: var(
    --frame-modal-header-gap,
    var(--_frame-default-modal-header-gap-6eb82ae436)
  );
  padding: 8px 10px;
  flex-shrink: 0;
}
.preferences-search {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  /* Background for .preferences-search. @token --frame-control-background */
  --_frame-default-control-background-3a95faa91f: var(--frame-bg);
  background: var(
    --frame-control-background,
    var(--_frame-default-control-background-3a95faa91f)
  );
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-text);
  /* Shared resting border color inherited by menus and form controls. @token --frame-border-color @context */
  border: 1px solid var(--frame-border-color);
  /* Corner radius for .preferences-search. @token --frame-radius-medium */
  --_frame-default-radius-medium-48b47b16d5: 4px;
  border-radius: var(
    --frame-radius-medium,
    var(--_frame-default-radius-medium-48b47b16d5)
  );
  font: inherit;
}
.preferences-search:focus-visible {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  outline: 1px solid var(--frame-accent);
  outline-offset: -1px;
}
.settings-presentation-actions {
  display: flex;
  justify-content: flex-end;
  /* Space between children for .settings-presentation-actions. @token --frame-modal-header-gap */
  --_frame-default-modal-header-gap-70c5a4096d: 8px;
  gap: var(
    --frame-modal-header-gap,
    var(--_frame-default-modal-header-gap-70c5a4096d)
  );
  margin-left: auto;
}
</style>
