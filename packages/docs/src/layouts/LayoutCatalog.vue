<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFrame } from '@frame/core';
import CatalogView from '../components/CatalogView.vue';
import { useCatalogSelection } from '../components/catalog';
import { layoutPages, openLayout, isLayoutPageId } from './navigation';
const frame = useFrame();
const query = ref<string | number>('');
const current = useCatalogSelection('pageId');
const groups = computed(() => [{ title: 'Layouts', items: layoutPages.filter(page => `${page.title} ${page.description}`.toLocaleLowerCase().includes(String(query.value).trim().toLocaleLowerCase())).map(page => ({ id: page.id, title: page.title })) }]);
function open(id: string) { if (isLayoutPageId(id)) openLayout(frame, id); }
</script>
<template>
  <CatalogView v-model:query="query" label="Layout playgrounds" search-label="Filter layouts" placeholder="Find a layout…" :groups="groups" :current="current" empty-text="No matching layouts." @select="open" />
</template>
