import type {ComputedRef, ShallowRef} from 'vue';
import {computed, markRaw, reactive, readonly, shallowRef, type Ref} from 'vue';
import type {WorkspacePane, WorkspaceSplitDirection} from './workspaceTypes';
import type {
  WorkspaceOptions,
  WorkspaceTab,
  WorkspaceTabDefinition,
  WorkspaceResult,
  WorkspaceOperationSource,
  WorkspaceChangeEvent,
  WorkspacePaneMode,
  WorkspaceFailure,
  WorkspaceTabOptions,
  WorkspaceCloseConfirmation,
} from './workspaceTypes';

/**
 * Explicit pane services used by the tab controller. Geometry, plain-content
 * ownership, and workspace lifetime remain authoritative in the host.
 */
export interface WorkspaceTabsHost {

  /** Workspace policies read by tab operations without owning geometry. */
  options: WorkspaceOptions;

  /** Reads effective pane-local policies combined with global permissions. */
  tabOptions(id: string): Readonly<WorkspaceTabOptions>;

  /** Reactive projection of current pane registrations. */
  panes: ComputedRef<WorkspacePane[]>;

  /** Current pane used by default-target tab operations. */
  activePane: Ref<string>;

  /** Reads whether a pane currently presents plain content or tabs. */
  paneMode(id: string): WorkspacePaneMode;

  /** Requests safe presentation conversion through the owning workspace. */
  setPaneMode(id: string, mode: WorkspacePaneMode): WorkspaceResult;

  /** Checks whether application-owned plain content permits conversion to tabs. */
  canConvert(id: string): boolean;

  /** Checks creation permissions and the current pane limit. */
  canSplit(id?: string): boolean;

  /** Creates a destination pane through the owning geometry controller. */
  split(direction: WorkspaceSplitDirection, target?: string): string;

  /** Collapses a pane branch while retaining surviving registered content. */
  removePane(id: string): boolean;

  /** Reports the owning workspace lifetime to pending and new tab operations. */
  isDisposed(): boolean;
}

/** Creates a rejected result without mutating workspace state. */
const fail = (reason: WorkspaceFailure): WorkspaceResult<never> => ({
  ok: false,
  reason,
});
/** Creates a successful result with its typed operation value. */
const success = <T>(value: T): WorkspaceResult<T> => ({ok: true, value});
/** Races a host result against cancellation without requiring host cooperation. */
function abortable<T>(value: T | Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new Error('Workspace operation aborted'));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, {once: true});
    Promise.resolve(value)
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort));
  });
}

/**
 * Owns immutable tab snapshots, selections, and guarded asynchronous operations.
 * Pending creation and close requests are cancelled or rejected when their
 * starting revision, permissions, registration identities, or lifetime change.
 */
export class WorkspaceTabs {

  /** Pane services supplied by the owning workspace; tab operations never own split geometry. */
  private readonly host: WorkspaceTabsHost;

  /** Current immutable tab registrations, ordered by pane and pin group. */
  private readonly state: ShallowRef<
    readonly WorkspaceTab[],
    readonly WorkspaceTab[]
  >;

  /** Selected tab identity for each pane. */
  private readonly active: Record<string, string | undefined>;

  /** Readonly projection of current immutable tab snapshots. */
  readonly tabs: ComputedRef<readonly WorkspaceTab[]>;

  /** Readonly reactive pane-to-tab selection mapping. */
  readonly activeTabs: ComputedRef<{readonly [x: string]: string | undefined}>;

  /** Workspace change callbacks registered by host consumers. */
  private readonly listeners: Set<(event: WorkspaceChangeEvent) => void>;

  /** Abort controllers for in-flight creation, confirmation, and close operations. */
  private readonly pending: Set<AbortController>;

  /** Identity of the tab currently represented by an active drag payload. */
  private readonly dragId: ShallowRef<string | undefined, string | undefined>;

  /** Reactive identity of the current tab drag, cleared on invalidation. */
  readonly draggedTab: ComputedRef<string | undefined>;

  /** Tab IDs reserved by active close operations to prevent conflicting commits. */
  private readonly closing: Set<string>;

  /** At most one active Frame-owned unsaved-changes confirmation. */
  private readonly pendingConfirmation: ShallowRef<
    WorkspaceCloseConfirmation | undefined,
    WorkspaceCloseConfirmation | undefined
  >;

