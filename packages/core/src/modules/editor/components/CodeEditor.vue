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
  /* Width for .frame-code-editor; code editor width. @token --frame-code-editor-width */
  --_frame-default-code-editor-width-0441272e1f: 100%;
  width: var(
    --frame-code-editor-width,
    var(--_frame-default-code-editor-width-0441272e1f)
  );
  /* Height for .frame-code-editor; code editor height. @token --frame-code-editor-height */
  --_frame-default-code-editor-height-248f8a3e08: 100%;
  height: var(
    --frame-code-editor-height,
    var(--_frame-default-code-editor-height-248f8a3e08)
  );
  /* Min width for .frame-code-editor; code editor min width. @token --frame-code-editor-min-width */
  --_frame-default-code-editor-min-width-9a7174d61d: 0;
  min-width: var(
    --frame-code-editor-min-width,
    var(--_frame-default-code-editor-min-width-9a7174d61d)
  );
  /* Min height for .frame-code-editor; code editor min height. @token --frame-code-editor-min-height */
  --_frame-default-code-editor-min-height-1a5facdad6: 0;
  min-height: var(
    --frame-code-editor-min-height,
    var(--_frame-default-code-editor-min-height-1a5facdad6)
  );
  overflow: hidden;
}

.frame-code-editor-host {
  /* Width for .frame-code-editor-host; code editor host width. @token --frame-code-editor-host-width */
  --_frame-default-code-editor-host-width-3dee280ce1: 100%;
  width: var(
    --frame-code-editor-host-width,
    var(--_frame-default-code-editor-host-width-3dee280ce1)
  );
  /* Height for .frame-code-editor-host; code editor host height. @token --frame-code-editor-host-height */
  --_frame-default-code-editor-host-height-715320bb31: 100%;
  height: var(
    --frame-code-editor-host-height,
    var(--_frame-default-code-editor-host-height-715320bb31)
  );
}

.frame-code-editor-status {
  position: absolute;
  inset: 0;
  /* Margin for .frame-code-editor-status; code editor status margin. @token --frame-code-editor-status-margin */
  --_frame-default-code-editor-status-margin-d8d05071ec: 0;
  margin: var(
    --frame-code-editor-status-margin,
    var(--_frame-default-code-editor-status-margin-d8d05071ec)
  );
  /* Padding for .frame-code-editor-status; code editor status padding. @token --frame-code-editor-status-padding */
  --_frame-default-code-editor-status-padding-bb9cf22c35: 12px;
  padding: var(
    --frame-code-editor-status-padding,
    var(--_frame-default-code-editor-status-padding-bb9cf22c35)
  );
  /* Background for .frame-code-editor-status; bg. @token --frame-bg */
  --_frame-default-bg-6bb468df5b: #1e1e1e;
  background: var(--frame-bg, var(--_frame-default-bg-6bb468df5b));
  /* Color for .frame-code-editor-status; fg. @token --frame-fg */
  --_frame-default-fg-78edc8b55c: #d4d4d4;
  color: var(--frame-fg, var(--_frame-default-fg-78edc8b55c));
}
</style>
