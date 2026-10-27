import { computed } from 'vue';
import { useFrame } from '@frame/core';

export interface CatalogItem { id: string; title: string; detail?: string }
export interface CatalogGroup { title: string; items: readonly CatalogItem[] }

/** Catalog selection follows the active document in both plain and tabbed panes. */
export function useCatalogSelection(key: string) {
  const frame = useFrame();
  return computed(() => {
    const pane = frame.workspace.activePane.value;
    const tab = frame.workspace.activeTabs.value[pane];
    const content = tab ? frame.workspace.tabs.value.find(item => item.id === tab)
      : frame.workspace.panes.value.find(item => item.id === pane);
    return content?.props?.[key];
  });
}
