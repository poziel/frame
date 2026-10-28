<script setup lang="ts">
import {nextTick, onMounted, ref, watch} from 'vue';
import MarkdownDocument from '../markdown/MarkdownDocument.vue';
import type {GuidePageId} from './pages';

const props = defineProps<{pageId: GuidePageId}>();
const article = ref<HTMLElement>();

/** Restores the article origin when navigating between guide documents. */
async function scrollToStart() {
  await nextTick();
  article.value?.scrollIntoView({block: 'start', inline: 'nearest'});
}

onMounted(scrollToStart);
watch(() => props.pageId, scrollToStart);
</script>

<template>
  <article ref="article" class="frame-guide-page">
    <MarkdownDocument :path="`guides/${pageId}.md`" />
  </article>
</template>
