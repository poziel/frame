import type {Workspace} from '../workspace/workspace';
import type {FeatureRegistry} from '../features/featureRegistry';
import type {WorkspacePane} from '../workspace/workspaceTypes';
import type {WorkspacePaneContent} from '../workspace/workspaceTypes';
import type {WatchHandle} from 'vue';
import type {
  WorkspaceOperationSource,
  WorkspaceResult,
} from '../workspace/workspaceTypes';
import {effectScope, watch} from 'vue';
import {Navigation} from './navigation';
import type {FrameOptions} from '../frame';
import type {ViewRegistry} from './viewRegistry';
import type {ShellLayout} from '../layout/shellLayout';

/** Snapshot retained by Frame's navigation history, independent of presentation instances. */
export interface FrameNavigationLocation {

  /** Retained pane definitions used when restoring plain workspace content. */
  panes: WorkspacePane[];

  /** Focused workspace pane identifier. */
  active: string;

  /** Active tab identifier for each workspace pane. */
  activeTabs: Record<string, string | undefined>;

  /** Selected primary sidebar view. */
  primary: string;

  /** Selected secondary sidebar view. */
  secondary: string;

  /** Selected panel view. */
  bottom: string;

  /** Primary sidebar visibility at capture time. */
  primaryVisible: boolean;

  /** Secondary sidebar visibility at capture time. */
  secondaryVisible: boolean;

  /** Panel visibility at capture time. */
  bottomVisible: boolean;

  /** Retained collapse preferences for registered view sections. */
  collapsed: Record<string, boolean>;
}

/** Narrow dependencies connected by the owning Frame instance. */
export interface ShellNavigationServices {

  /** Initial configuration shared by the owning service constructors. */
  readonly options: FrameOptions;

  /** Feature availability shared by shell presentation and execution guards. */
  readonly features: FeatureRegistry;

  /** Workspace panes, tabs, focus, and content registration. */
  readonly workspace: Workspace;

  /** Owns registered shell views, hierarchy, visibility, selection, and movement. */
  readonly viewRegistry: ViewRegistry;

  /** Owns feature-gated layout state, Zen restoration, and presentation reset. */
  readonly shellLayout: ShellLayout;
}

/**
 * Connects generic navigation history to workspace and view state.
 * Captured locations preserve content identity and restore selection without undoing pane geometry.
 */
export class ShellNavigation {

  /** Observers belong to this service rather than a caller's temporary scope. */
  private readonly scope = effectScope(true);

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: ShellNavigationServices;

  /** History capture and restoration using the existing workspace and views. */
  readonly navigation: Navigation<FrameNavigationLocation>;

  /** Original workspace pane setter used inside navigation restoration. */
  private readonly setPane: (id: string, content: WorkspacePaneContent) => void;

  /** Original tab activation callback captured before history wrapping. */
  private readonly activateWorkspaceTab: (
    id: string,
    source?: WorkspaceOperationSource
  ) => WorkspaceResult;

  /** Resets workspace content through navigation history. */
  readonly resetWorkspace: () => void;

  /** Releases feature-driven navigation history cleanup. */
  private readonly stopNavigationWatch: WatchHandle;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: ShellNavigationServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.captureLocation = this.captureLocation.bind(this);

    this.navigation = new Navigation({
      adapter:
        typeof this.services.options.navigation === 'object'
          ? this.services.options.navigation
          : undefined,
      enabled: () => this.services.features.navigation,
      capture: this.captureLocation,
      equal: (a, b) =>
        a.active === b.active &&
        JSON.stringify(a.activeTabs) === JSON.stringify(b.activeTabs) &&
        a.primary === b.primary &&
        a.secondary === b.secondary &&
        a.bottom === b.bottom &&
        a.primaryVisible === b.primaryVisible &&
        a.secondaryVisible === b.secondaryVisible &&
        a.bottomVisible === b.bottomVisible &&
        a.panes.length === b.panes.length &&
        a.panes.every((pane, i) => {
          const other = b.panes[i];
          return (
            other &&
            pane.id === other.id &&
            pane.component === other.component &&
            pane.label === other.label &&
            Object.keys(pane.props ?? {}).length ===
              Object.keys(other.props ?? {}).length &&
            Object.entries(pane.props ?? {}).every(([key, value]) =>
              Object.is(value, other.props?.[key])
            )
          );
        }) &&
        Object.keys(a.collapsed).every(
          (id) => a.collapsed[id] === b.collapsed[id]
        ),
      restore: (location) => {
        // Navigate content without undoing splits, resizing, or closing panes.
        for (const pane of location.panes)
          if (
            this.services.workspace.panes.value.some(
              (current) => current.id === pane.id
            ) &&
            this.services.workspace.paneMode(pane.id) === 'plain'
          )
            this.setPane(pane.id, pane);
        for (const [paneId, tabId] of Object.entries(location.activeTabs))
          if (
            tabId &&
            this.services.workspace.tabs.value.some(
              (tab) => tab.id === tabId && tab.paneId === paneId
            )
          )
            this.services.workspace.activateTab(tabId);
        this.services.workspace.focus(location.active);
        if (this.services.viewRegistry.sideMap.has(location.primary))
          this.services.viewRegistry.state.activeSidePanel = location.primary;
        if (this.services.viewRegistry.secondaryMap.has(location.secondary))
          this.services.viewRegistry.state.activeSecondaryTab =
            location.secondary;
        if (this.services.viewRegistry.tabMap.has(location.bottom))
          this.services.viewRegistry.state.activeBottomTab = location.bottom;
        this.services.shellLayout.layout.primarySidebarVisible =
          location.primaryVisible;
        this.services.shellLayout.layout.secondarySidebarVisible =
          location.secondaryVisible;
        this.services.shellLayout.layout.panelVisible = location.bottomVisible;
        for (const id of Object.keys(location.collapsed))
          if (this.services.viewRegistry.viewMap.has(id))
            this.services.viewRegistry.menuState.collapsed[id] =
              location.collapsed[id]!;
        this.services.viewRegistry.repairSelections();
      },
    });
    this.setPane = this.services.workspace.setPane;
    this.activateWorkspaceTab = this.services.workspace.activateTab;
    this.resetWorkspace = () =>
      this.navigation.record(this.services.workspace.reset);
    this.stopNavigationWatch = this.scope.run(() =>
      watch(
        () => this.services.features.navigation,
        (enabled) => {
          if (!enabled) this.navigation.clear();
        },
        {flush: 'sync'}
      )
    )!;
    this.services.workspace.activateTab = (id, source) =>
      this.navigation.record(() => this.activateWorkspaceTab(id, source));
    this.services.workspace.setPane = (id, content) =>
      this.navigation.record(() => this.setPane(id, content));
  }

  /** Captures navigation state without duplicating workspace ownership. */
  captureLocation(): FrameNavigationLocation {
    return {
      panes: [...this.services.workspace.panes.value],
      active: this.services.workspace.activePane.value,
      activeTabs: {...this.services.workspace.activeTabs.value},
      primary: this.services.viewRegistry.state.activeSidePanel,
      secondary: this.services.viewRegistry.state.activeSecondaryTab,
      bottom: this.services.viewRegistry.state.activeBottomTab,
      primaryVisible: this.services.shellLayout.layout.primarySidebarVisible,
      secondaryVisible:
        this.services.shellLayout.layout.secondarySidebarVisible,
      bottomVisible: this.services.shellLayout.layout.panelVisible,
      collapsed: {...this.services.viewRegistry.menuState.collapsed},
    };
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.stopNavigationWatch();
    this.navigation.dispose();
    this.scope.stop();
  }
}
