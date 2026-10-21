<script setup lang="ts">
import { computed, ref } from "vue";
import { FrameTextInput, useFrame } from "@frame/core";
import { filterApiEntries, type ApiKind } from "./apiCatalog";
import { openApiReference } from "./apiNavigation";
const frame = useFrame(), query = ref<string | number>("");
const kinds: ApiKind[] = ["Class", "Object contract", "Value type"];
const groups = computed(() => kinds.map(kind => ({ kind, items: filterApiEntries(String(query.value)).filter(item => item.kind === kind) })).filter(group => group.items.length));
const current = computed(() => frame.workspace.panes.value.find(pane => pane.id === frame.workspace.activePane.value)?.props?.name);
</script>
<template><nav class="api-catalog component-catalog" aria-label="API references"><div class="api-catalog-search"><FrameTextInput v-model="query" type="search" aria-label="Filter API references" placeholder="Find a class or type…"/></div><section v-for="group in groups" :key="group.kind"><h3>{{ group.kind === 'Class' ? 'Classes' : group.kind === 'Object contract' ? 'Object contracts' : 'Value types' }}</h3><button v-for="item in group.items" :key="item.name" :aria-current="current === item.name ? 'page' : undefined" @click="openApiReference(frame, item.name, false)"><span>{{ item.name }}</span><small>{{ item.package }}</small></button></section><p v-if="!groups.length">No matching API references.</p></nav></template>
