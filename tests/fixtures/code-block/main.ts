import {createApp, h, ref} from 'vue';
import * as core from '@frame/core';
import '../../../packages/core/src/styles/index.scss';

const api = core as typeof core & Record<string, any>;
const code = ref('const greeting = "Hello";\n\nconsole.log(greeting);\n');
const theme = ref('dark-plus'),
  numbers = ref(true),
  hover = ref(true),
  start = ref(40),
  language = ref('typescript');
createApp({
  setup() {
    return () =>
      h('main', [
        h(
          'button',
          {
            onClick: () => {
              numbers.value = !numbers.value;
            },
          },
          'Toggle numbers'
        ),
        h(
          'button',
          {
            onClick: () => {
              hover.value = !hover.value;
            },
          },
          'Toggle hover'
        ),
        h(
          'button',
          {
            onClick: () => {
              theme.value =
                theme.value === 'dark-plus' ? 'light-plus' : 'dark-plus';
            },
          },
          'Toggle theme'
        ),
        h(
          'button',
          {
            onClick: () => {
              start.value = 100;
            },
          },
          'Change start'
        ),
        h(
          'button',
          {
            onClick: () => {
              code.value =
                '<img src=x onerror="window.codeExecuted=true">\n<script>window.codeExecuted=true</script>';
              language.value = 'html';
            },
          },
          'Unsafe source'
        ),
        h(
          'button',
          {
            onClick: () => {
              code.value = 'new source';
              language.value = 'not-a-language';
            },
          },
          'Unknown language'
        ),
        h(
          'button',
          {
            onClick: () => {
              code.value = 'const old = 1';
              language.value = 'rust';
              theme.value = 'nord';
              queueMicrotask(() => {
                code.value = 'const newest = 2';
                language.value = 'typescript';
                theme.value = 'github-dark';
              });
            },
          },
          'Rapid updates'
        ),
        h(api.FrameCodeBlock, {
          id: 'viewer',
          code: code.value,
          language: language.value,
          theme: theme.value,
          lineNumbers: numbers.value,
          highlightOnHover: hover.value,
          highlightedLines: [42],
          startLine: start.value,
        }),
      ]);
  },
}).mount('#app');
