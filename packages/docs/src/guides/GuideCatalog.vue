<script setup lang="ts">
import { computed } from 'vue';
import { useFrame } from '@frame/core';
import { guidePages } from './pages';
import { openGuide } from './navigation';
const frame=useFrame();
const current=computed(()=>frame.workspace.panes.value.find(pane=>pane.id===frame.workspace.activePane.value)?.props?.pageId);
</script>
<template><nav class="component-catalog frame-guide-catalog" aria-label="Frame guides"><section><h3>Introduction</h3><button v-for="page in guidePages" :key="page.id" :aria-current="current===page.id?'page':undefined" @click="openGuide(frame,page.id)">{{ page.title }}</button></section></nav></template>
