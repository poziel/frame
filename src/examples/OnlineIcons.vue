<script setup lang="ts">
import { ref } from "vue";
const loaded = ref(false);
</script>
<template><div class="online-icons"><div class="online-icons-toolbar"><span v-if="!loaded" role="status">Loading Icônes…</span><a href="https://icones.js.org/" target="_blank" rel="noopener noreferrer">Open Icônes in a browser ↗</a></div><iframe src="https://icones.js.org/" title="Icônes icon collection browser" referrerpolicy="no-referrer" allow="clipboard-write" @load="loaded = true"/></div></template>
