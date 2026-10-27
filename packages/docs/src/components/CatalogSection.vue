<script setup lang="ts">
import type { CatalogGroup } from './catalog';
defineProps<{ group: CatalogGroup; current?: unknown }>();
defineEmits<{ select: [id: string] }>();
</script>
<template>
  <section class="docs-catalog-section">
    <h3>{{ group.title }}</h3>
    <button v-for="item in group.items" :key="item.id" type="button" :aria-current="current === item.id ? 'page' : undefined" @click="$emit('select', item.id)">
      <span>{{ item.title }}</span><small v-if="item.detail">{{ item.detail }}</small>
    </button>
  </section>
</template>
<style scoped>
.docs-catalog-section{display:flex;flex-direction:column;min-width:0}
h3{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:var(--frame-muted);font-weight:500;margin:12px 8px 6px}
button{display:flex;flex-direction:column;gap:3px;width:100%;padding:7px 8px;text-align:left;border-radius:var(--frame-radius-small,3px);overflow-wrap:anywhere}
button:hover{background:var(--frame-list-hover-background)}
button[aria-current=page]{background:var(--frame-list-selection-background);color:var(--frame-list-selection-foreground);outline:1px solid var(--frame-list-selection-border);outline-offset:-1px}
button:focus-visible{outline:1px solid var(--frame-accent);outline-offset:-1px}
small{color:var(--frame-muted);font-size:10px}
</style>