  /** Reactive confirmation request displayed by the shell. */
  readonly closeConfirmation: ComputedRef<
    WorkspaceCloseConfirmation | undefined
  >;

  /** Mutation revision used to reject stale asynchronous commits and drag payloads. */
  private revision: number;

  /** Monotonic identity suffix avoiding collisions with existing pane or tab registrations. */
  private nextId: number;

  /** Original registration tokens retained across immutable updates and moves. */
  private readonly registrations: Map<string, WorkspaceTab>;

  /** Initializes isolated workspace state and binds callbacks used by shell services. */
  constructor(host: WorkspaceTabsHost) {
    this.hasPane = this.hasPane.bind(this);
    this.find = this.find.bind(this);
    this.closeTabs = this.closeTabs.bind(this);
    this.confirmDirty = this.confirmDirty.bind(this);
    this.invalidate = this.invalidate.bind(this);
    this.emit = this.emit.bind(this);
    this.normalize = this.normalize.bind(this);
    this.group = this.group.bind(this);
    this.fallback = this.fallback.bind(this);
    this.remove = this.remove.bind(this);
    this.confirmUnsavedChanges = this.confirmUnsavedChanges.bind(this);
    this.updateTab = this.updateTab.bind(this);
    this.activateTab = this.activateTab.bind(this);
    this.canCreateTab = this.canCreateTab.bind(this);
    this.canCloseTab = this.canCloseTab.bind(this);
    this.requestTab = this.requestTab.bind(this);
    this.guardedClose = this.guardedClose.bind(this);
    this.setTabPinned = this.setTabPinned.bind(this);
    this.canMoveTab = this.canMoveTab.bind(this);
    this.moveTab = this.moveTab.bind(this);
    this.moveTabToNewPane = this.moveTabToNewPane.bind(this);
    this.requestClosePane = this.requestClosePane.bind(this);
    this.reset = this.reset.bind(this);
    this.dispose = this.dispose.bind(this);
    this.onDidChange = this.onDidChange.bind(this);
    this.tabDragData = this.tabDragData.bind(this);
    this.readTabDrag = this.readTabDrag.bind(this);
    this.endTabDrag = this.endTabDrag.bind(this);
    this.registerTab = this.registerTab.bind(this);

    this.host = host;
    this.state = shallowRef<readonly WorkspaceTab[]>([]);
    this.active = reactive<Record<string, string | undefined>>({});
    this.tabs = computed(() => Object.freeze([...this.state.value]));
    this.activeTabs = computed(() => readonly(this.active));
    this.listeners = new Set<(event: WorkspaceChangeEvent) => void>();
    this.pending = new Set<AbortController>();
    this.dragId = shallowRef<string>();
    this.draggedTab = computed(() => this.dragId.value);
    this.closing = new Set<string>();
    this.pendingConfirmation = shallowRef<WorkspaceCloseConfirmation>();
    this.closeConfirmation = computed(() => this.pendingConfirmation.value);
    this.revision = 0;
    this.nextId = 0;
    this.registrations = new Map<string, WorkspaceTab>();
  }

  /** Requests a guarded close for a set of current tab identities. */
  closeTabs(ids: readonly string[], source: WorkspaceOperationSource = 'api') {
    return this.guardedClose(ids, source);
  }

  /** Advances the operation revision and cancels pending guards and drag payloads. */
  invalidate() {
    this.revision++;
    this.dragId.value = undefined;
    for (const c of this.pending) c.abort();
  }

  /** Confirms dirty tracked tabs without applying a close operation. */
  async confirmUnsavedChanges(ids: readonly string[]): Promise<boolean> {
    if (this.host.isDisposed()) return false;
    const dirty = ids
      .map(this.find)
      .filter(
        (tab): tab is WorkspaceTab =>
          !!tab &&
          !!tab.dirty &&
          !!this.host.tabOptions(tab.paneId).trackChanges
      );
    if (!dirty.length) return true;
    const controller = new AbortController();
    this.pending.add(controller);
    try {
      return await this.confirmDirty(dirty, controller.signal);
    } finally {
      this.pending.delete(controller);
    }
  }

