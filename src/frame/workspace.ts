import { computed, markRaw, ref, shallowReactive, shallowRef } from "vue";
import type { WorkspaceNode, WorkspacePane, WorkspacePaneContent, WorkspaceSplitDirection } from "../types";
import { clamp } from "./layout";

/** A split tree controls geometry; a separate registry keeps content identity stable. */
export function createWorkspace() {
  const initialPaneId = "pane-1";
  let nextId = 1;
  const root = shallowRef<WorkspaceNode>({ type: "pane", id: initialPaneId });
  const activePane = ref(initialPaneId);
  const registry = shallowReactive(new Map<string, WorkspacePane>([[initialPaneId, { id: initialPaneId, label: "Workspace" }]]));
  const panes = computed(() => [...registry.values()]);
  function replace(node: WorkspaceNode, id: string, replacement: WorkspaceNode): WorkspaceNode {
    if (node.id === id) return replacement;
    return node.type === "pane" ? node : { ...node, first: replace(node.first, id, replacement), second: replace(node.second, id, replacement) };
  }
  function setPane(id: string, content: WorkspacePaneContent) {
    if (!registry.has(id)) throw new Error(`Unknown workspace pane: ${id}`);
    registry.set(id, { ...content, id, component: content.component ? markRaw(content.component) : undefined });
  }
  function split(direction: WorkspaceSplitDirection, target = activePane.value, content?: WorkspacePaneContent) {
    if (!registry.has(target)) throw new Error(`Unknown workspace pane: ${target}`);
    const id = `pane-${++nextId}`;
    registry.set(id, { id, label: content?.label ?? `Pane ${nextId}`, ...content, component: content?.component ? markRaw(content.component) : undefined });
    const previous: WorkspaceNode = { type: "pane", id: target };
    const added: WorkspaceNode = { type: "pane", id };
    const leading = direction === "left" || direction === "up";
    root.value = replace(root.value, target, { type: "split", id: `split-${nextId}`, axis: direction === "left" || direction === "right" ? "x" : "y", ratio: .5, first: leading ? added : previous, second: leading ? previous : added });
    activePane.value = id;
    return id;
  }
  function close(id = activePane.value) {
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
    registry.clear(); registry.set(initialPaneId, { id: initialPaneId, label: "Workspace" });
    root.value = { type: "pane", id: initialPaneId }; activePane.value = initialPaneId;
  }
  function dispose() { registry.clear(); }
  return { reset, dispose, initialPaneId, root, activePane, panes, split, close, resize, focus, setPane };
}
