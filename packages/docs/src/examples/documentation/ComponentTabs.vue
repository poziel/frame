<script setup lang="ts">
import { useId } from 'vue';
import type { DocumentationTab } from './types';
const props=defineProps<{modelValue:DocumentationTab}>();
const emit=defineEmits<{'update:modelValue':[tab:DocumentationTab]}>();
const id=useId();
const tabs:{id:DocumentationTab;label:string}[]=[{id:'features',label:'Features'},{id:'api',label:'API'},{id:'theming',label:'Theming'},{id:'demo',label:'Interactive demo'}];
function key(event:KeyboardEvent){
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const current=tabs.findIndex(tab=>tab.id===props.modelValue);
 const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
 emit('update:modelValue',tabs[next]!.id);
 (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
}
</script>
<template><div class="documentation-tabs" role="tablist" aria-label="Component documentation" @keydown="key"><button v-for="tab in tabs" :key="tab.id" type="button" role="tab" :id="`${id}-${tab.id}`" :aria-controls="`${id}-${tab.id}-panel`" :tabindex="modelValue===tab.id?0:-1" :aria-selected="modelValue===tab.id" @click="emit('update:modelValue',tab.id)">{{ tab.label }}</button></div><template v-for="tab in tabs" :key="tab.id"><section :hidden="modelValue!==tab.id" :id="`${id}-${tab.id}-panel`" role="tabpanel" :aria-labelledby="`${id}-${tab.id}`" tabindex="0" class="documentation-panel"><slot v-if="modelValue===tab.id" :name="tab.id"/></section></template></template>
