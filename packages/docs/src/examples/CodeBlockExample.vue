<script setup lang="ts">
import { ref } from "vue";
import { FrameCodeBlock, FrameCheckbox, FrameSelect, CodeBlockTheme, codeBlockThemeOptions } from "@frame/core";
const theme = ref(CodeBlockTheme.DarkPlus), numbers = ref(true), hover = ref(true), wrap = ref(false);
const code = 'import { createFrame } from "@frame/core";\n\nconst frame = createFrame({ navigation: true });\nframe.navigation.back();\n';
</script>
<template>
  <div class="code-block-example">
    <label>Theme <FrameSelect v-model="theme" :options="codeBlockThemeOptions.map(item => ({ value: item.value, label: item.label }))" label="Code theme"/></label>
    <div class="code-block-options"><FrameCheckbox v-model="numbers">Line numbers</FrameCheckbox><FrameCheckbox v-model="hover">Highlight on hover</FrameCheckbox><FrameCheckbox v-model="wrap">Wrap lines</FrameCheckbox></div>
    <FrameCodeBlock :code="code" language="typescript" :theme="theme" :line-numbers="numbers" :highlight-on-hover="hover" :wrap="wrap" :highlighted-lines="[12]" :start-line="10"/>
  </div>
</template>
<style scoped>
.code-block-example { display: grid; gap: 16px; width: 100%; min-width: 0; }
.code-block-example > label { display: flex; align-items: center; gap: 12px; }
.code-block-options { display: flex; flex-wrap: wrap; gap: 16px; }
</style>
