import type {
  ComputedRef,
  DeepReadonly,
  Ref,
  ShallowReactive,
  ShallowRef,
} from 'vue';
import {computed, markRaw, ref, shallowReactive, shallowRef} from 'vue';
import type {WorkspaceNode, WorkspacePane, WorkspacePaneContent, WorkspaceSplitDirection} from './workspaceTypes';
import {clamp} from '../layout/layout';
import {reactive, readonly} from 'vue';
import type {
  WorkspaceCloseConfirmation,
  WorkspaceChangeEvent,
  WorkspaceTab,
  WorkspaceTabDefinition,
  WorkspaceOperationSource,
  WorkspaceOptions,
  WorkspacePaneMode,
  WorkspaceResult,
  WorkspaceTabOptions,
} from './workspaceTypes';
import {WorkspaceTabs} from './workspaceTabs';

/**
 * Owns pane registrations and split geometry for one Frame instance.
 * A dedicated WorkspaceTabs instance coordinates tabs through explicit pane
 * services, preserving content identity during splits, moves, and navigation.
 */
export class Workspace {

  /** Per-instance drag format preventing tab transfers between unrelated workspaces. */
  readonly dragMime: string;

  /** Validated reactive pane and tab policies used by every operation. */
  private readonly configuration: WorkspaceOptions;

  /** Whether the workspace has released its registrations and pending operations. */
  private disposed: boolean;

  /** Cancels pending tab operations when workspace policies change. */
  private invalidatePending: () => void;

  /** Pane presentation modes keyed by current pane identity. */
  private readonly modes: Record<string, WorkspacePaneMode>;

  /** Content registration tokens preventing conversion of application-owned plain panes. */
  private readonly owners: ShallowReactive<Map<string, Set<symbol>>>;

  /** Pane-local tab overrides combined with global permissions. */
  private readonly paneOptions: Record<string, WorkspaceTabOptions>;

  /** Identity of the original shell-slot pane, retained across workspace resets. */
  readonly initialPaneId: 'pane-1';

  /** Monotonic identity suffix avoiding collisions with existing pane or tab registrations. */
  private nextId: number;

  /** Reactive split tree describing geometry independently of content registrations. */
  readonly root: ShallowRef<WorkspaceNode, WorkspaceNode>;

  /** Current pane targeted by workspace commands and keyboard actions. */
  readonly activePane: Ref<string, string>;

  /** Pane content registrations independent of the split-tree structure. */
  private readonly registry: ShallowReactive<Map<string, WorkspacePane>>;

  /** Reactive projection of current pane registrations. */
  readonly panes: ComputedRef<WorkspacePane[]>;

  /** Owns tab registration and async guards behind the public delegation methods. */
  private readonly tabController: WorkspaceTabs;

  /** Reactive confirmation request displayed by the shell. */
  readonly closeConfirmation: ComputedRef<
    WorkspaceCloseConfirmation | undefined
  >;

  /** Readonly projection of current immutable tab snapshots. */
  readonly tabs: ComputedRef<readonly WorkspaceTab[]>;

  /** Readonly reactive pane-to-tab selection mapping. */
  readonly activeTabs: ComputedRef<{readonly [x: string]: string | undefined}>;

  /** Reactive identity of the current tab drag, cleared on invalidation. */
  readonly draggedTab: ComputedRef<string | undefined>;

  /** Validated reactive pane and tab policies used by every operation. */
  readonly options: DeepReadonly<WorkspaceOptions>;

