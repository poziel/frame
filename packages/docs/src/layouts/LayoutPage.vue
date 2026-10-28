<script setup lang="ts">
import MarkdownDocument from '../markdown/MarkdownDocument.vue';
import LayoutPlayground from './LayoutPlayground.vue';
import type {LayoutPageId} from './navigation';

defineProps<{pageId: LayoutPageId}>();
</script>

<template>
  <MarkdownDocument :key="pageId" :path="`layouts/${pageId}.md`" tabbed>
    <template #playground>
      <LayoutPlayground :key="pageId" :page-id="pageId" />
    </template>
  </MarkdownDocument>
</template>
