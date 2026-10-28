<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue';
import {FrameTabs, useFrame} from '@frame/core';
import {documents} from './documents';
import {parseDocument, resolveDocumentLink} from './document';
import DocumentBlocks from './DocumentBlocks.vue';
import {openDocumentation} from './navigation';

/** Renders canonical Markdown, with optional reference tabs and Vue previews. */
const props = withDefaults(
  defineProps<{path: string; tabbed?: boolean; initialTab?: string}>(),
  {tabbed: false, initialTab: 'features'}
);
const emit = defineEmits<{'update:tab': [tab: string]}>();
const frame = useFrame();
const baseUrl = import.meta.env.BASE_URL;
const article = ref<HTMLElement>();
const tab = ref(props.initialTab);
const page = computed(() =>
  parseDocument(
    documents[props.path] ??
      '# Documentation unavailable\n\nThis document could not be found.',
    props.path
  )
);
const tabs = [
  {value: 'features', label: 'Features'},
  {value: 'api', label: 'APIs'},
  {value: 'theming', label: 'Styling'},
  {value: 'demo', label: 'Playground'},
];
const selected = computed(() =>
  page.value.sections.find((section) => section.id === tab.value)
);

watch(
  () => [props.path, props.initialTab],
  () => {
    tab.value = props.initialTab;
  }
);
watch(tab, (value) => emit('update:tab', value));

/** Selects the containing tab before scrolling to a Markdown anchor. */
async function scrollToFragment(fragment: string): Promise<void> {
  for (const section of page.value.sections) {
    if (
      section.id === fragment ||
      section.title.toLowerCase() === fragment ||
      section.blocks.some(
        (block) =>
          block.kind === 'html' && block.html.includes(`id="${fragment}"`)
      )
    ) {
      tab.value = section.id;
      break;
    }
  }
  await nextTick();
  const target = Array.from(
    article.value?.querySelectorAll<HTMLElement>('[id]') ?? []
  ).find((element) => element.id === fragment);
  target?.scrollIntoView({block: 'start'});
}

/** Routes relative document links through the owning Frame workspace. */
function navigate(event: MouseEvent): void {
  if (
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  )
    return;
  const anchor = (event.target as Element).closest('a');
  if (!anchor) return;
  const destination = resolveDocumentLink(
    props.path,
    anchor.getAttribute('data-document-href') ??
      anchor.getAttribute('href') ??
      ''
  );
  if (!destination) return;
  const [path, fragment] = destination.split('#', 2);
  if (!path || !documents[path]) return;
  event.preventDefault();
  if (path === props.path) {
    if (fragment) void scrollToFragment(fragment);
    return;
  }
  window.history.replaceState(
    null,
    '',
    `${location.pathname}${location.search}#/docs/${encodeURIComponent(path)}${fragment ? `?anchor=${encodeURIComponent(fragment)}` : ''}`
  );
  openDocumentation(frame, path);
}

watch(
  () => props.path,
  async () => {
    await nextTick();
    const fragment = new URLSearchParams(location.hash.split('?')[1] ?? '').get(
      'anchor'
    );
    if (fragment) await scrollToFragment(fragment);
  },
  {immediate: true}
);

defineExpose({
  get documentationTab() {
    return tab.value;
  },
});
</script>

