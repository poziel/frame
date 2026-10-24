import { computed, markRaw, reactive, readonly, shallowRef, type ComputedRef, type Ref } from 'vue';
import type { WorkspacePane, WorkspaceSplitDirection } from '../types';
import type { WorkspaceOptions, WorkspaceTab, WorkspaceTabDefinition, WorkspaceResult, WorkspaceOperationSource, WorkspaceChangeEvent, WorkspacePaneMode, WorkspaceFailure, WorkspaceTabOptions, WorkspaceCloseConfirmation } from './workspaceTypes';

interface Host {
  options: WorkspaceOptions;
  tabOptions(id: string): Readonly<WorkspaceTabOptions>;
  panes: ComputedRef<WorkspacePane[]>;
  activePane: Ref<string>;
  paneMode(id: string): WorkspacePaneMode;
  setPaneMode(id: string, mode: WorkspacePaneMode): WorkspaceResult;
  canConvert(id: string): boolean;
  canSplit(id?: string): boolean;
  split(direction: WorkspaceSplitDirection, target?: string): string;
  removePane(id: string): boolean;
  isDisposed(): boolean;
}
const fail = (reason: WorkspaceFailure): WorkspaceResult<never> => ({ ok: false, reason });
const success = <T>(value: T): WorkspaceResult<T> => ({ ok: true, value });
function abortable<T>(value: T | Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve,reject) => {
    const abort = () => reject(new Error('Workspace operation aborted'));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort',abort,{once:true});
    Promise.resolve(value).then(resolve,reject).finally(() => signal.removeEventListener('abort',abort));
  });
}

