<script setup lang="ts">
import type { DocumentationOverview } from './types';
defineProps<{ overview: DocumentationOverview }>();
</script>
<template><section class="documentation-intro" aria-label="Usage guide"><h2>What it does</h2><p>{{ overview.purpose }}</p><h3>When to use it</h3><p>{{ overview.usage }}</p><ul><li v-for="note in overview.notes" :key="note">{{ note }}</li></ul></section></template>
