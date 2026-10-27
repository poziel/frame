<script setup lang="ts">
import { computed } from 'vue';
import { layoutPages, type LayoutPageId } from './navigation';
import LayoutPlayground from './LayoutPlayground.vue';
const props = defineProps<{ pageId: LayoutPageId }>();
const page = computed(() => layoutPages.find(page => page.id === props.pageId)!);
</script>
<template>
  <main class="layout-page">
    <header><h1>{{ page.title }}</h1><p>{{ page.description }}</p><p class="hint">This playground has its own Frame instance. Changes stay here and reset when you leave this page.</p></header>
    <LayoutPlayground :key="pageId" :page-id="pageId" />
  </main>
</template>
<style scoped>
.layout-page{height:100%;overflow:auto;padding:24px;box-sizing:border-box;color:var(--frame-text);background:var(--frame-bg)}header{max-width:900px;margin-bottom:20px}h1{font-size:24px;margin:0 0 10px}p{line-height:1.6;margin:6px 0}.hint{color:var(--frame-text-muted);font-size:12px}
</style>
