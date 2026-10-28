<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import type * as Monaco from 'monaco-editor';
import type {
  CodeEditorProps,
  CodeEditorController,
} from '../controllers/codeEditor';
import {EditorSurface} from '../controllers/editorSurface';

// Preserve omission: Vue otherwise casts an absent optional Boolean to false.
const props = withDefaults(defineProps<CodeEditorProps>(), {
  readOnly: undefined,
});
const emit = defineEmits<{
  /** Controlled source text after a Monaco edit. */
  'update:modelValue': [code: string];
  /** Mounted controller after its first successful attachment. */
  ready: [editor: CodeEditorController];
  /** Source text and Monaco metadata for each content change. */
  change: [code: string, event: Monaco.editor.IModelContentChangedEvent];
  /** Cursor selections reported by the mounted editor. */
  selection: [event: Monaco.editor.ICursorSelectionChangedEvent];
  /** Widget focus, including its internal controls. */
  focus: [];
  /** Widget blur after focus leaves the editor. */
  blur: [];
  /** Syntax preparation or controller attachment failure. */
  error: [cause: unknown];
}>();
const host = ref<HTMLElement>();
const surface = new EditorSurface(props, () => host.value, {emit});
const {loading, error} = surface;
watch(() => props.modelValue, surface.syncValue);
watch(
  () => [props.options, props.readOnly, props.label],
  surface.updateOptions,
  {deep: true}
);
watch(
  () => [props.language, props.theme],
  () => surface.refreshSyntax()
);
watch(() => props.editor, surface.setController);
onMounted(surface.mount);
onBeforeUnmount(surface.dispose);

/** Imperative component access delegates to the currently attached controller. */
defineExpose({
  /** Current caller-supplied or fallback controller. */
  get controller() {
    return surface.controller;
  },
  /** Widget focus, including its internal controls. */
  /** Focuses whichever controller currently owns the surface. */
  focus: () => surface.controller.focus(),
});
</script>
<template>
  <div class="frame-code-editor" :aria-busy="loading">
    <div ref="host" class="frame-code-editor-host" />
    <p v-if="error" class="frame-code-editor-status" role="alert">{{
      error
    }}</p>
    <p v-else-if="loading" class="frame-code-editor-status" role="status"
      >Loading editor…</p
    >
  </div>
</template>

<style lang="scss">
.frame-code-editor {
  position: relative;
  width: var(--frame-code-editor-width, 100%);
  height: var(--frame-code-editor-height, 100%);
  min-width: var(--frame-code-editor-min-width, 0);
  min-height: var(--frame-code-editor-min-height, 0);
  overflow: hidden;
}

.frame-code-editor-host {
  width: var(--frame-code-editor-host-width, 100%);
  height: var(--frame-code-editor-host-height, 100%);
}

.frame-code-editor-status {
  position: absolute;
  inset: 0;
  margin: var(--frame-code-editor-status-margin, 0);
  padding: var(--frame-code-editor-status-padding, 12px);
  background: var(--frame-bg, #1e1e1e);
  color: var(--frame-fg, #d4d4d4);
}
</style>
