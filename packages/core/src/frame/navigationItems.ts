import { computed, markRaw, shallowReactive, shallowRef } from 'vue';
import type { Component } from 'vue';
import type { ViewBadge } from './barTypes';

interface NavigationBase { id: string; visible?: boolean; draggable?: boolean }
interface NamedNavigationItem extends NavigationBase { label: string; icon?: Component; badge?: ViewBadge; disabled?: boolean }
export interface NavigationActionItem extends NamedNavigationItem { type: 'action'; run: () => void | Promise<void>; active?: boolean | (() => boolean) }
export interface NavigationLinkItem extends NamedNavigationItem { type: 'link'; href: string; target?: string; rel?: string; onNavigate?: (href: string) => void | Promise<void>; active?: boolean | (() => boolean) }
export interface NavigationDropdownItem extends NamedNavigationItem { type: 'dropdown'; items: readonly NavigationItem[] }
export interface NavigationSeparatorItem extends NavigationBase { type: 'separator'; label?: string; allowRemove?: boolean }
export type NavigationItem = NavigationActionItem | NavigationLinkItem | NavigationDropdownItem | NavigationSeparatorItem;
export interface NavigationServices { navigate(href: string, target?: string, rel?: string): void | Promise<void>; reportError(label: string, error: unknown): void }

/** Navigation has its own registry and never manufactures or moves a view. */
export function createNavigationItems(services: NavigationServices) {
  const roots = shallowReactive<NavigationItem[]>([]);
  const index = shallowReactive(new Map<string, { item: NavigationItem; parent?: string }>());
  const visibility = shallowReactive(new Map<string, boolean>()), badges = shallowReactive(new Map<string, boolean>()), values = shallowReactive(new Map<string, ViewBadge | undefined>());
  const removers=new Map<string,()=>void>();
  const disposed = shallowRef(false);
  function register(input: NavigationItem) {
    if (disposed.value) throw new Error('Frame is disposed');
    const pending = new Map<string, { item: NavigationItem; parent?: string }>();
    const visiting = new Set<NavigationItem>();
    function copy(item: NavigationItem, parent?: string): NavigationItem {
      if (!item || typeof item.id !== 'string' || !item.id || visiting.has(item) || pending.has(item.id) || index.has(item.id)) throw new Error(`Invalid or duplicate navigation item: ${item?.id}`);
      if (!['action', 'link', 'dropdown', 'separator'].includes(item.type)) throw new Error(`Unknown navigation item type: ${item.id}`);
      const allowed = new Set(['id','type','label','visible','draggable', ...(item.type === 'separator' ? ['allowRemove'] : ['icon','badge','disabled']), ...(item.type === 'action' ? ['run','active'] : item.type === 'link' ? ['href','target','rel','onNavigate','active'] : item.type === 'dropdown' ? ['items'] : [])]);
      if (Object.keys(item).some(key => !allowed.has(key))) throw new Error(`Mixed or unknown navigation fields: ${item.id}`);
      if ('component' in item || 'region' in item || 'bar' in item) throw new Error('Navigation items cannot contain view placement or content');
      if (item.type !== 'separator' && typeof item.label !== 'string') throw new Error(`Navigation item requires a label: ${item.id}`);
      if (item.type === 'action' && typeof item.run !== 'function' || item.type === 'link' && typeof item.href !== 'string' || item.type === 'dropdown' && !Array.isArray(item.items)) throw new Error(`Invalid navigation behavior: ${item.id}`);
      visiting.add(item);
      const definition = { ...item } as NavigationItem;
      pending.set(item.id, { item: definition, parent });
      if (definition.type !== 'separator' && definition.icon) definition.icon = markRaw(definition.icon);
      if (definition.type === 'dropdown' && item.type === 'dropdown') definition.items = Object.freeze(Array.from(item.items, child => copy(child, item.id)));
      visiting.delete(item);
      return Object.freeze(definition);
    }
    const root = copy(input);
    pending.forEach((entry, id) => index.set(id, entry)); roots.push(root);
    const remove = () => {
      if (index.get(root.id)?.item !== root) return;
      const at = roots.indexOf(root); if (at >= 0) roots.splice(at, 1);
      removers.delete(root.id);
      pending.forEach((_entry, id) => { index.delete(id); visibility.delete(id); badges.delete(id); values.delete(id); });
    };
    removers.set(root.id,remove);return remove;
  }
  function removeSeparator(id:string){const item=find(id);if(item?.type!=='separator'||!item.allowRemove||!removers.has(id))return false;removers.get(id)!();return true;}
  const find = (id: string) => disposed.value ? undefined : index.get(id)?.item;
  function getItemState(id: string) {
    const item = find(id); if (!item) return undefined;
    return Object.freeze({ visible: visibility.get(id) ?? item.visible !== false, badgeVisible: item.type !== 'separator' && (badges.get(id) ?? true), badge: item.type === 'separator' ? undefined : values.has(id) ? values.get(id) : item.badge });
  }
  function enabled(id: string): boolean {
    const entry = index.get(id);
    return !disposed.value && !!entry && !!getItemState(id)?.visible && !(entry.item.type !== 'separator' && entry.item.disabled) && (!entry.parent || enabled(entry.parent));
  }
  async function activate(id: string) {
    const item = find(id); if (!item || !enabled(id) || item.type === 'dropdown' || item.type === 'separator') return false;
    try {
      if (item.type === 'action') await item.run();
      else if (item.onNavigate) await item.onNavigate(item.href);
      else await services.navigate(item.href, item.target, item.rel);
      return !disposed.value && find(id) === item;
    } catch (error) { if (!disposed.value) services.reportError(item.label, error); return false; }
  }
  function moveItem(id: string, beforeId?: string) {
    const at = roots.findIndex(item => item.id === id), before = beforeId === undefined ? roots.length : roots.findIndex(item => item.id === beforeId);
    if (disposed.value || at < 0 || before < 0 || roots[at]!.draggable === false) return false;
    if (id === beforeId) return true;
    const [item] = roots.splice(at, 1); roots.splice(before > at ? before - 1 : before, 0, item!); return true;
  }
  function setItemVisible(id: string, value: boolean) { if (!find(id)) return false; visibility.set(id, value); return true; }
  function setBadgeVisible(id: string, value: boolean) { const item = find(id); if (!item || item.type === 'separator') return false; badges.set(id, value); return true; }
  function setBadge(id: string, value?: ViewBadge) { const item = find(id); if (!item || item.type === 'separator') return false; values.set(id, value); return true; }
  return { removeSeparator, items: computed<readonly NavigationItem[]>(() => disposed.value ? [] : Object.freeze([...roots])), find, getItemState, enabled, register, activate, moveItem, setItemVisible, setBadgeVisible, setBadge, dispose() { disposed.value = true; roots.splice(0); removers.clear(); index.clear(); visibility.clear(); badges.clear(); values.clear(); } };
}

/** Apply visibility before removing leading, trailing and adjacent separators. */
export function normalizeNavigationItems(items: readonly NavigationItem[], visible: (id: string) => boolean): NavigationItem[] {
  const result: NavigationItem[] = [];
  for (const item of items) if (visible(item.id) && (item.type !== 'separator' || result.length && result[result.length - 1]!.type !== 'separator')) result.push(item);
  if (result[result.length - 1]?.type === 'separator') result.pop();
  return result;
}