  /** Initializes isolated workspace state and binds callbacks used by shell services. */
  constructor(initialOptions: WorkspaceOptions = {}) {
    this.tabOptions = this.tabOptions.bind(this);
    this.configurePaneTabs = this.configurePaneTabs.bind(this);
    this.configure = this.configure.bind(this);
    this.paneMode = this.paneMode.bind(this);
    this.registerPaneContent = this.registerPaneContent.bind(this);
    this.canConvert = this.canConvert.bind(this);
    this.canOpenTab = this.canOpenTab.bind(this);
    this.setPaneMode = this.setPaneMode.bind(this);
    this.canSplit = this.canSplit.bind(this);
    this.replace = this.replace.bind(this);
    this.setPane = this.setPane.bind(this);
    this.split = this.split.bind(this);
    this.close = this.close.bind(this);
    this.removePane = this.removePane.bind(this);
    this.resize = this.resize.bind(this);
    this.focus = this.focus.bind(this);
    this.reset = this.reset.bind(this);
    this.dispose = this.dispose.bind(this);
    this.confirmUnsavedChanges = this.confirmUnsavedChanges.bind(this);
    this.endTabDrag = this.endTabDrag.bind(this);
    this.registerTab = this.registerTab.bind(this);
    this.updateTab = this.updateTab.bind(this);
    this.activateTab = this.activateTab.bind(this);
    this.requestTab = this.requestTab.bind(this);
    this.closeTabs = this.closeTabs.bind(this);
    this.setTabPinned = this.setTabPinned.bind(this);
    this.moveTab = this.moveTab.bind(this);
    this.moveTabToNewPane = this.moveTabToNewPane.bind(this);
    this.requestClosePane = this.requestClosePane.bind(this);
    this.canCreateTab = this.canCreateTab.bind(this);
    this.canCloseTab = this.canCloseTab.bind(this);
    this.canMoveTab = this.canMoveTab.bind(this);
    this.onDidChange = this.onDidChange.bind(this);
    this.tabDragData = this.tabDragData.bind(this);
    this.readTabDrag = this.readTabDrag.bind(this);
    this.invalidate = this.invalidate.bind(this);

    this.dragMime = `application/x-frame-tab-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    this.configuration = reactive<WorkspaceOptions>({
      allowPaneCreation: true,
      maxPanes: 20,
      newPaneMode: 'plain',
      tabs: {
        allowCreate: false,
        allowClose: false,
        allowMove: false,
        lastTab: 'keep-one',
        showIcons: true,
        showTitles: true,
        showClose: true,
      },
    });
    this.disposed = false;
    this.invalidatePending = () => {};
    this.modes = reactive<Record<string, WorkspacePaneMode>>({
      'pane-1': 'plain',
    });
    this.owners = shallowReactive(new Map<string, Set<symbol>>());
    this.paneOptions = reactive<Record<string, WorkspaceTabOptions>>({});
    this.configure(initialOptions);
    this.initialPaneId = 'pane-1';
    this.nextId = 1;
    this.root = shallowRef<WorkspaceNode>({
      type: 'pane',
      id: this.initialPaneId,
    });
    this.activePane = ref(this.initialPaneId);
    this.registry = shallowReactive(
      new Map<string, WorkspacePane>([
        [this.initialPaneId, {id: this.initialPaneId, label: 'Workspace'}],
      ])
    );
    this.panes = computed(() => [...this.registry.values()]);
    this.tabController = new WorkspaceTabs({
      options: this.configuration,
      tabOptions: this.tabOptions,
      panes: this.panes,
      activePane: this.activePane,
      paneMode: this.paneMode,
      setPaneMode: this.setPaneMode,
      canConvert: this.canConvert,
      canSplit: this.canSplit,
      split: this.split,
      removePane: this.removePane,
      isDisposed: () => this.disposed,
    });
    this.invalidatePending = this.tabController.invalidate;
    this.closeConfirmation = this.tabController.closeConfirmation;
    this.tabs = this.tabController.tabs;
    this.activeTabs = this.tabController.activeTabs;
    this.draggedTab = this.tabController.draggedTab;
    this.options = readonly(this.configuration);
  }

  /** Reads effective pane-local tab policy without bypassing global permissions. */
  tabOptions(id: string): Readonly<WorkspaceTabOptions> {
    const global = this.configuration.tabs!;
    const local = this.paneOptions[id];
    return {
      ...global,
      ...local,
      allowCreate: !!global.allowCreate && local?.allowCreate !== false,
      allowClose: !!global.allowClose && local?.allowClose !== false,
      allowMove: !!global.allowMove && local?.allowMove !== false,
    };
  }

  /** Validates pane-local policy changes and invalidates pending tab operations. */
  configurePaneTabs(id: string, patch: WorkspaceTabOptions): WorkspaceResult {
    if (this.disposed) return {ok: false, reason: 'disposed'};
    if (!this.registry.has(id)) return {ok: false, reason: 'missing'};
    if (
      patch.lastTab !== undefined &&
      !['keep-one', 'allow-empty'].includes(patch.lastTab)
    )
      return {ok: false, reason: 'invalid'};
    if (
      patch.display !== undefined &&
      !['icons', 'text', 'both'].includes(patch.display)
    )
      return {ok: false, reason: 'invalid'};
    this.paneOptions[id] = {...this.paneOptions[id], ...patch};
    this.invalidatePending();
    return {ok: true, value: undefined};
  }

  /** Validates and applies workspace policy changes without replacing pane content. */
  configure(patch: Partial<WorkspaceOptions>) {
    if (this.disposed) throw new Error('Workspace disposed');
    const max = patch.maxPanes ?? this.configuration.maxPanes!;
    if (!Number.isInteger(max) || max < 1 || max > 20)
      throw new Error('maxPanes must be an integer from 1 through 20');
    if (
      patch.newPaneMode !== undefined &&
      !['plain', 'tabs'].includes(patch.newPaneMode)
    )
      throw new Error('Invalid pane mode');
    if (
      patch.tabs?.lastTab !== undefined &&
      !['keep-one', 'allow-empty'].includes(patch.tabs.lastTab)
    )
      throw new Error('Invalid last-tab policy');
    if (
      patch.tabs?.display !== undefined &&
      !['icons', 'text', 'both'].includes(patch.tabs.display)
    )
      throw new Error('Invalid tab display');
    Object.assign(this.configuration, {
      ...patch,
      maxPanes: max,
      allowPaneCreation:
        patch.allowPaneCreation ?? this.configuration.allowPaneCreation,
      newPaneMode: patch.newPaneMode ?? this.configuration.newPaneMode,
      tabs: {...this.configuration.tabs, ...patch.tabs},
    });
    this.invalidatePending();
  }

  /** Reads the current plain or tabbed presentation mode of a pane. */
  paneMode(id: string) {
    return this.modes[id] ?? 'plain';
  }

  /** Claims plain-pane content and returns registration-specific ownership cleanup. */
  registerPaneContent(id: string) {
    const token = Symbol();
    const set = this.owners.get(id) ?? new Set<symbol>();
    set.add(token);
    this.owners.set(id, set);
    return () => {
      set.delete(token);
      if (!set.size && this.owners.get(id) === set) this.owners.delete(id);
    };
  }

  /** Checks whether a shell-owned tab can open without replacing application content. */
  canOpenTab(id = this.activePane.value) {
    return (
      !this.disposed &&
      this.registry.has(id) &&
      (this.paneMode(id) === 'tabs' || this.canConvert(id))
    );
  }

  /** Changes pane presentation only when content ownership and tab state permit conversion. */
  setPaneMode(id: string, mode: WorkspacePaneMode): WorkspaceResult {
    if (this.disposed) return {ok: false, reason: 'disposed'};
    if (!this.registry.has(id)) return {ok: false, reason: 'missing'};
    if (mode !== 'plain' && mode !== 'tabs')
      return {ok: false, reason: 'invalid'};
    if (this.paneMode(id) === mode) return {ok: true, value: undefined};
    if (
      (mode === 'tabs' && !this.canConvert(id)) ||
      this.tabController.tabs.value.some((t) => t.paneId === id)
    )
      return {ok: false, reason: 'conflict'};
    this.modes[id] = mode;
    this.tabController.invalidate();
    return {ok: true, value: undefined};
  }

  /** Checks pane existence, creation permission, and the configured pane limit. */
  canSplit(target = this.activePane.value) {
    return (
      !this.disposed &&
      !!this.configuration.allowPaneCreation &&
      this.registry.has(target) &&
      this.registry.size < this.configuration.maxPanes!
    );
  }

  /** Replaces the registered content of an existing plain pane. */
  setPane(id: string, content: WorkspacePaneContent) {
    if (this.disposed || this.paneMode(id) === 'tabs')
      throw new Error('Cannot replace tabbed or disposed pane content');
    if (!this.registry.has(id))
      throw new Error(`Unknown workspace pane: ${id}`);
    this.registry.set(id, {
      ...content,
      id,
      component: content.component ? markRaw(content.component) : undefined,
    });
  }

  /** Creates a pane and inserts a split node without replacing surviving pane content. */
  split(
    direction: WorkspaceSplitDirection = 'right',
    target = this.activePane.value,
    content?: WorkspacePaneContent
  ) {
    if (!this.registry.has(target))
      throw new Error(`Unknown workspace pane: ${target}`);
    if (!this.canSplit(target))
      throw new Error('Workspace pane creation disabled or maximum reached');
    if (!['left', 'right', 'up', 'down'].includes(direction))
      throw new Error('Invalid split direction');
    const id = `pane-${++this.nextId}`;
    this.registry.set(id, {
      id,
      label: content?.label ?? `Pane ${this.nextId}`,
      ...content,
      component: content?.component ? markRaw(content.component) : undefined,
    });
    this.modes[id] = content ? 'plain' : this.configuration.newPaneMode!;
    const previous: WorkspaceNode = {type: 'pane', id: target};
    const added: WorkspaceNode = {type: 'pane', id};
    const leading = direction === 'left' || direction === 'up';
    this.root.value = this.replace(this.root.value, target, {
      type: 'split',
      id: `split-${this.nextId}`,
      axis: direction === 'left' || direction === 'right' ? 'x' : 'y',
      ratio: 0.5,
      first: leading ? added : previous,
      second: leading ? previous : added,
    });
    this.activePane.value = id;
    return id;
  }

  /** Closes an empty pane while retaining the final workspace pane. */
  close(id = this.activePane.value) {
    if (this.tabController.tabs.value.some((t) => t.paneId === id))
      return false;
    return this.removePane(id);
  }

  /** Updates a split ratio within supported bounds while retaining registered content. */
  resize(id: string, ratio: number) {
    function update(node: WorkspaceNode): WorkspaceNode {
      if (node.type === 'pane') return node;
      if (node.id === id) return {...node, ratio: clamp(ratio, 0.1, 0.9)};
      return {...node, first: update(node.first), second: update(node.second)};
    }
    this.root.value = update(this.root.value);
  }

  /** Targets a currently registered pane without changing its content. */
  focus(id: string) {
    if (this.registry.has(id)) this.activePane.value = id;
  }

  /** Cancels pending work and restores the initial workspace presentation. */
  reset() {
    if (this.disposed) return;
    this.tabController.reset();
    for (const key of Object.keys(this.paneOptions))
      delete this.paneOptions[key];
    for (const key of Object.keys(this.modes)) delete this.modes[key];
    this.modes[this.initialPaneId] = 'plain';
    this.registry.clear();
    this.registry.set(this.initialPaneId, {
      id: this.initialPaneId,
      label: 'Workspace',
    });
    this.root.value = {type: 'pane', id: this.initialPaneId};
    this.activePane.value = this.initialPaneId;
  }

  /** Cancels owned operations and releases registrations without disposing host services. */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.tabController.dispose();
    this.registry.clear();
    this.owners.clear();
  }

  /** Confirms dirty tracked tabs without applying a close operation. */
  confirmUnsavedChanges(ids: readonly string[]): Promise<boolean> {
    return this.tabController.confirmUnsavedChanges(ids);
  }

  /** Clears the active drag preview without moving or closing any tab. */
  endTabDrag(): void {
    return this.tabController.endTabDrag();
  }

  /** Registers host-owned tab content and returns identity-safe unregister cleanup. */
  registerTab(
    paneId: string,
    definition: WorkspaceTabDefinition,
    source?: WorkspaceOperationSource
  ): () => void {
    return this.tabController.registerTab(paneId, definition, source);
  }

  /** Replaces mutable tab metadata while preserving registration ownership. */
  updateTab(
    id: string,
    patch: Partial<Omit<WorkspaceTabDefinition, 'id'>>,
    source?: WorkspaceOperationSource
  ): WorkspaceResult {
    return this.tabController.updateTab(id, patch, source);
  }

  /** Selects a current tab and focuses its containing pane. */
  activateTab(id: string, source?: WorkspaceOperationSource): WorkspaceResult {
    return this.tabController.activateTab(id, source);
  }

  /** Runs the optional host factory and commits only against its starting revision. */
  requestTab(
    paneId?: string,
    source?: WorkspaceOperationSource
  ): Promise<WorkspaceResult<string>> {
    return this.tabController.requestTab(paneId, source);
  }

  /** Requests a guarded close for a set of current tab identities. */
  closeTabs(
    ids: readonly string[],
    source?: WorkspaceOperationSource
  ): Promise<WorkspaceResult> {
    return this.tabController.closeTabs(ids, source);
  }

  /** Updates pin state through the immutable tab update path. */
  setTabPinned(
    id: string,
    pinned: boolean,
    source?: WorkspaceOperationSource
  ): WorkspaceResult {
    return this.tabController.setTabPinned(id, pinned, source);
  }

  /** Transfers or reorders an existing tab while retaining registration identity. */
  moveTab(
    id: string,
    destinationPaneId: string,
    index?: number,
    source?: WorkspaceOperationSource
  ): WorkspaceResult {
    return this.tabController.moveTab(id, destinationPaneId, index, source);
  }

  /** Creates a permitted destination pane and rolls it back if transfer fails. */
  moveTabToNewPane(
    id: string,
    direction: WorkspaceSplitDirection,
    source?: WorkspaceOperationSource
  ): WorkspaceResult<string> {
    return this.tabController.moveTabToNewPane(id, direction, source);
  }

  /** Closes pane tabs through shared guards before collapsing the pane branch. */
  requestClosePane(
    id?: string,
    source?: WorkspaceOperationSource
  ): Promise<WorkspaceResult> {
    return this.tabController.requestClosePane(id, source);
  }

  /** Checks user creation policy and safe conversion of an empty plain pane. */
  canCreateTab(paneId?: string): boolean {
    return this.tabController.canCreateTab(paneId);
  }

  /** Checks pin, closability, and last-tab policy before offering a close action. */
  canCloseTab(id: string): boolean {
    return this.tabController.canCloseTab(id);
  }

  /** Checks source and destination policies and safe destination conversion. */
  canMoveTab(id: string, destinationPaneId: string): boolean {
    return this.tabController.canMoveTab(id, destinationPaneId);
  }

  /** Registers a change listener and returns idempotent callback cleanup. */
  onDidChange(listener: (event: WorkspaceChangeEvent) => void): () => void {
    return this.tabController.onDidChange(listener);
  }

  /** Creates a revision-scoped payload for a currently movable tab. */
  tabDragData(id: string): string | undefined {
    return this.tabController.tabDragData(id);
  }

  /** Validates a drag payload against current revision, identity, and move permissions. */
  readTabDrag(payload: string): string | undefined {
    return this.tabController.readTabDrag(payload);
  }

  /** Advances the operation revision and cancels pending guards and drag payloads. */
  invalidate(): void {
    return this.tabController.invalidate();
  }

  /** Checks that a plain pane has no registered component or mounted application owner. */
  private canConvert(id: string) {
    return (
      this.registry.has(id) &&
      !this.registry.get(id)?.component &&
      !this.owners.get(id)?.size
    );
  }

  /** Rebuilds one split-tree branch while preserving unaffected pane identities. */
  private replace(
    node: WorkspaceNode,
    id: string,
    replacement: WorkspaceNode
  ): WorkspaceNode {
    if (node.id === id) return replacement;
    return node.type === 'pane'
      ? node
      : {
          ...node,
          first: this.replace(node.first, id, replacement),
          second: this.replace(node.second, id, replacement),
        };
  }

  /** Collapses a pane branch, releases its local state, and repairs active-pane selection. */
  private removePane(id: string) {
    if (!this.registry.has(id) || this.registry.size === 1) return false;
    function remove(node: WorkspaceNode): WorkspaceNode | undefined {
      if (node.type === 'pane') return node.id === id ? undefined : node;
      const first = remove(node.first),
        second = remove(node.second);
      if (!first) return second;
      if (!second) return first;
      return {...node, first, second};
    }
    this.root.value = remove(this.root.value)!;
    this.registry.delete(id);
    delete this.modes[id];
    delete this.paneOptions[id];
    this.owners.delete(id);
    this.tabController.invalidate();
    if (this.activePane.value === id) {
      let next = this.root.value;
      while (next.type === 'split') next = next.first;
      this.activePane.value = next.id;
    }
    return true;
  }
}
