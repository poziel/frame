<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { CodeBlockTheme } from '@frame/core';
import type * as Monaco from 'monaco-editor';
import { createCodeEditor, resolveCodeEditorOptions, type CodeEditorProps, type CodeEditorController } from './codeEditor';
import { prepareCodeEditor } from './codeEditorRuntime';

// Preserve omission: Vue otherwise casts an absent optional Boolean to false.
const props = withDefaults(defineProps<CodeEditorProps>(), { readOnly: undefined });
const emit = defineEmits<{
  'update:modelValue': [code: string];
  ready: [editor: CodeEditorController];
  change: [code: string, event: Monaco.editor.IModelContentChangedEvent];
  selection: [event: Monaco.editor.ICursorSelectionChangedEvent];
  focus: []; blur: []; error: [cause: unknown];
}>();
const host = ref<HTMLElement>(), loading = ref(true), error = ref('');
const internal = createCodeEditor();
let controller = props.editor ?? internal;
let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
let model: Monaco.editor.ITextModel | undefined;
let monaco: typeof Monaco | undefined;
let release: (() => void) | undefined;
let alive = false, revision = 0;
const disposables: Monaco.IDisposable[] = [];
function fail(cause: unknown) { error.value = cause instanceof Error ? cause.message : String(cause); emit('error', cause); }
function updateOptions() {
  const options = resolveCodeEditorOptions(props);
  editor?.updateOptions(options);
  model?.updateOptions(options);
}
function syncValue() {
  if (editor && model && props.modelValue !== undefined && model.getValue() !== props.modelValue) {
    controller.replaceCode(props.modelValue);
  }
}
async function syncSyntax() {
  const current = ++revision;
  loading.value = true;
  error.value = '';
  try {
    const prepared = await prepareCodeEditor(props.language ?? 'plaintext', props.theme ?? CodeBlockTheme.DarkPlus);
    if (!alive || current !== revision || !host.value) return;
    prepared.activate();
    monaco = prepared.monaco;
    if (!editor) {
      model = monaco.editor.createModel(props.modelValue ?? '', prepared.language);
      editor = monaco.editor.create(host.value, { ...resolveCodeEditorOptions(props), model, theme: prepared.theme });
      model.updateOptions(resolveCodeEditorOptions(props));
      try { release = controller.attach(editor); }
      catch (cause) { editor.dispose(); model.dispose(); editor = undefined; model = undefined; throw cause; }
      disposables.push(
        editor.onDidChangeModelContent(event => { const code = model!.getValue(); emit('update:modelValue', code); emit('change', code, event); }),
        editor.onDidChangeCursorSelection(event => emit('selection', event)),
        editor.onDidFocusEditorWidget(() => emit('focus')),
        editor.onDidBlurEditorWidget(() => emit('blur')),
      );
      if (props.autofocus) editor.focus();
      emit('ready', controller);
    } else {
      monaco.editor.setModelLanguage(model!, prepared.language);
      monaco.editor.setTheme(prepared.theme);
    }
  } catch (cause) { if (alive && current === revision) fail(cause); }
  finally { if (alive && current === revision) loading.value = false; }
}
watch(() => props.modelValue, syncValue);
watch(() => [props.options, props.readOnly, props.label], updateOptions, { deep: true });
watch(() => [props.language, props.theme], () => { if (alive) void syncSyntax(); });
watch(() => props.editor, value => {
  const next = value ?? internal;
  if (next === controller) return;
  try {
    const nextRelease = editor ? next.attach(editor) : undefined;
    release?.(); release = nextRelease; controller = next;
  } catch (cause) { fail(cause); }
});
onMounted(() => { alive = true; void syncSyntax(); });
onBeforeUnmount(() => {
  alive = false; revision++;
  disposables.forEach(item => item.dispose()); release?.(); editor?.dispose(); model?.dispose();
});
defineExpose({ get controller() { return controller; }, focus: () => controller.focus() });
</script>
<template>
  <div class="frame-code-editor" :aria-busy="loading">
    <div ref="host" class="frame-code-editor-host" />
    <p v-if="error" class="frame-code-editor-status" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="frame-code-editor-status" role="status">Loading editor…</p>
  </div>
</template>
