import { computed, markRaw, shallowReactive, shallowRef } from 'vue';
import type { Component } from 'vue';
import type { FrameMenuItem } from '../types';
import { createBarSeparators, type BarSeparatorOptions } from './barSeparators';

export type StatusSide = 'left' | 'right';
export type StatusSeverity = 'info' | 'success' | 'warning' | 'error';
export interface StatusMessage { text: string; severity: StatusSeverity }
export interface StatusMessageOptions { duration?: number; severity?: StatusSeverity }
export interface StatusOptions extends BarSeparatorOptions {
  /** Permit moving items between sides and repositioning separators. Default: true. */
  allowMove?: boolean;
  visible?: boolean;
  message?: string;
  hidden?: readonly string[];
  hiddenBadges?: readonly string[];
}
interface StatusItemBase {
  id: string;
  /** Stable accessible name and context-menu label. */
  label: string;
  text?: string;
  icon?: string | Component;
  tooltip?: string;
  shortcut?: string;
  expanded?: boolean;
  controls?: string;
  side?: StatusSide;
  /** Lower values appear first within each side. Registration order breaks ties. */
  order?: number;
  /** Synchronize an installed feature's own presentation after a side move. */
  onMove?: (side: StatusSide) => void;
  visible?: boolean;
  badge?: string | number;
  /** Availability is distinct from the user's visibility preference. */
  available?: () => boolean;
  /** Allows an installed item to use another presentation, such as the title bar. */
  showInStatusBar?: () => boolean;
}
export type StatusItemDefinition = StatusItemBase & (
  { kind: 'text'; run?: never; menu?: never; disabled?: never } |
  { kind: 'button'; run?: () => void; menu?: () => readonly FrameMenuItem[]; disabled?: boolean }
);
export type StatusItem = Omit<StatusItemDefinition, 'side' | 'visible' | 'available' | 'showInStatusBar'> & {
  side: StatusSide; visible: boolean; badgeVisible: boolean; available: boolean; showInStatusBar: boolean;
};
export interface StatusItemUpdate { label?: string; text?: string; tooltip?: string; icon?: string | Component; badge?: string | number; disabled?: boolean }