<template>
  <article
    ref="article"
    class="markdown-document documentation-page"
    :data-document-path="path"
    :data-documentation-tab="tabbed ? tab : undefined"
    @click="navigate"
  >
    <header
      ><h1>{{ page.title }}</h1></header
    >
    <DocumentBlocks :blocks="page.introduction"
      ><template #example="scope"
        ><slot name="example" v-bind="scope" /></template
    ></DocumentBlocks>
    <FrameTabs
      v-if="tabbed"
      :model-value="tab"
      :items="tabs"
      label="Documentation"
      @update:model-value="tab = String($event)"
    >
      <template #content="{item}">
        <div v-if="tab === item.value" class="documentation-panel">
          <slot v-if="tab === 'demo'" name="playground" />
          <DocumentBlocks v-else-if="selected" :blocks="selected.blocks"
            ><template #example="scope"
              ><slot name="example" v-bind="scope" /></template
          ></DocumentBlocks>
        </div>
      </template>
    </FrameTabs>
    <template v-else v-for="section in page.sections" :key="section.id">
      <h2 :id="section.title.toLowerCase().replace(/ /g, '-')">{{
        section.title
      }}</h2>
      <DocumentBlocks :blocks="section.blocks"
        ><template #example="scope"
          ><slot name="example" v-bind="scope" /></template
      ></DocumentBlocks>
    </template>
    <footer
      ><a
        :href="`${baseUrl}markdown/${path.startsWith('packages/') ? path : 'docs/' + path}`"
        download
        >Read Markdown source</a
      ></footer
    >
  </article>
</template>

<style>
.markdown-document {
  padding: calc(var(--frame-content-padding) * 2);
  color: var(--frame-text);
  overflow: auto;
  font-size: var(--frame-font-size-lg);
  line-height: 1.65;
}
.markdown-document > header {
  margin-block-end: var(--frame-content-padding);
}
.markdown-document > header h1 {
  margin: 0;
  font-size: var(--frame-font-size-3xl);
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.markdown-document > .markdown-content {
  margin-block-end: calc(var(--frame-content-padding) * 2);
}
.markdown-document > .frame-tabs > .frame-tabs-content {
  padding: calc(var(--frame-content-padding) * 2) 0;
}
.markdown-document .documentation-panel {
  color: var(--frame-text);
  font-size: var(--frame-font-size-lg);
  line-height: 1.65;
}
/* Separate renderer blocks need explicit gaps; paragraph margins cannot cross
   their wrappers to create reliable space around code and live examples. */
.markdown-document .markdown-content {
  display: grid;
  gap: calc(var(--frame-spacing-unit) * 5);
  min-width: 0;
}
.markdown-document .markdown-content > * {
  min-width: 0;
}
.markdown-document .markdown-content > .frame-code-block {
  margin: 0;
}
.markdown-document .markdown-block > :first-child {
  margin-block-start: 0;
}
.markdown-document .markdown-block > :last-child {
  margin-block-end: 0;
}
.markdown-document .markdown-block :where(p, ul, ol, dl, pre, blockquote) {
  margin-block: 1em;
}
.markdown-document .markdown-block h2,
.markdown-document > h2 {
  margin-block: 2em 0.75em;
  font-size: var(--frame-font-size-2xl);
  line-height: 1.3;
}
.markdown-document .markdown-block h3 {
  margin-block: 2em 0.75em;
  font-size: var(--frame-font-size-xl);
  font-weight: 600;
  line-height: 1.4;
}
.markdown-document .markdown-block h4 {
  margin-block: 1.75em 0.75em;
  font-size: var(--frame-font-size-lg);
  font-weight: 600;
  line-height: 1.4;
}
.markdown-document h2,
.markdown-document h3,
.markdown-document h4 {
  scroll-margin-top: calc(var(--frame-spacing-unit) * 4);
}
.markdown-document p,
.markdown-document li {
  line-height: 1.65;
}
.markdown-document .markdown-block {
  overflow-x: auto;
}
.markdown-document table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--frame-content-padding) 0;
}
.markdown-document th,
.markdown-document td {
  padding: calc(var(--frame-spacing-unit) * 2) var(--frame-content-padding);
  border: 1px solid var(--frame-line);
  text-align: left;
  vertical-align: top;
}
.markdown-document a {
  color: var(--frame-accent);
}
.markdown-document footer {
  margin-top: calc(var(--frame-content-padding) * 2);
  color: var(--frame-muted);
}
.markdown-document pre,
.markdown-document code {
  font-family: var(--frame-font-mono);
}
@media (max-width: 640px) {
  .component-showcase:has(> .markdown-document),
  .markdown-document {
    padding: var(--frame-content-padding);
  }
}
</style>
