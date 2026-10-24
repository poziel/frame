import { computed, markRaw, ref, shallowReactive, shallowRef } from "vue";
import type { WorkspaceNode, WorkspacePane, WorkspacePaneContent, WorkspaceSplitDirection } from "../types";
import { clamp } from "./layout";
import { reactive, readonly } from 'vue';
import type { WorkspaceOptions, WorkspacePaneMode, WorkspaceResult, WorkspaceTabOptions } from './workspaceTypes';
import { createWorkspaceTabs } from './workspaceTabs';

/** A split tree controls geometry; a separate registry keeps content identity stable. */
export function createWorkspace(initialOptions: WorkspaceOptions = {}) {
  const dragMime = `application/x-frame-tab-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  const options = reactive<WorkspaceOptions>({ allowPaneCreation: true, maxPanes: 20, newPaneMode: 'plain', tabs: { allowCreate: false, allowClose: false, allowMove: false, lastTab: 'keep-one', showIcons: true, showTitles: true, showClose: true } });
  let disposed = false;
  let invalidatePending = () => {};
  const modes = reactive<Record<string, WorkspacePaneMode>>({ 'pane-1': 'plain' });
  const owners = new Map<string, Set<symbol>>();
  const paneOptions = reactive<Record<string, WorkspaceTabOptions>>({});
  function tabOptions(id: string): Readonly<WorkspaceTabOptions> {
    const global = options.tabs!;
    const local = paneOptions[id];
    return { ...global, ...local, allowCreate: !!global.allowCreate && local?.allowCreate !== false, allowClose: !!global.allowClose && local?.allowClose !== false, allowMove: !!global.allowMove && local?.allowMove !== false };
  }
  function configurePaneTabs(id: string, patch: WorkspaceTabOptions): WorkspaceResult {
    if (disposed) return {ok:false,reason:'disposed'};
    if (!registry.has(id)) return {ok:false,reason:'missing'};
    if (patch.lastTab !== undefined && !['keep-one','allow-empty'].includes(patch.lastTab)) return {ok:false,reason:'invalid'};
    if (patch.display !== undefined && !['icons','text','both'].includes(patch.display)) return {ok:false,reason:'invalid'};
    paneOptions[id] = { ...paneOptions[id], ...patch }; invalidatePending(); return {ok:true,value:undefined};
  }
  function configure(patch: Partial<WorkspaceOptions>) {
    if (disposed) throw new Error('Workspace disposed');
    const max = patch.maxPanes ?? options.maxPanes!;
    if (!Number.isInteger(max) || max < 1 || max > 20) throw new Error('maxPanes must be an integer from 1 through 20');
    if (patch.newPaneMode !== undefined && !['plain','tabs'].includes(patch.newPaneMode)) throw new Error('Invalid pane mode');
    if (patch.tabs?.lastTab !== undefined && !['keep-one','allow-empty'].includes(patch.tabs.lastTab)) throw new Error('Invalid last-tab policy');
    if (patch.tabs?.display !== undefined && !['icons','text','both'].includes(patch.tabs.display)) throw new Error('Invalid tab display');
    Object.assign(options, { ...patch, maxPanes: max, allowPaneCreation: patch.allowPaneCreation ?? options.allowPaneCreation, newPaneMode: patch.newPaneMode ?? options.newPaneMode, tabs: { ...options.tabs, ...patch.tabs } });
    invalidatePending();
  }
  configure(initialOptions);
  const initialPaneId = "pane-1";
  let nextId = 1;
  const root = shallowRef<WorkspaceNode>({ type: "pane", id: initialPaneId });
  const activePane = ref(initialPaneId);
  const registry = shallowReactive(new Map<string, WorkspacePane>([[initialPaneId, { id: initialPaneId, label: "Workspace" }]]));
  const panes = computed(() => [...registry.values()]);
  function paneMode(id: string) { return modes[id] ?? 'plain'; }
  function registerPaneContent(id: string) {
    const token = Symbol(); const set = owners.get(id) ?? new Set<symbol>();
    set.add(token); owners.set(id, set);
    return () => { set.delete(token); if (!set.size && owners.get(id) === set) owners.delete(id); };
  }
  function canConvert(id: string) { return registry.has(id) && !registry.get(id)?.component && !owners.get(id)?.size; }
  function setPaneMode(id: string, mode: WorkspacePaneMode): WorkspaceResult {
    if (disposed) return {ok:false,reason:'disposed'};
    if (!registry.has(id)) return {ok:false,reason:'missing'};
    if (mode !== 'plain' && mode !== 'tabs') return {ok:false,reason:'invalid'};
    if (paneMode(id) === mode) return {ok:true,value:undefined};
    if ((mode === 'tabs' && !canConvert(id)) || tabs.tabs.value.some(t => t.paneId === id)) return {ok:false,reason:'conflict'};
    modes[id] = mode; tabs.invalidate();
    return {ok:true,value:undefined};
  }
  function canSplit(target = activePane.value) { return !disposed && !!options.allowPaneCreation && registry.has(target) && registry.size < options.maxPanes!; }
  function replace(node: WorkspaceNode, id: string, replacement: WorkspaceNode): WorkspaceNode {
    if (node.id === id) return replacement;
    return node.type === "pane" ? node : { ...node, first: replace(node.first, id, replacement), second: replace(node.second, id, replacement) };
  }
  function setPane(id: string, content: WorkspacePaneContent) {
    if (disposed || paneMode(id) === 'tabs') throw new Error('Cannot replace tabbed or disposed pane content');
    if (!registry.has(id)) throw new Error(`Unknown workspace pane: ${id}`);
    registry.set(id, { ...content, id, component: content.component ? markRaw(content.component) : undefined });
  }
  function split(direction: WorkspaceSplitDirection = "right", target = activePane.value, content?: WorkspacePaneContent) {
    if (!registry.has(target)) throw new Error(`Unknown workspace pane: ${target}`);
    if (!canSplit(target)) throw new Error('Workspace pane creation disabled or maximum reached');
    if (!['left','right','up','down'].includes(direction)) throw new Error('Invalid split direction');
    const id = `pane-${++nextId}`;
    registry.set(id, { id, label: content?.label ?? `Pane ${nextId}`, ...content, component: content?.component ? markRaw(content.component) : undefined });
    modes[id] = content ? 'plain' : options.newPaneMode!;
    const previous: WorkspaceNode = { type: "pane", id: target };
    const added: WorkspaceNode = { type: "pane", id };
    const leading = direction === "left" || direction === "up";
    root.value = replace(root.value, target, { type: "split", id: `split-${nextId}`, axis: direction === "left" || direction === "right" ? "x" : "y", ratio: .5, first: leading ? added : previous, second: leading ? previous : added });
    activePane.value = id;
    return id;
  }
  function close(id = activePane.value) {
    if (tabs.tabs.value.some(t => t.paneId === id)) return false;
    return removePane(id);
  }
  function removePane(id: string) {
    if (!registry.has(id) || registry.size === 1) return false;
    function remove(node: WorkspaceNode): WorkspaceNode | undefined {
      if (node.type === "pane") return node.id === id ? undefined : node;
      const first = remove(node.first), second = remove(node.second);
      if (!first) return second;
      if (!second) return first;
      return { ...node, first, second };
    }
    root.value = remove(root.value)!;
    registry.delete(id);
    delete modes[id]; delete paneOptions[id]; owners.delete(id); tabs.invalidate();
    if (activePane.value === id) {
      let next = root.value;
      while (next.type === "split") next = next.first;
      activePane.value = next.id;
    }
    return true;
  }
  function resize(id: string, ratio: number) {
    function update(node: WorkspaceNode): WorkspaceNode {
      if (node.type === "pane") return node;
      if (node.id === id) return { ...node, ratio: clamp(ratio, .1, .9) };
      return { ...node, first: update(node.first), second: update(node.second) };
    }
    root.value = update(root.value);
  }
  function focus(id: string) { if (registry.has(id)) activePane.value = id; }
  function reset() {
    if (disposed) return;
    tabs.reset();
    for (const key of Object.keys(paneOptions)) delete paneOptions[key];
    for (const key of Object.keys(modes)) delete modes[key]; modes[initialPaneId] = 'plain';
    registry.clear(); registry.set(initialPaneId, { id: initialPaneId, label: "Workspace" });
    root.value = { type: "pane", id: initialPaneId }; activePane.value = initialPaneId;
  }
  const tabs = createWorkspaceTabs({ options, tabOptions, panes, activePane, paneMode, setPaneMode, canConvert, canSplit, split, removePane, isDisposed: () => disposed });
  invalidatePending = tabs.invalidate;
  function dispose() { if (disposed) return; disposed = true; tabs.dispose(); registry.clear(); owners.clear(); }
  return { ...tabs, dragMime, reset, dispose, options: readonly(options), configure, configurePaneTabs, tabOptions, paneMode, setPaneMode, registerPaneContent, canSplit, initialPaneId, root, activePane, panes, split, close, resize, focus, setPane };
}
