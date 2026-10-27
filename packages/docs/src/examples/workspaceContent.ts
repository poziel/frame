import type { Frame, WorkspacePaneContent } from '@frame/core';

/** Docs navigation can target either a plain pane or an application-owned document tab. */
export function showWorkspaceContent(
  frame: Frame,
  content: WorkspacePaneContent
) {
  const workspace = frame.workspace;
  const paneId = workspace.activePane.value;
  if (workspace.paneMode(paneId) === 'plain') {
    frame.setWorkspacePane(paneId, content);
    return;
  }
  const definition = { title: content.label, component: content.component, props: content.props };
  const active = workspace.activeTabs.value[paneId];
  if (active) workspace.updateTab(active, definition);
  else {
    let sequence = 1;
    while (workspace.tabs.value.some(tab => tab.id === `docs-page-${sequence}`)) sequence++;
    workspace.registerTab(paneId, { id: `docs-page-${sequence}`, ...definition });
  }
}
