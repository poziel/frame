import type { Frame } from '@frame/core';
import { showWorkspaceContent } from '../examples/workspaceContent';
import LayoutPage from './LayoutPage.vue';
import { layoutPages, type LayoutPageId } from './layoutPages';
export { layoutPages, isLayoutPageId, resolveLayoutPageId, type LayoutPageId } from './layoutPages';

export function openLayout(
  frame: Frame,
  pageId: LayoutPageId,
  updateUrl = true
) {
  const page = layoutPages.find(page => page.id === pageId)!;
  showWorkspaceContent(frame, { label: page.title, component: LayoutPage, props: { pageId } });
  if (updateUrl) window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/layouts/' + pageId);
}
