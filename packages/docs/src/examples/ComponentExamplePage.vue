<script setup lang="ts">
import {computed, nextTick, provide, ref, watch} from 'vue';
import MarkdownDocument from '../markdown/MarkdownDocument.vue';
import MarkdownExample from '../markdown/MarkdownExample.vue';
import pagePaths from '../markdown/componentPages.json';
import {componentDocumentation} from './documentation/registry';
import type {DocumentationTab} from './documentation/types';
import {documentationTabKey} from './documentation/context';
import InteractiveDemo from './documentation/InteractiveDemo.vue';
import UniversalViewerExample from './UniversalViewerExample.vue';
import FileUploadExample from './FileUploadExample.vue';
import AIChatFeatureDemo from './AIChatFeatureDemo.vue';
import type {AIChatFeatureKind} from './aiFeatureKinds';

/** Component article prose comes exclusively from its canonical Markdown file. */
const props = defineProps<{
  componentId: string;
  initialTab?: DocumentationTab;
}>();
const page = ref<HTMLElement>();
const tab = ref<DocumentationTab>(props.initialTab ?? 'features');
const path = computed(
  () => (pagePaths as Record<string, string>)[props.componentId]!
);
const documentation = computed(
  () => componentDocumentation[props.componentId]!
);
provide(documentationTabKey, () => tab.value);
watch(
  () => props.componentId,
  async () => {
    tab.value = props.initialTab ?? 'features';
    await nextTick();
    page.value?.closest('.workspace-pane-content')?.scrollTo({top: 0});
  }
);
defineExpose({
  get documentationTab() {
    return tab.value;
  },
});
</script>

<template>
  <div v-if="documentation" ref="page" class="component-showcase">
    <MarkdownDocument
      :path="path"
      tabbed
      :initial-tab="initialTab"
      @update:tab="tab = $event as DocumentationTab"
    >
      <template #example="{id}"><MarkdownExample :id="id" /></template>
      <template #playground>
        <AIChatFeatureDemo
          v-if="
            [
              'ai-prompt',
              'ai-conversation',
              'ai-history',
              'ai-chat',
              'ai-view',
            ].includes(componentId)
          "
          :key="componentId"
          :kind="componentId as AIChatFeatureKind"
        />
        <UniversalViewerExample
          v-else-if="componentId === 'universal-viewer'"
        />
        <FileUploadExample
          v-else-if="
            componentId === 'file-upload' || componentId === 'file-drop-zone'
          "
          :key="componentId"
          :id="componentId"
        />
        <InteractiveDemo
          v-else
          :key="componentId"
          :documentation="documentation"
        />
      </template>
    </MarkdownDocument>
  </div>
</template>
