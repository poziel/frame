<script setup lang="ts">
import { showWorkspaceContent } from './workspaceContent';
import { computed, ref } from "vue";
import { useFrame } from "../../../core/src/frame/createFrame";
import FrameTextInput from "../../../core/src/components/FrameTextInput.vue";
import { FrameSelect } from '@frame/core';
import { catalogGroups, componentCategories } from './catalogNavigation';
import { componentExamples } from "./componentCatalog";
import ComponentExamplePage from "./ComponentExamplePage.vue";
const props = withDefaults(defineProps<{ features?: boolean }>(), { features: false });

const frame = useFrame(), query = ref<string | number>(""), category = ref("all");
const groups = computed(() => catalogGroups(props.features,String(query.value),props.features?'all':category.value));
const current = computed(() => frame.workspace.panes.value.find(pane => pane.id === frame.workspace.activePane.value)?.props?.componentId);
function open(id: string) { if ((location.hash.startsWith("#/types/") || location.hash.startsWith("#/api/") || location.hash.startsWith("#/guide/"))) history.replaceState(null, "", location.pathname + location.search); const example = componentExamples.find(item => item.id === id)!; showWorkspaceContent(frame, { label: example.title, component: ComponentExamplePage, props: { componentId: id } }); }
</script>
<template><nav class="component-catalog" :aria-label="features ? 'Features catalog' : 'Components catalog'" tabindex="0"><div class="catalog-toolbar"><FrameTextInput v-model="query" type="search" :aria-label="features ? 'Filter Features' : 'Filter components'" :placeholder="features ? 'Find a feature…' : 'Find a component…'"/><FrameSelect v-if="!features" v-model="category" label="Component category" :options="[{value:'all',label:'All components'},...componentCategories]"/></div><section v-for="group in groups" :key="group.title"><h3>{{ group.title }}</h3><button v-for="item in group.items" :key="item.id" :aria-current="current === item.id ? 'page' : undefined" @click="open(item.id)">{{ item.title }}</button></section><p v-if="!groups.length">No matching {{ features ? 'Features' : 'components' }}.</p></nav></template>
