import { createApp, h, ref } from 'vue';
import { CodeEditor, createCodeEditor } from '@frame/core/modules/editor';
import { CodeBlockTheme, FrameCodeBlock, loadCodeHighlight } from '@frame/core';
import { loadMonaco } from '../../../packages/core/src/modules/editor/services/monaco/codeEditorRuntime';

const code = ref('const greeting: string = "Hello";\nconsole.log(greeting);\n');
const theme = ref(CodeBlockTheme.DarkPlus), language = ref('typescript'), readOnly = ref<boolean | undefined>(false), shown = ref(true), width = ref(800);
const editor = createCodeEditor();
Object.assign(window, { fixture: { code, theme, language, readOnly, shown, width, editor, loadMonaco, loadCodeHighlight } });
createApp({ setup: () => () => h('main', [
  h('button', { onClick: () => { shown.value = !shown.value; } }, 'Toggle editor'),
  shown.value && h(CodeEditor, { id: 'editor', modelValue: code.value, 'onUpdate:modelValue': (
    v: string
  ) => { code.value = v; }, editor, theme: theme.value, language: language.value, readOnly: readOnly.value, label: 'Test source', style: { height: '300px', width: `${width.value}px` }, options: { tabSize: 2, readOnly: true } }),
  h('pre', { id: 'value' }, code.value),
  h(FrameCodeBlock, { code: code.value, language: language.value, theme: CodeBlockTheme.LightPlus }),
]) }).mount('#app');
