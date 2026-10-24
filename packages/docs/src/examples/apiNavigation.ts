import { showWorkspaceContent } from './workspaceContent';
import type { Frame, WorkspacePaneContent } from "@frame/core";
import TypeDocumentationPage from "./TypeDocumentationPage.vue";
import { typeDocs } from "./typeDocs";
export const apiViewId = "demo.apis";
export function updateReferenceUrl(name?: string) {
  if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname + window.location.search + (name ? `#/api/${encodeURIComponent(name)}` : ""));
}
export function openApiReference(frame: Frame, name: string, rememberPrevious = true, previousProps: Record<string,unknown> = {}) {
  if (!Object.prototype.hasOwnProperty.call(typeDocs, name)) return;
  const pane = frame.workspace.panes.value.find(pane => pane.id === frame.workspace.activePane.value);
  const previous: WorkspacePaneContent | undefined = rememberPrevious && pane?.component ? { label: pane.label, component: pane.component, props: { ...pane.props, ...previousProps } } : undefined;
  const previousView = frame.state.activeSidePanel;
  showWorkspaceContent(frame, { label: name, component: TypeDocumentationPage, props: { name, previous, previousView } });
  frame.openSidePanel(apiViewId);
  updateReferenceUrl(name);
}
