<script setup lang="ts">
import { FrameTabs } from '@frame/core';
import type { DocumentationTab } from './types';
defineProps<{modelValue:DocumentationTab}>();
const emit=defineEmits<{'update:modelValue':[tab:DocumentationTab]}>();
const tabs:{value:DocumentationTab;label:string}[]=[{value:'features',label:'Features'},{value:'api',label:'API'},{value:'theming',label:'Theming'},{value:'demo',label:'Interactive demo'}];
function select(value:string|number) { const tab=tabs.find(tab=>tab.value===value);if(tab)emit('update:modelValue',tab.value); }
</script>
<template>
  <FrameTabs class="documentation-tabs" :model-value="modelValue" :items="tabs" label="Component documentation" @update:model-value="select">
    <template #content="{item}"><div class="documentation-panel"><slot v-if="modelValue===item.value" :name="item.value" /></div></template>
  </FrameTabs>
</template>
