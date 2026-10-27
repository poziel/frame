import type {Component} from 'vue';
import type {FrameMenuItem} from '../../components/navigation/generalMenu';

/** Host-owned component content displayed in a plain workspace pane. */
export interface WorkspacePaneContent {

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Host-supplied Vue component rendered for this contribution. */
  component?: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}

/** Plain pane content with a stable workspace identity. */
export interface WorkspacePane extends WorkspacePaneContent {

  /** Stable identity used to address this contribution. */
  id: string;
}

/** Side on which a new pane is inserted relative to the source pane. */
export type WorkspaceSplitDirection = 'left' | 'right' | 'up' | 'down';

/** Recursive workspace layout tree containing pane leaves and resizable split nodes. */
export type WorkspaceNode =
  | {
      /** Kind of control or structural row represented by this definition. */
      type: 'pane';

      /** Stable identity used to address this contribution. */
      id: string;
    }
  | {
      /** Kind of control or structural row represented by this definition. */
      type: 'split';
      /** Stable identity used to address this contribution. */
      id: string;
      axis: 'x' | 'y';
      ratio: number;
      first: WorkspaceNode;
      second: WorkspaceNode;
    };

/** Origin metadata attached to pane and tab operations. */
export type WorkspaceOperationSource =
  | 'api'
  | 'button'
  | 'shortcut'
  | 'middle-click'
  | 'menu'
  | 'drag'
  | 'double-click';

/** Reason an operation could not commit; callers can handle failures without parsing exceptions. */
export type WorkspaceFailure =
  | 'disabled'
  | 'missing'
  | 'limit'
  | 'cancelled'
  | 'stale'
  | 'disposed'
  | 'conflict'
  | 'invalid';

/** A typed result separating committed operations from rejected or stale requests.
 *
 * @typeParam T - Value supplied by a successful operation, such as a new pane ID. */
export type WorkspaceResult<T = void> =
  {ok: true; value: T} | {ok: false; reason: WorkspaceFailure};

/** Presentation mode of a pane, independent of whether it currently contains tabs. */
export type WorkspacePaneMode = 'plain' | 'tabs';

/** Host-owned definition used to register or create a tab. Content components and
 * domain resources remain owned by the application. */
export interface WorkspaceTabDefinition {

  /** Stable tab identity within one workspace instance. */
  id: string;

  /** Label displayed in the tab strip and accessible controls. */
  title: string;

  /** Optional icon name or component retained independently of tab movement. */
  icon?: string | Component;

  /** Application-owned content component whose identity survives pane movement. */
  component?: Component;

  /** Application-owned properties supplied to the tab content component. */
  props?: Record<string, unknown>;

  /** Used when the pane opts into trackChanges. */
  dirty?: boolean;

  /** Keeps this tab in its pane pin group and blocks user close actions. */
  pinned?: boolean;

  /** Per-tab close permission, combined with pane and global close policies. */
  closable?: boolean;

  /** Per-tab move permission, combined with both source and destination policies. */
  movable?: boolean;

  /** Optional per-tab override for icon presentation. */
  showIcon?: boolean;

  /** Optional per-tab override for title presentation. */
  showTitle?: boolean;

  /** Optional per-tab override for the close control. */
  showClose?: boolean;
}

/** Immutable tab snapshot with its current containing pane. Moving or updating a
 * tab creates a new snapshot while preserving its registration ownership. */
export interface WorkspaceTab extends Readonly<WorkspaceTabDefinition> {

  /** Pane currently containing this immutable tab snapshot. */
  readonly paneId: string;
}

/** Context supplied to host factories and guards. The signal must be observed for
 * cancellation; Frame also rejects late results from stale operations. */
export interface WorkspaceOperationContext {

  /** Origin of the operation, shared with guards and change listeners. */
  source: WorkspaceOperationSource;

  /** Pane currently containing this immutable tab snapshot. */
  paneId: string;

  /** Tab identities affected by the operation or committed change. */
  tabIds: readonly string[];

  /** Cancellation signal invalidated when the operation becomes stale or disposed. */
  signal: AbortSignal;
}

/** Committed workspace change delivered after the corresponding state mutation. */
export interface WorkspaceChangeEvent {

  /** Committed change kind used by host listeners. */
  type:
    | 'register'
    | 'update'
    | 'activate'
    | 'close'
    | 'pin'
    | 'move'
    | 'reset'
    | 'pane';

  /** Origin of the operation, shared with guards and change listeners. */
  source: WorkspaceOperationSource;

  /** Pane currently containing this immutable tab snapshot. */
  paneId: string;

  /** Tab identities affected by the operation or committed change. */
  tabIds: readonly string[];

  /** Destination pane for a committed tab transfer. */
  destinationPaneId?: string;
}

/** One pending unsaved-change decision owned by Frame and resolved by the shell. */
export interface WorkspaceCloseConfirmation {

  /** Immutable tab snapshots shown in a shared dirty-close confirmation. */
  readonly tabs: readonly WorkspaceTab[];

  /** Completes the active confirmation; false preserves the unsaved tabs. */
  respond(discard: boolean): void;
}

/** Global or pane-local tab policies and host integration callbacks. */
export interface WorkspaceTabOptions {

  /** Enable dirty indicators and Frame's unsaved-close dialog. Default false. */
  trackChanges?: boolean;

  /** Show the strip for a single tab. Default false. */
  showSingleTab?: boolean;

  /** Pane-local icon and text display mode. */
  display?: 'icons' | 'text' | 'both';

  /** Whether user actions may create tabs; host registration remains independent. */
  allowCreate?: boolean;

  /** Whether user actions may close tabs, subject to individual tab restrictions. */
  allowClose?: boolean;

  /** Whether tabs may move out of or into this pane. */
  allowMove?: boolean;

  /** Whether closing the final eligible tab is allowed or must retain one tab. */
  lastTab?: 'keep-one' | 'allow-empty';

  /** Default icon visibility for the tab strip. */
  showIcons?: boolean;

  /** Default title visibility for the tab strip. */
  showTitles?: boolean;

  /** Optional per-tab override for the close control. */
  showClose?: boolean;

  /** Optional host factory whose result commits only if its operation is still current. */
  create?: (context: WorkspaceOperationContext) =>
    | WorkspaceTabDefinition
    | undefined
    | Promise<WorkspaceTabDefinition | undefined>;

  /** Optional host guard run after unsaved-change confirmation and before committing. */
  beforeClose?: (
    context: WorkspaceOperationContext
  ) => boolean | Promise<boolean>;

  /** Optional host customization of current context-menu entries. */
  contextMenu?: (
    context: {paneId: string; tabId: string},
    defaults: readonly FrameMenuItem[]
  ) => readonly FrameMenuItem[];
}

/** Pane creation defaults and global tab policies for one workspace instance. */
export interface WorkspaceOptions {

  /** Whether users and workspace APIs may create split panes. */
  allowPaneCreation?: boolean;

  /** Commands offered beneath the shared Frame welcome logo. */
  welcome?: {commands: readonly string[]};

  /** Maximum simultaneous panes; validated as an integer from one through twenty. */
  maxPanes?: number;

  /** Default presentation mode for new panes without supplied plain content. */
  newPaneMode?: WorkspacePaneMode;

  /** Immutable tab snapshots shown in a shared dirty-close confirmation. */
  tabs?: WorkspaceTabOptions;
}