  /** Replaces mutable tab metadata while preserving registration ownership. */
  updateTab(
    id: string,
    patch: Partial<Omit<WorkspaceTabDefinition, 'id'>>,
    source: WorkspaceOperationSource = 'api'
  ): WorkspaceResult {
    if (this.host.isDisposed()) return fail('disposed');
    const tab = this.find(id);
    if (!tab) return fail('missing');
    const {id: _id, paneId: _paneId, ...safe} = patch as Partial<WorkspaceTab>;
    this.state.value = this.group(
      this.state.value.map((t) =>
        t.id === id ? this.normalize({...t, ...safe}, t.paneId) : t
      )
    );
    this.invalidate();
    this.emit('update', tab.paneId, [id], source);
    return success(undefined);
  }

  /** Selects a current tab and focuses its containing pane. */
  activateTab(
    id: string,
    source: WorkspaceOperationSource = 'api'
  ): WorkspaceResult {
    if (this.host.isDisposed()) return fail('disposed');
    const tab = this.find(id);
    if (!tab) return fail('missing');
    this.active[tab.paneId] = id;
    this.host.activePane.value = tab.paneId;
    this.emit('activate', tab.paneId, [id], source);
    return success(undefined);
  }

  /** Checks user creation policy and safe conversion of an empty plain pane. */
  canCreateTab(paneId = this.host.activePane.value) {
    const blank =
      this.host.panes.value.length === 1 &&
      !this.state.value.length &&
      this.host.canConvert(paneId);
    return (
      !this.host.isDisposed() &&
      this.hasPane(paneId) &&
      (this.host.paneMode(paneId) === 'tabs' || blank) &&
      !!this.host.tabOptions(paneId).allowCreate
    );
  }

  /** Checks pin, closability, and last-tab policy before offering a close action. */
  canCloseTab(id: string) {
    const t = this.find(id);
    return (
      !this.host.isDisposed() &&
      !!t &&
      !!this.host.tabOptions(t.paneId).allowClose &&
      !t.pinned &&
      t.closable !== false &&
      (this.host.tabOptions(t.paneId).lastTab === 'allow-empty' ||
        this.state.value.filter((x) => x.paneId === t.paneId).length > 1)
    );
  }

  /** Runs the optional host factory and commits only against its starting revision. */
  async requestTab(
    paneId = this.host.activePane.value,
    source: WorkspaceOperationSource = 'api'
  ): Promise<WorkspaceResult<string>> {
    if (this.host.isDisposed()) return fail('disposed');
    if (!this.canCreateTab(paneId))
      return fail(this.hasPane(paneId) ? 'disabled' : 'missing');
    const controller = new AbortController();
    this.pending.add(controller);
    const before = this.revision;
    const factory = this.host.tabOptions(paneId).create;
    try {
      let definition: WorkspaceTabDefinition | undefined;
      if (factory)
        definition = await abortable(
          factory({paneId, source, tabIds: [], signal: controller.signal}),
          controller.signal
        );
      else {
        let id: string;
        do {
          id = `tab-${++this.nextId}`;
        } while (this.find(id));
        definition = {id, title: 'New tab', icon: 'file'};
      }
      if (this.host.isDisposed()) return fail('disposed');
      if (
        controller.signal.aborted ||
        this.revision !== before ||
        !this.hasPane(paneId)
      )
        return fail('stale');
      if (!this.canCreateTab(paneId)) return fail('disabled');
      if (!definition) return fail('cancelled');
      if (!definition.id || this.find(definition.id)) return fail('conflict');
      const conversion = this.host.setPaneMode(paneId, 'tabs');
      if (!conversion.ok) return conversion;
      this.registerTab(paneId, definition, source);
      this.emit('activate', paneId, [definition.id], source);
      return success(definition.id);
    } catch {
      return fail(
        this.host.isDisposed()
          ? 'disposed'
          : controller.signal.aborted
            ? 'stale'
            : 'cancelled'
      );
    } finally {
      this.pending.delete(controller);
    }
  }

  /** Updates pin state through the immutable tab update path. */
  setTabPinned(
    id: string,
    pinned: boolean,
    source: WorkspaceOperationSource = 'api'
  ): WorkspaceResult {
    const result = this.updateTab(id, {pinned}, source);
    const tab = this.find(id);
    if (result.ok && tab) this.emit('pin', tab.paneId, [id], source);
    return result;
  }

