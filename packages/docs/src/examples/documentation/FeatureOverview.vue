<script setup lang="ts">
import type { ComponentGuide } from './formGuides';
defineProps<{guide:ComponentGuide}>();
</script>
<template>
 <section class="documentation-guide" aria-label="Component guide">
  <h2>Features</h2>
  <ul><li v-for="capability in guide.capabilities" :key="capability">{{ capability }}</li></ul>
  <h2>Anatomy</h2>
  <p>Frame assembles and themes these Reka parts inside the component. The examples below use the public Frame component.</p>
  <dl class="documentation-anatomy"><div v-for="part in guide.anatomy" :key="part.part"><dt><code>{{ part.part }}</code></dt><dd>{{ part.description }}</dd></div></dl>
  <p class="documentation-guide-source">Adapted for Frame from <a :href="guide.source" target="_blank" rel="noreferrer">Reka’s component guide</a>.</p>
  <h2>Examples</h2>
 </section>
</template>
