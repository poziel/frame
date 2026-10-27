<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFrame } from '@frame/core';
import { guidePages, isGuidePageId } from './pages';
import { openGuide } from './navigation';
import CatalogView from '../components/CatalogView.vue';
import { useCatalogSelection } from '../components/catalog';
const frame=useFrame();
const sortedPages=[...guidePages].sort((a, b)=>a.title.localeCompare(b.title,'en',{sensitivity:'base',numeric:true}));
const query=ref<string|number>('');
const groups=computed(()=>[{title:'Introduction',items:sortedPages.filter(page=>page.title.toLocaleLowerCase().includes(String(query.value).trim().toLocaleLowerCase())).map(page=>({id:page.id,title:page.title}))}]);
const current=useCatalogSelection('pageId');
function open(id:string){if(isGuidePageId(id))openGuide(frame,id);}
</script>
<template><CatalogView v-model:query="query" label="Frame guides" search-label="Filter guides" placeholder="Find a guide…" :groups="groups" :current="current" empty-text="No matching guides." @select="open" /></template>