  /** Checks source and destination policies and safe destination conversion. */
  canMoveTab(id: string, destinationPaneId: string) {
    const tab = this.find(id);
    return (
      !this.host.isDisposed() &&
      !!tab &&
      !!this.host.tabOptions(tab.paneId).allowMove &&
      !!this.host.tabOptions(destinationPaneId).allowMove &&
      tab.movable !== false &&
      this.hasPane(destinationPaneId) &&
      (this.host.paneMode(destinationPaneId) === 'tabs' ||
        this.host.canConvert(destinationPaneId))
    );
  }

  /** Transfers or reorders an existing tab while retaining registration identity. */
  moveTab(
    id: string,
    destinationPaneId: string,
    index?: number,
    source: WorkspaceOperationSource = 'api'
  ): WorkspaceResult {
    if (this.host.isDisposed()) return fail('disposed');
    const tab = this.find(id);
    if (!tab || !this.hasPane(destinationPaneId)) return fail('missing');
    if (!this.canMoveTab(id, destinationPaneId)) return fail('disabled');
    const local = this.state.value.filter(
      (t) => t.paneId === destinationPaneId && t.id !== id
    );
    const at = index ?? local.length;
    if (!Number.isInteger(at) || at < 0 || at > local.length)
      return fail('invalid');
    const conversion = this.host.setPaneMode(destinationPaneId, 'tabs');
    if (!conversion.ok) return conversion;
    if (tab.paneId !== destinationPaneId) this.fallback(tab.paneId, [id]);
    local.splice(at, 0, this.normalize(tab, destinationPaneId));
    this.state.value = this.group([
      ...this.state.value.filter(
        (t) => t.id !== id && t.paneId !== destinationPaneId
      ),
      ...local,
    ]);
    this.active[destinationPaneId] = id;
    this.host.activePane.value = destinationPaneId;
    this.invalidate();
    this.emit('move', tab.paneId, [id], source, destinationPaneId);
    return success(undefined);
  }

  /** Creates a permitted destination pane and rolls it back if transfer fails. */
  moveTabToNewPane(
    id: string,
    direction: WorkspaceSplitDirection,
    source: WorkspaceOperationSource = 'api'
  ): WorkspaceResult<string> {
    if (this.host.isDisposed()) return fail('disposed');
    const tab = this.find(id);
    if (!tab) return fail('missing');
    if (
      !this.host.tabOptions(tab.paneId).allowMove ||
      tab.movable === false ||
      !this.host.options.allowPaneCreation
    )
      return fail('disabled');
    if (!this.host.canSplit(tab.paneId)) return fail('limit');
    if (!['left', 'right', 'up', 'down'].includes(direction))
      return fail('invalid');
    const paneId = this.host.split(direction, tab.paneId);
    const moved = this.moveTab(id, paneId, undefined, source);
    if (!moved.ok) {
      this.host.removePane(paneId);
      return moved;
    }
    return success(paneId);
  }

  /** Closes pane tabs through shared guards before collapsing the pane branch. */
  async requestClosePane(
    id = this.host.activePane.value,
    source: WorkspaceOperationSource = 'api'
  ): Promise<WorkspaceResult> {
    if (this.host.isDisposed()) return fail('disposed');
    if (!this.hasPane(id)) return fail('missing');
    if (this.host.panes.value.length === 1) return fail('disabled');
    const ids = this.state.value
      .filter((t) => t.paneId === id)
      .map((t) => t.id);
    // Do not yield for an empty pane; otherwise another operation could populate it.
    if (ids.length) return this.guardedClose(ids, source, true);
    if (this.state.value.some((t) => t.paneId === id)) return fail('stale');
    if (!this.host.removePane(id)) return fail('stale');
    delete this.active[id];
    this.emit('pane', id, ids, source);
    return success(undefined);
  }

  /** Cancels pending work and restores the initial workspace presentation. */
  reset() {
    this.invalidate();
    this.state.value = [];
    this.registrations.clear();
    for (const id of Object.keys(this.active)) delete this.active[id];
    this.emit('reset', this.host.activePane.value, []);
  }

  /** Cancels owned operations and releases registrations without disposing host services. */
  dispose() {
    this.reset();
    this.listeners.clear();
    this.pending.clear();
  }

