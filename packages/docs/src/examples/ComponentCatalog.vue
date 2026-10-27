<script setup lang="ts">
import { showWorkspaceContent } from './workspaceContent';
import { computed, ref } from "vue";
import { useFrame } from '@frame/core';
import CatalogView from '../components/CatalogView.vue';
import { useCatalogSelection } from '../components/catalog';
import { catalogGroups, componentCategories } from './catalogNavigation';
import { componentExamples } from "./componentCatalog";
import ComponentExamplePage from "./ComponentExamplePage.vue";
import { openFeaturePage } from './featureNavigation';
const props = withDefaults(defineProps<{ features?: boolean }>(), { features: false });

const frame = useFrame(), query = ref<string | number>(""), category = ref("all");
const groups = computed(() => catalogGroups(props.features,String(query.value),props.features?'all':category.value));
const current = useCatalogSelection('componentId');
function open(id: string) { if (props.features && openFeaturePage(frame,id)) return; if (location.hash) history.replaceState(null, "", location.pathname + location.search); const example = componentExamples.find(item => item.id === id)!; showWorkspaceContent(frame, { label: example.title, component: ComponentExamplePage, props: { componentId: id } }); }
</script>
<template><CatalogView v-model:query="query" v-model:group="category" :label="features ? 'Modules catalog' : 'Components catalog'" :search-label="features ? 'Filter modules' : 'Filter components'" :placeholder="features ? 'Find a module…' : 'Find a component…'" :group-options="features ? undefined : [{value:'all',label:'All components'},...componentCategories]" group-label="Component category" :groups="groups" :current="current" :empty-text="`No matching ${features ? 'features' : 'components'}.`" @select="open" /></template>
