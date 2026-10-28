import {defineAsyncComponent} from 'vue';
import type {Frame} from '@frame/core';
import {showWorkspaceContent} from '../examples/workspaceContent';
import {documents} from './documents';
import {parseDocument} from './document';
import componentPages from './componentPages.json';

const article = defineAsyncComponent(() => import('./MarkdownDocument.vue'));
const component = defineAsyncComponent(
  () => import('../examples/ComponentExamplePage.vue')
);
const layout = defineAsyncComponent(() => import('../layouts/LayoutPage.vue'));

/** Opens a canonical document, preserving registered previews and playgrounds. */
export function openDocumentation(frame: Frame, path: string): boolean {
  if (!documents[path]) return false;
  const componentId = Object.entries(componentPages).find(
    ([, file]) => file === path
  )?.[0];
  const layoutId = path.match(/^layouts\/([\w-]+)\.md$/)?.[1];
  showWorkspaceContent(frame, {
    label: parseDocument(documents[path]!).title,
    component: componentId ? component : layoutId ? layout : article,
    props: componentId ? {componentId} : layoutId ? {pageId: layoutId} : {path},
  });
  return true;
}
