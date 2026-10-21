<script setup lang="ts">
import { ref } from "vue";
withDefaults(defineProps<{ kind?: string }>(), { kind: "collections" });
const selected = ref("Launch workspace");
</script>
<template><div class="demo-list"><button v-for="item in kind === 'people' ? ['Morgan · Design', 'Alex · Engineering', 'Sam · Research'] : ['Launch workspace', 'Interface library', 'Interaction notes', 'Release checklist']" :key="item" :class="{ chosen: selected === item }" @click="selected = item"><span>{{ kind === 'people' ? '◉' : '◇' }}</span>{{ item }}</button><p class="demo-muted">{{ selected }}</p></div></template>
