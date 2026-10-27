<script setup lang="ts">
import { ref } from 'vue';
import { FrameTextField, FrameButton } from '@frame/core';
defineProps<{ label: string }>();
const draft = ref('This draft stays with this dock');
const count = ref(0);
</script>
<template>
  <section class="dock-sample">
    <strong>{{ label }}</strong>
    <label>Persistent Draft <FrameTextField v-model="draft" /></label>
    <FrameButton variant="secondary" @click="count++">Count: {{ count }}</FrameButton>
  </section>
</template>
<style scoped>
.dock-sample{display:flex;flex-wrap:wrap;align-items:center;gap:var(--frame-spacing-small);padding:var(--frame-spacing-small);color:var(--frame-text);background:var(--frame-surface);font-size:var(--frame-font-size-body)}
label{display:grid;gap:4px}label :deep(.frame-text-input){min-width:100px;max-width:220px;width:100%;box-sizing:border-box}
</style>


