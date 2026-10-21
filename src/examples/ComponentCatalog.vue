<script setup lang="ts">
import { computed, ref } from "vue";
import { useFrame } from "../frame/createFrame";
import FrameTextInput from "../components/FrameTextInput.vue";
import { componentExamples } from "./componentCatalog";
import ComponentExamplePage from "./ComponentExamplePage.vue";
const frame = useFrame(), query = ref<string | number>("");
const groups = computed(() => [...new Set(componentExamples.map(item => item.group))].map(title => ({ title, items: componentExamples.filter(item => item.group === title && `${item.title} ${item.description}`.toLowerCase().includes(String(query.value).toLowerCase())) })).filter(group => group.items.length));
const current = computed(() => frame.workspace.panes.value.find(pane => pane.id === frame.workspace.activePane.value)?.props?.componentId);
function open(id: string) { if (location.hash.startsWith("#/types/")) history.replaceState(null, "", location.pathname + location.search); const example = componentExamples.find(item => item.id === id)!; frame.setWorkspacePane(frame.workspace.activePane.value, { label: example.title, component: ComponentExamplePage, props: { componentId: id } }); }
</script>
<template><div class="component-catalog"><FrameTextInput v-model="query" type="search" aria-label="Filter components" placeholder="Find a component…"/><section v-for="group in groups" :key="group.title"><h3>{{ group.title }}</h3><button v-for="item in group.items" :key="item.id" :aria-current="current === item.id ? 'page' : undefined" @click="open(item.id)">{{ item.title }}</button></section><p v-if="!groups.length">No matching components.</p></div></template>
