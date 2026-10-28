<script setup lang="ts">
import {useFrame} from '../../../../index';
import CodeEditor from '../../components/CodeEditor.vue';

const props = defineProps<{kind?: 'settings' | 'keybindings'}>();
const frame = useFrame();
const page = props.kind === 'keybindings' ? frame.keybindings : frame.settings;
const label =
  props.kind === 'keybindings' ? 'Keyboard Shortcuts JSON' : 'Settings JSON';
</script>
<template>
  <section class="frame-settings-json" :aria-label="`${label} editor`">
    <p v-if="page.json.error.value" role="alert">{{ page.json.error.value }}</p>
    <CodeEditor
      :model-value="page.json.draft.value"
      @update:model-value="
        page.json.draft.value = $event.replace(/\r\n?/g, '\n')
      "
      :read-only="page.json.saving.value"
      language="json"
      :label="label"
      autofocus
    />
  </section>
</template>
<style lang="scss" scoped>
.frame-settings-json {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  /* Color for .frame-settings-json; text. @token --frame-text @context */
  color: var(--frame-text);
  /* Background for .frame-settings-json; bg. @token --frame-bg @context */
  background: var(--frame-bg);
}
.frame-settings-json :deep(.frame-code-editor) {
  flex: 1;
  min-height: 0;
}
</style>
