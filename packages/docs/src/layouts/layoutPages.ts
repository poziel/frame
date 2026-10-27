export const layoutPages = [
  { id: 'navigation-bar', title: 'Navigation Bar', description: 'Register actions, links, dropdowns, and separators. Try docking and activating items.' },
  { id: 'primary-sidebar', title: 'Primary Sidebar', description: 'Create and select primary views, retain their draft state, and configure the Primary View Bar together.' },
  { id: 'secondary-sidebar', title: 'Secondary Sidebar', description: 'Create contextual views and configure the Secondary View Bar in the same playground.' },
  { id: 'panel', title: 'Panel', description: 'Add supporting views, dock the Panel on any workspace edge, and configure the Panel View Bar together.' },
  { id: 'menu-bar', title: 'Menu Bar And Toolbar', description: 'Show application menus and register toolbar actions.' },
  { id: 'status-bar', title: 'Status Bar', description: 'Add and remove status items and show action feedback.' },
  { id: 'workspace', title: 'Workspace', description: 'Split panes and create, move, and close document tabs.' },
  { id: 'docks', title: 'Docks', description: 'Attach content to shell edges and explore anchor placement.' },
] as const;

export type LayoutPageId = typeof layoutPages[number]['id'];
export function isLayoutPageId(id: string): id is LayoutPageId {
  return layoutPages.some(page => page.id === id);
}

const aliases: Record<string, LayoutPageId> = {
  'primary-view-bar': 'primary-sidebar',
  'secondary-view-bar': 'secondary-sidebar',
  'panel-view-bar': 'panel',
};
export function resolveLayoutPageId(id: string): LayoutPageId | undefined {
  return isLayoutPageId(id) ? id : Object.prototype.hasOwnProperty.call(aliases, id) ? aliases[id] : undefined;
}
