<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FrameSelect, FrameTextField } from '@frame/core';
import CatalogSection from './CatalogSection.vue';
import type { CatalogGroup } from './catalog';

const props = defineProps<{
  label: string;
  searchLabel: string;
  placeholder: string;
  groups: readonly CatalogGroup[];
  current?: unknown;
  groupOptions?: readonly { value: string; label: string }[];
  groupLabel?: string;
  emptyText: string;
}>();
const query = defineModel<string | number>('query', { default: '' });
const group = defineModel<string>('group', { default: 'all' });
const body = ref<HTMLElement>();
watch([query, group], () => { if (body.value) body.value.scrollTop = 0; }, { flush: 'post' });
defineEmits<{ select: [id: string] }>();
const count = computed(() => props.groups.reduce((total, group) => total + group.items.length, 0));
</script>
<template>
  <nav class="docs-catalog" :aria-label="label">
    <header class="docs-catalog-header">
      <FrameTextField v-model="query" type="search" :aria-label="searchLabel" :placeholder="placeholder" />
      <FrameSelect v-if="groupOptions?.length" v-model="group" :label="groupLabel ?? 'Item group'" :options="groupOptions" />
      <slot name="header" />
    </header>
    <div ref="body" class="docs-catalog-body" tabindex="0" :aria-label="`${label} results`">
      <CatalogSection v-for="section in groups.filter(group => group.items.length)" :key="section.title" :group="section" :current="current" @select="$emit('select', $event)" />
      <p v-if="!count" class="docs-catalog-empty">{{ emptyText }}</p>
    </div>
    <footer class="docs-catalog-footer"><slot name="footer">{{ count }} {{ count === 1 ? 'result' : 'results' }}</slot></footer>
  </nav>
</template>
<style scoped>
.docs-catalog{display:flex;flex-direction:column;width:100%;height:100%;flex:1;min-width:0;min-height:0;overflow:hidden;box-sizing:border-box;font-size:12px;--frame-text-input-width:100%}
.docs-catalog-header{display:flex;flex-direction:column;gap:8px;flex:none;padding:12px;border-bottom:1px solid var(--frame-line)}
.docs-catalog-header :deep(.frame-text-input),.docs-catalog-header :deep(.frame-select){width:100%;max-width:none;min-width:0;box-sizing:border-box}
.docs-catalog-body{flex:1;min-height:0;overflow:auto;padding:4px 12px 12px;overscroll-behavior:contain}
.docs-catalog-body:focus-visible{outline:1px solid var(--frame-accent);outline-offset:-1px}
.docs-catalog-footer{flex:none;padding:8px 12px;border-top:1px solid var(--frame-line);color:var(--frame-muted);font-size:11px}
.docs-catalog-empty{padding-block:12px;line-height:1.5;color:var(--frame-muted)}
</style>
