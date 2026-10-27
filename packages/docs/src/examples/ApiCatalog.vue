<script setup lang="ts">
import { computed, ref } from "vue";
import { useFrame } from "@frame/core";
import CatalogView from '../components/CatalogView.vue';
import { useCatalogSelection } from '../components/catalog';
import { filterApiEntries, type ApiKind } from "./apiCatalog";
import { openApiReference } from "./apiNavigation";
const frame = useFrame(), query = ref<string | number>("");
const category = ref('all');
const kinds: ApiKind[] = ["Class", "Object contract", "Value type"];
const kindLabels = { Class: 'Classes', 'Object contract': 'Object contracts', 'Value type': 'Value types' };
const groupOptions = [{ value: 'all', label: 'All API references' }, ...kinds.map(kind => ({ value: kind, label: kindLabels[kind] }))];
const groups = computed(() => kinds.filter(kind => category.value === 'all' || category.value === kind).map(kind => ({ title: kindLabels[kind], items: filterApiEntries(String(query.value)).filter(item => item.kind === kind).map(item => ({ id: item.name, title: item.name, detail: item.package })) })).filter(group => group.items.length));
const current = useCatalogSelection('name');
</script>
<template><CatalogView v-model:query="query" v-model:group="category" label="API references" search-label="Filter API references" placeholder="Find a class or type…" :group-options="groupOptions" group-label="API group" :groups="groups" :current="current" empty-text="No matching API references." @select="openApiReference(frame, $event)" /></template>
