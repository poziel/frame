import type { FrameMenuItem, WorkspaceSplitDirection } from '../types';
import type { createWorkspace } from './workspace';

type Workspace = ReturnType<typeof createWorkspace>;
export function workspaceTabMenu(w: Workspace, paneId: string, tabId: string): readonly FrameMenuItem[] {
  const local = w.tabs.value.filter(t => t.paneId === paneId);
  const tab = local.find(t => t.id === tabId);
  if (!tab) return [];
  const at = local.indexOf(tab);
  const closeSets = { close: [tab], others: local.filter(t => t.id !== tabId), right: local.slice(at+1), left: local.slice(0,at), all: local };
  const labels = {close:'Close',others:'Close others',right:'Close to the right',left:'Close to the left',all:'Close all'};
  const defaults: FrameMenuItem[] = Object.entries(closeSets).map(([id, candidates]) => {
    const eligible = candidates.filter(t => !t.pinned && t.closable !== false);
    return {id:`tab.${id}`,label:labels[id as keyof typeof labels],disabled:!eligible.length || !w.tabOptions(paneId).allowClose || (w.tabOptions(paneId).lastTab !== 'allow-empty' && eligible.length === local.length)};
  });
  defaults.push({id:'tab.separator',type:'separator'}, {id:'tab.pin',label:tab.pinned?'Unpin':'Pin'},
    {id:'tab.split',label:'Split',children:(['right','left','up','down'] as const).map(d => ({id:`tab.split.${d}`,label:`Split ${d}`,disabled:!w.canSplit(paneId)}))},
    {id:'tab.move',label:'Move',children:[...w.panes.value.filter(p => p.id !== paneId).map(p => ({id:`tab.move.${p.id}`,label:p.label,disabled:!w.canMoveTab(tabId,p.id)})), ...(['right','left','up','down'] as const).map(d => ({id:`tab.new.${d}`,label:`New pane ${d}`,disabled:!w.canSplit(paneId) || !w.tabOptions(paneId).allowMove || tab.movable === false}))]});
  if(!w.options.allowPaneCreation) { const split=defaults.findIndex(item=>item.id==='tab.split'); if(split>=0)defaults.splice(split,1); const move=defaults.findIndex(item=>item.id==='tab.move'); if(move>=0){const item=defaults[move];if(item && item.type!=='separator'){const children=item.children?.filter(child=>child.id.startsWith('tab.move.')) ?? [];if(children.length)defaults[move]={...item,children};else defaults.splice(move,1);}} }
  defaults.push({id:'tab.display',label:'Tab Display',children:([{id:'icons',label:'Icons Only'},{id:'text',label:'Text Only'},{id:'both',label:'Icons and Text'}] as const).map(mode=>({id:`tab.display.${mode.id}`,label:mode.label,checked:(w.tabOptions(paneId).display ?? 'both')===mode.id}))});
  return w.tabOptions(paneId).contextMenu?.({paneId,tabId},defaults) ?? defaults;
}
export function selectWorkspaceTabMenu(w: Workspace, paneId: string, tabId: string, id: string) {
  const local = w.tabs.value.filter(t => t.paneId === paneId);
  const tab = local.find(t => t.id === tabId); if (!tab) return;
  const at = local.indexOf(tab);
  const operation = id.slice(4);
  const candidates = operation === 'close' ? [tab] : operation === 'others' ? local.filter(t => t.id !== tabId) : operation === 'right' ? local.slice(at+1) : operation === 'left' ? local.slice(0,at) : operation === 'all' ? local : undefined;
  if (candidates) { void w.closeTabs(candidates.filter(t => !t.pinned && t.closable !== false).map(t => t.id),'menu'); return; }
  if (operation.startsWith('display.')) {const display=operation.slice(8);if(display==='icons'||display==='text'||display==='both')w.configurePaneTabs(paneId,{display});}
  if (operation === 'pin') w.setTabPinned(tabId,!tab.pinned,'menu');
  if (operation.startsWith('split.') && w.canSplit(paneId)) w.split(operation.slice(6) as WorkspaceSplitDirection,paneId);
  if (operation.startsWith('move.')) w.moveTab(tabId,operation.slice(5),undefined,'menu');
  if (operation.startsWith('new.')) w.moveTabToNewPane(tabId,operation.slice(4) as WorkspaceSplitDirection,'menu');
}
