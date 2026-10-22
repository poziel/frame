<script setup lang="ts">
import { ref } from 'vue';
import { CodeEditor, createCodeEditor } from '@frame/features';
import { FrameButton, FrameCheckbox, FrameSelect, FrameCodeBlock, CodeBlockTheme, codeBlockThemeOptions } from '@frame/core';
const code = ref('function greet(name: string) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Frame"));\n');
const editor = createCodeEditor();
const theme = ref(CodeBlockTheme.DarkPlus), language = ref('typescript');
const readOnly = ref(false), wrap = ref(false), minimap = ref(false), message = ref('');
</script>
<template>
  <div class="code-editor-example">
    <div class="code-editor-example-controls">
      <FrameSelect v-model="language" label="Editor language" :options="['typescript', 'javascript', 'json', 'css', 'html', 'vue', 'rust', 'python', 'plaintext'].map(value => ({ value, label: value }))" />
      <FrameSelect v-model="theme" label="Editor theme" :options="codeBlockThemeOptions.map(item => ({ value: item.value, label: item.label }))" />
      <FrameCheckbox v-model="readOnly">Read only</FrameCheckbox>
      <FrameCheckbox v-model="wrap">Wrap</FrameCheckbox>
      <FrameCheckbox v-model="minimap">Minimap</FrameCheckbox>
    </div>
    <CodeEditor v-model="code" :editor="editor" :language="language" :theme="theme" :read-only="readOnly" :options="{ wordWrap: wrap ? 'on' : 'off', minimap: { enabled: minimap }, tabSize: 2 }" label="Example source code" style="height: 340px" @error="message = String($event)" />
    <div class="code-editor-example-controls">
      <FrameButton @click="editor.focus()">Focus</FrameButton>
      <FrameButton @click="editor.undo()">Undo</FrameButton>
      <FrameButton @click="editor.redo()">Redo</FrameButton>
      <FrameButton @click="editor.find()">Find</FrameButton>
      <FrameButton @click="editor.format().then(ok => message = ok ? 'Formatted' : 'No formatter available for this language')">Format</FrameButton>
    </div>
    <p v-if="message" role="status">{{ message }}</p>
    <FrameCodeBlock :code="code" :language="language" :theme="theme" label="Live code block preview" />
  </div>
</template>
<style scoped>
.code-editor-example { display: grid; gap: 16px; width: 100%; min-width: 0; }
.code-editor-example-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
</style>