  /** Registers a change listener and returns idempotent callback cleanup. */
  onDidChange(listener: (event: WorkspaceChangeEvent) => void) {
    if (this.host.isDisposed()) return () => {};
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Creates a revision-scoped payload for a currently movable tab. */
  tabDragData(id: string) {
    const tab = this.find(id);
    if (tab && this.canMoveTab(id, tab.paneId)) this.dragId.value = id;
    return tab && this.canMoveTab(id, tab.paneId)
      ? JSON.stringify({id, revision: this.revision})
      : undefined;
  }

  /** Validates a drag payload against current revision, identity, and move permissions. */
  readTabDrag(payload: string) {
    try {
      const data: unknown = JSON.parse(payload);
      if (
        !data ||
        typeof data !== 'object' ||
        !('id' in data) ||
        !('revision' in data) ||
        typeof data.id !== 'string' ||
        data.revision !== this.revision
      )
        return;
      const tab = this.find(data.id);
      return tab && this.canMoveTab(tab.id, tab.paneId) ? tab.id : undefined;
    } catch {
      return;
    }
  }

  /** Clears the active drag preview without moving or closing any tab. */
  endTabDrag() {
    this.dragId.value = undefined;
  }

  /** Registers host-owned tab content and returns identity-safe unregister cleanup. */
  registerTab(
    paneId: string,
    definition: WorkspaceTabDefinition,
    source: WorkspaceOperationSource = 'api'
  ) {
    if (this.host.isDisposed()) throw new Error('Workspace disposed');
    if (!this.hasPane(paneId) || this.host.paneMode(paneId) !== 'tabs')
      throw new Error('Tab registration requires a tabbed pane');
    if (!definition.id || this.find(definition.id))
      throw new Error('Workspace tab id must be unique and nonempty');
    const value = this.normalize(definition, paneId);
    this.registrations.set(value.id, value);
    this.state.value = this.group([...this.state.value, value]);
    this.active[paneId] = value.id;
    this.invalidate();
    this.emit('register', paneId, [value.id], source);
    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      const current = this.find(value.id);
      if (
        current === value ||
        (current &&
          current.id === value.id &&
          this.registrations.get(value.id) === value)
      ) {
        this.remove([value.id]);
        this.registrations.delete(value.id);
        this.emit('close', current.paneId, [value.id]);
      }
    };
  }

  /** Checks pane identity against the current workspace projection. */
  private hasPane(id: string) {
    return this.host.panes.value.some((p) => p.id === id);
  }

  /** Looks up a current immutable tab snapshot by ID. */
  private find(id: string) {
    return this.state.value.find((t) => t.id === id);
  }

