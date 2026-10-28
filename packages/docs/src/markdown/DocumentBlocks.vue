<script setup lang="ts">
import {FrameCodeBlock} from '@frame/core';
import type {DocumentBlock} from './document';

defineProps<{blocks: DocumentBlock[]}>();
</script>

<template>
  <div class="markdown-content">
    <template v-for="(block, index) in blocks" :key="index">
      <!-- Produced only by MarkdownIt's HTML-disabled renderer. -->
      <div
        v-if="block.kind === 'html'"
        class="markdown-block"
        v-html="block.html"
      ></div>
      <FrameCodeBlock
        v-else-if="block.kind === 'code'"
        :code="block.code"
        :language="block.language"
        :line-numbers="true"
      />
      <slot v-else name="example" :id="block.id" />
    </template>
  </div>
</template>