/** State changes are immutable; async operations commit only against their starting revision. */
export function createWorkspaceTabs(host: Host) {
  const state = shallowRef<readonly WorkspaceTab[]>([]);
  const active = reactive<Record<string, string | undefined>>({});
  const tabs = computed(() => Object.freeze([...state.value]));
  const activeTabs = computed(() => readonly(active));
  const listeners = new Set<(event: WorkspaceChangeEvent) => void>();
  const pending = new Set<AbortController>();
  const dragId = shallowRef<string>();
  const draggedTab = computed(() => dragId.value);
  const closing = new Set<string>();
  const pendingConfirmation = shallowRef<WorkspaceCloseConfirmation>();
  const closeConfirmation = computed(() => pendingConfirmation.value);
  function confirmDirty(tabs: readonly WorkspaceTab[], signal: AbortSignal): Promise<boolean> {
    if (pendingConfirmation.value || signal.aborted) return Promise.resolve(false);
    return new Promise(resolve => {
      let settled = false;
      const respond = (discard: boolean) => {
        if (settled) return; settled = true;
        signal.removeEventListener('abort', abort);
        if (pendingConfirmation.value?.respond === respond) pendingConfirmation.value = undefined;
        resolve(discard);
      };
      const abort = () => respond(false);
      signal.addEventListener('abort', abort, { once: true });
      pendingConfirmation.value = { tabs, respond };
    });
  }
  let revision = 0, nextId = 0;
  const hasPane = (id: string) => host.panes.value.some(p => p.id === id);
  const find = (id: string) => state.value.find(t => t.id === id);
  function invalidate() { revision++; dragId.value = undefined; for (const c of pending) c.abort(); }
  function emit(type: WorkspaceChangeEvent['type'], paneId: string, tabIds: readonly string[], source: WorkspaceOperationSource = 'api', destinationPaneId?: string) {
    for (const listener of [...listeners]) { try { listener({type,paneId,tabIds,source,destinationPaneId}); } catch (error) { console.error('Workspace change listener failed', error); } }
  }
  function normalize(tab: WorkspaceTabDefinition, paneId: string): WorkspaceTab {
    return Object.freeze({ ...tab, paneId, component: tab.component ? markRaw(tab.component) : undefined, icon: typeof tab.icon === 'object' ? markRaw(tab.icon) : tab.icon });
  }
  function group(list: readonly WorkspaceTab[]) {
    return host.panes.value.flatMap(p => { const local = list.filter(t => t.paneId === p.id); return [...local.filter(t => t.pinned), ...local.filter(t => !t.pinned)]; });
  }
  function fallback(paneId: string, removed: readonly string[]) {
    const local = state.value.filter(t => t.paneId === paneId);
    const index = local.findIndex(t => t.id === active[paneId]);
    if (active[paneId] && !removed.includes(active[paneId]!)) return;
    active[paneId] = local.slice(index + 1).find(t => !removed.includes(t.id))?.id ?? local.slice(0, Math.max(0,index)).reverse().find(t => !removed.includes(t.id))?.id;
  }
  function remove(ids: readonly string[]) {
    for (const pane of host.panes.value) fallback(pane.id, ids);
    state.value = state.value.filter(t => !ids.includes(t.id)); invalidate();
  }
  function registerTab(paneId: string, definition: WorkspaceTabDefinition, source: WorkspaceOperationSource = 'api') {
    if (host.isDisposed()) throw new Error('Workspace disposed');
    if (!hasPane(paneId) || host.paneMode(paneId) !== 'tabs') throw new Error('Tab registration requires a tabbed pane');
    if (!definition.id || find(definition.id)) throw new Error('Workspace tab id must be unique and nonempty');
    const value = normalize(definition,paneId);
    registrations.set(value.id,value);
    state.value = group([...state.value,value]); active[paneId] = value.id; invalidate(); emit('register',paneId,[value.id],source);
    let removed = false;
    return () => { if (removed) return; removed = true; const current = find(value.id); if (current === value || current && current.id === value.id && registrations.get(value.id) === value) { remove([value.id]); registrations.delete(value.id); emit('close',current.paneId,[value.id]); } };
  }
  async function confirmUnsavedChanges(ids: readonly string[]): Promise<boolean> {
    if (host.isDisposed()) return false;
    const dirty = ids.map(find).filter((tab): tab is WorkspaceTab => !!tab && !!tab.dirty && !!host.tabOptions(tab.paneId).trackChanges);
    if (!dirty.length) return true;
    const controller = new AbortController(); pending.add(controller);
    try { return await confirmDirty(dirty, controller.signal); } finally { pending.delete(controller); }
  }
  // Registration identity survives immutable updates and transfer, but not unregister/re-register.
  const registrations = new Map<string, WorkspaceTab>();
  function register(paneId: string, definition: WorkspaceTabDefinition, source: WorkspaceOperationSource = 'api') {
    return registerTab(paneId,definition,source);
  }
  function updateTab(id: string, patch: Partial<Omit<WorkspaceTabDefinition,'id'>>, source: WorkspaceOperationSource = 'api') : WorkspaceResult {
    if (host.isDisposed()) return fail('disposed');
    const tab = find(id); if (!tab) return fail('missing');
    const { id: _id, paneId: _paneId, ...safe } = patch as Partial<WorkspaceTab>;
    state.value = group(state.value.map(t => t.id === id ? normalize({...t,...safe},t.paneId) : t));
    invalidate(); emit('update',tab.paneId,[id],source); return success(undefined);
  }
  function activateTab(id: string, source: WorkspaceOperationSource = 'api'): WorkspaceResult {
    if (host.isDisposed()) return fail('disposed');
    const tab = find(id); if (!tab) return fail('missing');
    active[tab.paneId] = id; host.activePane.value = tab.paneId; emit('activate',tab.paneId,[id],source); return success(undefined);
  }
  function canCreateTab(paneId = host.activePane.value) {
    const blank = host.panes.value.length === 1 && !state.value.length && host.canConvert(paneId);
    return !host.isDisposed() && hasPane(paneId) && (host.paneMode(paneId) === 'tabs' || blank) && !!host.tabOptions(paneId).allowCreate;
  }
  function canCloseTab(id: string) {
    const t = find(id);
    return !host.isDisposed() && !!t && !!host.tabOptions(t.paneId).allowClose && !t.pinned && t.closable !== false && (host.tabOptions(t.paneId).lastTab === 'allow-empty' || state.value.filter(x => x.paneId === t.paneId).length > 1);
  }
  async function requestTab(paneId = host.activePane.value, source: WorkspaceOperationSource = 'api'): Promise<WorkspaceResult<string>> {
    if (host.isDisposed()) return fail('disposed');
    if (!canCreateTab(paneId)) return fail(hasPane(paneId) ? 'disabled' : 'missing');
    const controller = new AbortController(); pending.add(controller); const before = revision;
    const factory = host.tabOptions(paneId).create;
    try {
      let definition: WorkspaceTabDefinition | undefined;
      if (factory) definition = await abortable(factory({paneId,source,tabIds:[],signal:controller.signal}),controller.signal);
      else { let id: string; do { id = `tab-${++nextId}`; } while (find(id)); definition = {id,title:'New tab',icon:'file'}; }
      if (host.isDisposed()) return fail('disposed');
      if (controller.signal.aborted || revision !== before || !hasPane(paneId)) return fail('stale');
      if (!canCreateTab(paneId)) return fail('disabled');
      if (!definition) return fail('cancelled');
      if (!definition.id || find(definition.id)) return fail('conflict');
      const conversion = host.setPaneMode(paneId,'tabs');
      if (!conversion.ok) return conversion;
      register(paneId,definition,source); emit('activate',paneId,[definition.id],source); return success(definition.id);
    } catch { return fail(host.isDisposed() ? 'disposed' : controller.signal.aborted ? 'stale' : 'cancelled'); } finally { pending.delete(controller); }
  }
  async function guardedClose(ids: readonly string[], source: WorkspaceOperationSource, paneClosure = false): Promise<WorkspaceResult> {
    if (host.isDisposed()) return fail('disposed');
    const unique = [...new Set(ids)];
    if (!unique.length) return success(undefined);
    const candidates = unique.map(find);
    if (candidates.some(t => !t)) return fail('missing');
    if (candidates.some(t => !host.tabOptions(t!.paneId).allowClose || t!.pinned || t!.closable === false)) return fail('disabled');
    if (unique.some(id => closing.has(id))) return fail('conflict');
    if (!paneClosure && host.panes.value.some(p => { if(host.tabOptions(p.id).lastTab === 'allow-empty') return false; const local = state.value.filter(t => t.paneId === p.id); return local.length > 0 && local.every(t => unique.includes(t.id)); })) return fail('disabled');
    const controller = new AbortController(); pending.add(controller); unique.forEach(id => closing.add(id)); const before = revision;
    try {
      for (const paneId of new Set(candidates.map(t => t!.paneId))) {
        const dirty = candidates.filter((tab): tab is WorkspaceTab => !!tab && tab.paneId === paneId && !!tab.dirty && !!host.tabOptions(paneId).trackChanges);
        if (dirty.length && !await confirmDirty(dirty, controller.signal)) return fail(controller.signal.aborted ? 'stale' : 'cancelled');
        if (controller.signal.aborted || revision !== before) return fail('stale');
        const guard = host.tabOptions(paneId).beforeClose;
        if (!guard) continue;
        if (!await abortable(guard({paneId,source,tabIds:unique.filter(id => find(id)?.paneId === paneId),signal:controller.signal}),controller.signal)) return fail('cancelled');
        if (controller.signal.aborted || revision !== before) return fail('stale');
      }
      if (host.isDisposed()) return fail('disposed');
      if (revision !== before || controller.signal.aborted) return fail('stale');
      if(candidates.some(t=>!host.tabOptions(t!.paneId).allowClose)) return fail('disabled');
      const paneId = candidates[0]!.paneId;
      if (paneClosure && (!hasPane(paneId) || host.panes.value.length === 1)) return fail('stale');
      remove(unique);
      if (paneClosure) { host.removePane(paneId); delete active[paneId]; }
      else for (const id of new Set(candidates.map(t => t!.paneId))) {
        if (state.value.some(t => t.paneId === id)) continue;
        if (host.panes.value.length > 1) { host.removePane(id); delete active[id]; }
        else host.setPaneMode(id,'plain');
      }
      unique.forEach(id => registrations.delete(id)); emit('close',paneId,unique,source);
      if (paneClosure) emit('pane',paneId,unique,source);
      return success(undefined);
    } catch { return fail(host.isDisposed() ? 'disposed' : controller.signal.aborted ? 'stale' : 'cancelled'); } finally { pending.delete(controller); unique.forEach(id => closing.delete(id)); }
  }
  const closeTabs = (ids: readonly string[], source: WorkspaceOperationSource = 'api') => guardedClose(ids,source);
  function setTabPinned(id: string, pinned: boolean, source: WorkspaceOperationSource = 'api'): WorkspaceResult {
    const result = updateTab(id,{pinned},source);
    const tab = find(id);
    if (result.ok && tab) emit('pin',tab.paneId,[id],source);
    return result;
  }
  function canMoveTab(id: string, destinationPaneId: string) {
    const tab = find(id);
    return !host.isDisposed() && !!tab && !!host.tabOptions(tab.paneId).allowMove && !!host.tabOptions(destinationPaneId).allowMove && tab.movable !== false && hasPane(destinationPaneId) && (host.paneMode(destinationPaneId) === 'tabs' || host.canConvert(destinationPaneId));
  }
  function moveTab(id: string, destinationPaneId: string, index?: number, source: WorkspaceOperationSource = 'api'): WorkspaceResult {
    if (host.isDisposed()) return fail('disposed');
    const tab = find(id); if (!tab || !hasPane(destinationPaneId)) return fail('missing');
    if (!canMoveTab(id,destinationPaneId)) return fail('disabled');
    const local = state.value.filter(t => t.paneId === destinationPaneId && t.id !== id);
    const at = index ?? local.length;
    if (!Number.isInteger(at) || at < 0 || at > local.length) return fail('invalid');
    const conversion = host.setPaneMode(destinationPaneId,'tabs'); if (!conversion.ok) return conversion;
    if (tab.paneId !== destinationPaneId) fallback(tab.paneId,[id]);
    local.splice(at,0,normalize(tab,destinationPaneId));
    state.value = group([...state.value.filter(t => t.id !== id && t.paneId !== destinationPaneId),...local]);
    active[destinationPaneId] = id; host.activePane.value = destinationPaneId; invalidate(); emit('move',tab.paneId,[id],source,destinationPaneId); return success(undefined);
  }
  function moveTabToNewPane(id: string, direction: WorkspaceSplitDirection, source: WorkspaceOperationSource = 'api'): WorkspaceResult<string> {
    if (host.isDisposed()) return fail('disposed');
    const tab = find(id); if (!tab) return fail('missing');
    if (!host.tabOptions(tab.paneId).allowMove || tab.movable === false || !host.options.allowPaneCreation) return fail('disabled');
    if (!host.canSplit(tab.paneId)) return fail('limit');
    if (!['left','right','up','down'].includes(direction)) return fail('invalid');
    const paneId = host.split(direction,tab.paneId);
    const moved = moveTab(id,paneId,undefined,source);
    if (!moved.ok) { host.removePane(paneId); return moved; }
    return success(paneId);
  }
  async function requestClosePane(id = host.activePane.value, source: WorkspaceOperationSource = 'api'): Promise<WorkspaceResult> {
    if (host.isDisposed()) return fail('disposed');
    if (!hasPane(id)) return fail('missing');
    if (host.panes.value.length === 1) return fail('disabled');
    const ids = state.value.filter(t => t.paneId === id).map(t => t.id);
    // Do not yield for an empty pane; otherwise another operation could populate it.
    if (ids.length) return guardedClose(ids,source,true);
    if (state.value.some(t => t.paneId === id)) return fail('stale');
    if (!host.removePane(id)) return fail('stale');
    delete active[id]; emit('pane',id,ids,source); return success(undefined);
  }
  function reset() { invalidate(); state.value = []; registrations.clear(); for (const id of Object.keys(active)) delete active[id]; emit('reset',host.activePane.value,[]); }
  function dispose() { reset(); listeners.clear(); pending.clear(); }
  function onDidChange(listener: (event: WorkspaceChangeEvent) => void) { if (host.isDisposed()) return () => {}; listeners.add(listener); return () => { listeners.delete(listener); }; }
  function tabDragData(id: string) {
    const tab = find(id);
    if (tab && canMoveTab(id,tab.paneId)) dragId.value = id;
    return tab && canMoveTab(id,tab.paneId) ? JSON.stringify({id,revision}) : undefined;
  }
  function readTabDrag(payload: string) {
    try {
      const data: unknown = JSON.parse(payload);
      if (!data || typeof data !== 'object' || !('id' in data) || !('revision' in data) || typeof data.id !== 'string' || data.revision !== revision) return;
      const tab = find(data.id);
      return tab && canMoveTab(tab.id,tab.paneId) ? tab.id : undefined;
    } catch { return; }
  }
  return { confirmUnsavedChanges, closeConfirmation, tabs, activeTabs, draggedTab, endTabDrag: () => { dragId.value = undefined; }, registerTab: register, updateTab, activateTab, requestTab, closeTabs, setTabPinned, moveTab, moveTabToNewPane, requestClosePane, canCreateTab, canCloseTab, canMoveTab, onDidChange, tabDragData, readTabDrag, invalidate, reset, dispose };
}