  /** Requests one shared unsaved-changes confirmation and resolves false on cancellation. */
  private confirmDirty(
    tabs: readonly WorkspaceTab[],
    signal: AbortSignal
  ): Promise<boolean> {
    if (this.pendingConfirmation.value || signal.aborted)
      return Promise.resolve(false);
    return new Promise((resolve) => {
      let settled = false;
      const respond = (discard: boolean) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener('abort', abort);
        if (this.pendingConfirmation.value?.respond === respond)
          this.pendingConfirmation.value = undefined;
        resolve(discard);
      };
      const abort = () => respond(false);
      signal.addEventListener('abort', abort, {once: true});
      this.pendingConfirmation.value = {tabs, respond};
    });
  }

  /** Delivers committed workspace changes while isolating listener failures. */
  private emit(
    type: WorkspaceChangeEvent['type'],
    paneId: string,
    tabIds: readonly string[],
    source: WorkspaceOperationSource = 'api',
    destinationPaneId?: string
  ) {
    for (const listener of [...this.listeners]) {
      try {
        listener({type, paneId, tabIds, source, destinationPaneId});
      } catch (error) {
        console.error('Workspace change listener failed', error);
      }
    }
  }

  /** Creates a frozen tab snapshot while retaining raw Vue component identity. */
  private normalize(tab: WorkspaceTabDefinition, paneId: string): WorkspaceTab {
    return Object.freeze({
      ...tab,
      paneId,
      component: tab.component ? markRaw(tab.component) : undefined,
      icon: typeof tab.icon === 'object' ? markRaw(tab.icon) : tab.icon,
    });
  }

  /** Orders snapshots by pane and keeps pinned tabs before ordinary tabs. */
  private group(list: readonly WorkspaceTab[]) {
    return this.host.panes.value.flatMap((p) => {
      const local = list.filter((t) => t.paneId === p.id);
      return [
        ...local.filter((t) => t.pinned),
        ...local.filter((t) => !t.pinned),
      ];
    });
  }

  /** Chooses a surviving neighbor when selected tabs are removed or transferred. */
  private fallback(paneId: string, removed: readonly string[]) {
    const local = this.state.value.filter((t) => t.paneId === paneId);
    const index = local.findIndex((t) => t.id === this.active[paneId]);
    if (this.active[paneId] && !removed.includes(this.active[paneId]!)) return;
    this.active[paneId] =
      local.slice(index + 1).find((t) => !removed.includes(t.id))?.id ??
      local
        .slice(0, Math.max(0, index))
        .reverse()
        .find((t) => !removed.includes(t.id))?.id;
  }

  /** Removes tab snapshots and repairs affected selections before invalidating operations. */
  private remove(ids: readonly string[]) {
    for (const pane of this.host.panes.value) this.fallback(pane.id, ids);
    this.state.value = this.state.value.filter((t) => !ids.includes(t.id));
    this.invalidate();
  }

  /** Validates a complete close set, awaits confirmations and guards, and commits atomically. */
  private async guardedClose(
    ids: readonly string[],
    source: WorkspaceOperationSource,
    paneClosure = false
  ): Promise<WorkspaceResult> {
    if (this.host.isDisposed()) return fail('disposed');
    const unique = [...new Set(ids)];
    if (!unique.length) return success(undefined);
    const candidates = unique.map(this.find);
    if (candidates.some((t) => !t)) return fail('missing');
    if (
      candidates.some(
        (t) =>
          !this.host.tabOptions(t!.paneId).allowClose ||
          t!.pinned ||
          t!.closable === false
      )
    )
      return fail('disabled');
    if (unique.some((id) => this.closing.has(id))) return fail('conflict');
    if (
      !paneClosure &&
      this.host.panes.value.some((p) => {
        if (this.host.tabOptions(p.id).lastTab === 'allow-empty') return false;
        const local = this.state.value.filter((t) => t.paneId === p.id);
        return local.length > 0 && local.every((t) => unique.includes(t.id));
      })
    )
      return fail('disabled');
    const controller = new AbortController();
    this.pending.add(controller);
    unique.forEach((id) => this.closing.add(id));
    const before = this.revision;
    try {
      for (const paneId of new Set(candidates.map((t) => t!.paneId))) {
        const dirty = candidates.filter(
          (tab): tab is WorkspaceTab =>
            !!tab &&
            tab.paneId === paneId &&
            !!tab.dirty &&
            !!this.host.tabOptions(paneId).trackChanges
        );
        if (
          dirty.length &&
          !(await this.confirmDirty(dirty, controller.signal))
        )
          return fail(controller.signal.aborted ? 'stale' : 'cancelled');
        if (controller.signal.aborted || this.revision !== before)
          return fail('stale');
        const guard = this.host.tabOptions(paneId).beforeClose;
        if (!guard) continue;
        if (
          !(await abortable(
            guard({
              paneId,
              source,
              tabIds: unique.filter((id) => this.find(id)?.paneId === paneId),
              signal: controller.signal,
            }),
            controller.signal
          ))
        )
          return fail('cancelled');
        if (controller.signal.aborted || this.revision !== before)
          return fail('stale');
      }
      if (this.host.isDisposed()) return fail('disposed');
      if (this.revision !== before || controller.signal.aborted)
        return fail('stale');
      if (candidates.some((t) => !this.host.tabOptions(t!.paneId).allowClose))
        return fail('disabled');
      const paneId = candidates[0]!.paneId;
      if (
        paneClosure &&
        (!this.hasPane(paneId) || this.host.panes.value.length === 1)
      )
        return fail('stale');
      this.remove(unique);
      if (paneClosure) {
        this.host.removePane(paneId);
        delete this.active[paneId];
      } else
        for (const id of new Set(candidates.map((t) => t!.paneId))) {
          if (this.state.value.some((t) => t.paneId === id)) continue;
          if (this.host.panes.value.length > 1) {
            this.host.removePane(id);
            delete this.active[id];
          } else this.host.setPaneMode(id, 'plain');
        }
      unique.forEach((id) => this.registrations.delete(id));
      this.emit('close', paneId, unique, source);
      if (paneClosure) this.emit('pane', paneId, unique, source);
      return success(undefined);
    } catch {
      return fail(
        this.host.isDisposed()
          ? 'disposed'
          : controller.signal.aborted
            ? 'stale'
            : 'cancelled'
      );
    } finally {
      this.pending.delete(controller);
      unique.forEach((id) => this.closing.delete(id));
    }
  }
}