/** Status contributions and transient text belong to one Frame, not its mounted shell. */
export function createStatus(layout: { statusBarVisible: boolean }, options: StatusOptions = {}, moved?: (id: string) => void) {
  const definitions = shallowReactive(new Map<string, StatusItemDefinition>());
  const allowMove = computed(() => !disposed.value && options.allowMove !== false);
  const separators = createBarSeparators({
    ...options,
    get allowAddSeparator() { return allowMove.value && options.allowAddSeparator === true; },
  }, id => definitions.has(id), () => allowMove.value);
  const sides = shallowReactive(new Map<string, StatusSide>());
  const visibility = shallowReactive(new Map<string, boolean>());
  const badges = shallowReactive(new Map<string, boolean>());
  const disposed = shallowRef(false);
  const persistent = shallowRef<StatusMessage>({ text: options.message ?? 'Ready', severity: 'info' });
  const temporary = shallowRef<StatusMessage>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  const message = computed(() => temporary.value ?? persistent.value);
  function cancelTemporary() {
    generation++;
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined; temporary.value = undefined;
  }
  function set(text: string) { if (!disposed.value) persistent.value = { text, severity: 'info' }; }
  function show(text: string, { duration = 4000, severity = 'info' }: StatusMessageOptions = {}) {
    if (disposed.value) return () => {};
    if (!Number.isFinite(duration) || duration < 0) throw new Error('Status duration must be a non-negative finite number');
    cancelTemporary();
    temporary.value = { text, severity };
    const current = generation;
    const dismiss = () => { if (current === generation) cancelTemporary(); };
    if (duration > 0) timer = setTimeout(dismiss, duration);
    return dismiss;
  }
  function clear() { if (!disposed.value) { cancelTemporary(); set(''); } }
  const find = (id: string) => disposed.value ? undefined : definitions.get(id);
  function isVisible(id: string) { const item = find(id); return !!item && (visibility.get(id) ?? item.visible !== false); }
  function register(item: StatusItemDefinition) {
    if (disposed.value) throw new Error('Frame status is disposed');
    if (!item.id || definitions.has(item.id) || separators.separators.value.some(entry => entry.id === item.id)) throw new Error(`Duplicate or empty status item: ${item.id}`);
    if (!['text', 'button'].includes(item.kind) || item.side !== undefined && !['left', 'right'].includes(item.side)) throw new Error('Invalid status item kind or side');
    // Preserve reactive getters provided by installed features without owning their resources.
    const definition = shallowReactive(Object.defineProperties({}, Object.getOwnPropertyDescriptors(item))) as StatusItemDefinition;
    const id = item.id;
    if (definition.icon && typeof definition.icon !== 'string') markRaw(definition.icon);
    definitions.set(item.id, definition);
    if (options.hidden?.includes(item.id)) visibility.set(item.id, false);
    if (options.hiddenBadges?.includes(item.id)) badges.set(item.id, false);
    return () => {
      if (definitions.get(id) !== definition) return;
      definitions.delete(id); sides.delete(id); visibility.delete(id); badges.delete(id);
    };
  }
  const items = computed<StatusItem[]>(() => disposed.value ? [] : [...definitions.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(item => ({
    ...item, side: sides.get(item.id) ?? item.side ?? 'left', visible: isVisible(item.id),
    badgeVisible: badges.get(item.id) ?? true, available: item.available?.() !== false, showInStatusBar: item.showInStatusBar?.() !== false,
  })));
  function setVisible(id: string, visible: boolean) { if (!find(id)) return false; visibility.set(id, visible); return true; }
  function setBadgeVisible(id: string, visible: boolean) { if (!find(id)) return false; badges.set(id, visible); return true; }
  /** Restore a contribution's configured side without changing its visibility. */
  function resetItemPosition(id: string) { if (!find(id)) return false; sides.delete(id); return true; }
  function move(id: string, side: StatusSide) {
    const item = find(id);
    if (!allowMove.value || !item || !['left', 'right'].includes(side)) return false;
    sides.set(id, side); item.onMove?.(side); moved?.(id); return true;
  }
  function update(id: string, patch: StatusItemUpdate) {
    const item = find(id); if (!item) return false;
    for (const key of Object.keys(patch)) {
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (descriptor && ('get' in descriptor ? !descriptor.set : descriptor.writable === false)) return false;
    }
    if (patch.icon && typeof patch.icon !== 'string') markRaw(patch.icon);
    for (const key of ['label', 'text', 'tooltip', 'icon', 'badge', 'disabled'] as const) {
      if (Object.prototype.hasOwnProperty.call(patch, key) && !(key === 'disabled' && item.kind === 'text')) Reflect.set(item, key, patch[key]);
    }
    return true;
  }
  function activate(id: string) {
    const item = find(id);
    if (!item || item.kind !== 'button' || item.disabled || item.available?.() === false) return false;
    item.run?.(); return true;
  }
  function setBarVisible(visible: boolean) { if (disposed.value) return false; layout.statusBarVisible = visible; return true; }
  function resetPresentation() {
    if (disposed.value) return;
    sides.clear(); visibility.clear(); badges.clear();
    for (const id of options.hidden ?? []) visibility.set(id, false);
    for (const id of options.hiddenBadges ?? []) badges.set(id, false);
    setBarVisible(options.visible ?? true);
  }
  resetPresentation();
  function dispose() {
    if (disposed.value) return;
    cancelTemporary(); separators.disposeSeparators(); disposed.value = true;
    persistent.value = { text: '', severity: 'info' };
    definitions.clear(); sides.clear(); visibility.clear(); badges.clear();
  }
  return { ...separators, allowMove, items, message, register, update, isVisible, setVisible, setBadgeVisible, resetItemPosition, move, activate, setBarVisible, set, show, clear, resetPresentation, dispose };
}
export type StatusController = ReturnType<typeof createStatus>;
