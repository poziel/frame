import {createApp, h, shallowRef, ref} from 'vue';
import {
  CodeEditor,
  EditorController,
  type CodeEditorController,
} from '@frame/core/modules/editor';
import {loadMonaco} from '../../../packages/core/src/modules/editor/services/monaco/codeEditorRuntime';

const first = new EditorController();
const replacement = new EditorController();
const occupied = new EditorController();
const selected = shallowRef<CodeEditorController>();
const surface = ref<InstanceType<typeof CodeEditor>>();
const shown = ref(true);
const language = ref('typescript');
const errors: unknown[] = [];
const changes: string[] = [];
const ready: CodeEditorController[] = [];
Object.assign(window, {
  editorFixture: {
    first,
    replacement,
    occupied,
    selected,
    surface,
    shown,
    language,
    errors,
    changes,
    ready,
    loadMonaco,
  },
});

createApp({
  setup: () => () =>
    h('main', [
      shown.value &&
        h(CodeEditor, {
          ref: surface,
          id: 'primary',
          editor: selected.value,
          modelValue: 'const primary = 1;',
          language: language.value,
          style: {height: '240px'},
          onReady: (controller: CodeEditorController) => ready.push(controller),
          onError: (cause: unknown) => errors.push(cause),
          'onUpdate:modelValue': (code: string) => changes.push(code),
        }),
      h(CodeEditor, {
        id: 'occupied',
        editor: occupied,
        modelValue: 'const secondary = 2;',
        language: 'typescript',
        style: {height: '240px'},
      }),
    ]),
}).mount('#app');
