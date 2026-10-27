import type { Frame } from '@frame/core';
import ComponentExamplePage from './ComponentExamplePage.vue';
import { showWorkspaceContent } from './workspaceContent';
import { componentExamples } from './componentCatalog';
export function openFeaturePage(frame: Frame, id: string) {
  if (id === 'ai-chat-history') id = 'ai-history';
  if (id === 'ai-view') id = 'ai-chat';
  const example = componentExamples.find(item => item.id === id && item.group === 'Modules');
  if (!example) return false;
  showWorkspaceContent(frame, { label: example.title, component: ComponentExamplePage, props: { componentId: id } });
  history.replaceState(null, '', `${location.pathname}${location.search}#/modules/${id}`);
  return true;
}
