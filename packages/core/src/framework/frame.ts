import {navigateBrowserLink} from './views/navigationItems';
import {isDockAnchorVisible} from './layout/docks';
import {ManageMenu} from './views/manageMenu';
import type {FramePickerRequest} from './commands/quickInputController';
import type {FrameNavigationLocation} from './views/shellNavigation';
import type {WorkspaceBannerDefinition} from './workspace/workspaceBanner';
import type {ActivityEntry} from './configuration/activityLog';
import {PreferenceLauncher} from './preferences/preferenceLauncher';
import {ViewRegistry} from './views/viewRegistry';
import {QuickInputController} from './commands/quickInputController';
import {ShellLayout} from './layout/shellLayout';
import {ResourceCommands} from './commands/resourceCommands';
import {ShellNavigation} from './views/shellNavigation';
import {ToolbarContributions} from './views/toolbarContributions';
import {NavigationCommands} from './commands/navigationCommands';
import {WorkspaceBanner} from './workspace/workspaceBanner';
import {ModalRegistry} from './views/modalRegistry';
import {ActivityLog} from './configuration/activityLog';
import type {StatusOptions} from './views/status';
import type {ModalOptions} from '../components/framework/modal';
import type {WorkspaceOptions} from './workspace/workspaceTypes';
import type {PanelViewBarOptions} from './views/panelViewBar';
import type {NavigationBarOptions} from './views/navigationBar';
import type {PanelOptions} from './views/panel';
import type {SecondaryViewBarOptions} from './views/secondaryViewBar';
import type {ToolbarOptions} from './views/toolbar';
import type {PrimaryViewBarOptions} from './views/primaryViewBar';
import type {NavigationOptions} from './views/navigation';
import type {FrameMenuItem} from '../components/navigation/generalMenu';
import type {CommandOptions as Command} from './commands/command';
import type {
  PanelDefinition,
  SidePanelDefinition,
  ViewRegion,
} from './views/shellViewContainer';
import type {
  QuickPickItem,
  QuickPickOptions,
} from '../components/framework/quickPick';
import type {ToolbarAction} from './views/toolbar';
import type {ModalDefinition} from '../components/framework/modal';
import {FrameThemeController} from '../themes/runtime/frameThemeController';
import type {ComputedRef, ShallowReactive, ShallowRef} from 'vue';
import type {CommandRegistration} from './commands/command';
import {Keybindings} from './keybindings/keybindings';
import {ModuleRegistry, type FrameModule} from './configuration/moduleRegistry';
import {CommandCenter} from './commands/commandCenter';
import {PermissionRegistry} from './permissions/permissions';
import {HostController} from './configuration/host';
import {DockRegistry} from './layout/docks';
import {effectScope, markRaw} from 'vue';
import {PanelViewBar} from './views/panelViewBar';
import {FeatureRegistry} from './features/featureRegistry';
import {ShellPresentation} from './views/shellPresentation';
import {ShellViewContainer} from './views/shellViewContainer';
import {withPresentation} from './views/withPresentation';
import {CommandRegistry} from './commands/commandRegistry';
import {BuiltinCommands} from './commands/builtinCommands';
import {ShellCommandBindings} from './commands/shellCommandBindings';
import {Panel} from './views/panel';
import {SecondaryViewBar} from './views/secondaryViewBar';
import {NavigationBar} from './views/navigationBar';
import type {NavigationItem} from './views/navigationItems';
import {PrimaryViewBar} from './views/primaryViewBar';
import {Toolbar} from './views/toolbar';
import {ToolbarStatus} from './views/toolbarStatus';
import type {ViewDrag} from './views/viewDrag';
import {Settings} from './settings/settings';
import {SettingsCommands} from './settings/settingsCommands';
import {Status} from './views/status';
import {Notifications} from './views/notifications';
import {Workspace} from './workspace/workspace';
import type {Navigation} from './views/navigation';
import type {Layout} from './layout/layout';

/** Initial services, optional features, and presentation defaults for one Frame instance. */
export interface FrameOptions {

  /** Default sizing and interaction options for shell modals. */
  modal?: ModalOptions;

  /** Initial availability overrides keyed by feature identity. */
  features?: Readonly<Record<string, boolean>>;

  /** Explicit window, file, and external service adapters for this instance. */
  host?: import('./configuration/host').FrameHost;

  /** Initial per-instance theme. Omitted: inherit document CSS tokens. */
  theme?:
    | import('../themes/theme').FrameTheme
    | import('../themes/theme').FrameThemeDefinition;

  /** Initial workspace creation, tab, and interaction policies. */
  workspace?: WorkspaceOptions;

  /** Initial panel-selector bar presentation preferences. */
  panelViewBar?: PanelViewBarOptions;

  /** Status contributions and separator interaction defaults. */
  status?: StatusOptions;

  /** Enables navigation controls or supplies their initial presentation. */
  navigationBar?: boolean | NavigationBarOptions;

  /** Manage button location. Default: bottom (status bar). */
  manageButtonPosition?: 'top' | 'bottom';

  /** Initial panel placement and alignment. */
  panel?: PanelOptions;

  /** Initial secondary selector presentation and editing permissions. */
  secondaryViewBar?: SecondaryViewBarOptions;

  /** Toolbar controls and initial contribution placement. */
  toolbar?: ToolbarOptions;

  /** Initial primary selector presentation and editing permissions. */
  primaryViewBar?: PrimaryViewBarOptions;

  /** Field definitions registered within this section. */
  settings?: boolean | import('./settings/settingsTypes').SettingsOptions;

  /** Enables shortcut preferences or supplies their host storage integration. */
  keybindings?: boolean | import('./settings/settingsTypes').SettingsOptions;

  /** Whether transient notification presentation is enabled. */
  notifications?: boolean;

  /** Enable application navigation history and title-bar arrows. Default: false. */
  navigation?: boolean | NavigationOptions;
}

/**
 * Owns one isolated Frame application and coordinates its shell services.
 *
 * Services retain their focused implementations. The root connects registration,
 * commands, layout, presentation, module installation, and disposal. Instance
 * methods remain bound when passed to menus, lifecycle hooks, or host callbacks.
 *
 * @example
 * ```ts
 * const frame = new Frame({settings: true});
 * frame.settings.register({id: 'app', title: 'Application', settings: []});
 * frame.dispose();
 * ```
 */
export class Frame {

  /** Manage menu content and its status-bar registration. */
  private readonly manageMenu: ManageMenu;

  /** Presentation requests for the settings editor. */
  private readonly settingsLauncher: PreferenceLauncher;

  /** Presentation requests for keyboard shortcut preferences. */
  private readonly keybindingsLauncher: PreferenceLauncher;

  /** Owns registered shell views, hierarchy, visibility, selection, and movement. */
  private readonly viewRegistry: ViewRegistry;

  /** Owns command discovery and explicit picker requests. */
  private readonly quickInputController: QuickInputController;

  /** Owns feature-gated layout state, Zen restoration, and presentation reset. */
  private readonly shellLayout: ShellLayout;

  /** Owns resource-derived command definitions and their presentation labels. */
  private readonly resourceCommands: ResourceCommands;

  /** Connects generic navigation history to workspace and view state. */
  private readonly shellNavigation: ShellNavigation;

  /** Owns application toolbar action registrations and their command/status bindings. */
  private readonly toolbarContributions: ToolbarContributions;

  /** Binds navigation actions to the shared command execution and presentation gates. */
  private readonly navigationCommands: NavigationCommands;

  /** Owns the host banner registration and its retained presentation lifecycle. */
  private readonly workspaceBannerController: WorkspaceBanner;

  /** Owns modal registrations, stacking, and presentation activation. */
  private readonly modalRegistry: ModalRegistry;

  /** Owns the bounded, timestamped application session log. */
  private readonly activityLog: ActivityLog;

  /** Initial configuration shared by the owning service constructors. */
  private readonly options: FrameOptions;

  /** Reactive observers belong to this instance rather than a caller's Vue scope. */
  private readonly scope = effectScope(true);

  /** Optional module installation and reverse-order cleanup ownership. */
  private readonly modules!: ModuleRegistry;

  /** Makes application disposal idempotent and rejects later module installation. */
  private disposed = false;

  /** Theme selection, token application, and owned theme attachments. */
  readonly theme!: FrameThemeController;

  /** Explicit window, file, and external host capabilities for this instance. */
  readonly host!: HostController;

  /** Contextual permissions used by commands and application UI. */
  readonly permissions!: PermissionRegistry;

  /** Feature availability shared by shell presentation and execution guards. */
  readonly features!: FeatureRegistry;

  /** Application settings registration, effective values, and persistence. */
  readonly settings!: Settings;

  /** Instance-local notifications and their owned lifetime. */
  readonly notifications!: Notifications;

  /** Monotonic request ID observed by the settings presentation. */
  get settingsRequest(): ShallowRef<number> {
    return this.settingsLauncher.request;
  }

  /** Requested modal or tab destination for settings. */
  get settingsTarget(): ShallowRef<'modal' | 'tab'> {
    return this.settingsLauncher.target;
  }

  /** Monotonic request ID for opening or switching to settings JSON. */
  get settingsJsonRequest(): ShallowRef<number> {
    return this.settingsLauncher.jsonRequest;
  }

  /** Reactive availability of a workspace destination for settings. */
  get canOpenSettingsInTab(): ComputedRef<boolean> {
    return this.settingsLauncher.canOpenInTab;
  }

  /** Monotonic request ID observed by the keyboard-shortcut presentation. */
  get keybindingsRequest(): ShallowRef<number> {
    return this.keybindingsLauncher.request;
  }

  /** Requested modal or tab destination for keyboard shortcuts. */
  get keybindingsTarget(): ShallowRef<'modal' | 'tab'> {
    return this.keybindingsLauncher.target;
  }

  /** Monotonic request ID for opening shortcut JSON. */
  get keybindingsJsonRequest(): ShallowRef<number> {
    return this.keybindingsLauncher.jsonRequest;
  }

  /** Reactive availability of a workspace destination for shortcut preferences. */
  get canOpenKeybindingsInTab(): ComputedRef<boolean> {
    return this.keybindingsLauncher.canOpenInTab;
  }

  /** Host-configurable actions displayed by the shell Manage menu. */
  get manageMenuItems(): ShallowRef<
    readonly FrameMenuItem[],
    readonly FrameMenuItem[]
  > {
    return this.manageMenu.items;
  }

  /** Workspace panes, tabs, focus, and content registration. */
  readonly workspace!: Workspace;

  /** Retained host banner definition, independent of its visibility. */
  get workspaceBanner(): ShallowRef<
    WorkspaceBannerDefinition | undefined,
    WorkspaceBannerDefinition | undefined
  > {
    return this.workspaceBannerController.workspaceBanner;
  }

  /** Ordered modal definitions; the last entry is the active presentation. */
  get modals(): ShallowReactive<ModalDefinition[]> {
    return this.modalRegistry.modals;
  }

  /** Host-controlled interaction permissions for shell view movement. */
  get interaction(): {
    dragging: boolean;
    primary: boolean;
    secondary: boolean;
    bottom: boolean;
  } {
    return this.viewRegistry.interaction;
  }

  /** Registered toolbar contributions retained across presentation changes. */
  get toolbarActions(): ShallowReactive<ToolbarAction[]> {
    return this.toolbarContributions.toolbarActions;
  }

  /** Toolbar placement, presentation, and registration policy. */
  readonly toolbar!: Toolbar;

  /** Reactive shell arrangement guarded by feature availability. */
  get layout(): Layout {
    return this.shellLayout.layout;
  }

  /** Status contributions, separators, and transient messages. */
  readonly status!: Status;

  /** Reactive hidden, collapsed, and height preferences for registered views. */
  get menuState(): {
    hidden: Record<string, boolean>;
    collapsed: Record<string, boolean>;
    heights: Record<string, number>;
  } {
    return this.viewRegistry.menuState;
  }

  /** Mounted content hosts used to retain view identity across moves. */
  get contentHosts(): ShallowReactive<Map<string, HTMLElement>> {
    return this.viewRegistry.contentHosts;
  }

  /** Computed projection of all registered views. */
  get views(): ComputedRef<SidePanelDefinition[]> {
    return this.viewRegistry.views;
  }

  /** Primary view selection, display, and separator preferences. */
  readonly primaryViewBar!: PrimaryViewBar & ShellPresentation;

  /** Original navigation operations captured before command routing. */
  private readonly rawNavigationBar!: NavigationBar;

  /** Navigation contributions and shared presentation guards. */
  readonly navigationBar!: NavigationBar & ShellPresentation;

  /** Reactive active-view selections and local session log. */
  get state(): {
    sidebarVisible: boolean;
    panelVisible: boolean;
    activeSidePanel: string;
    activeBottomTab: string;
    activeSecondaryTab: string;
    entries: ActivityEntry[];
    message: string;
  } {
    return this.viewRegistry.state;
  }

  /** Panel selectors and their independent bar presentation. */
  readonly panelViewBar!: PanelViewBar & ShellPresentation;

  /** Panel views, placement, alignment, and retained presentation. */
  readonly panel!: Panel & ShellViewContainer;

  /** Secondary view selection, display, and separator preferences. */
  readonly secondaryViewBar!: SecondaryViewBar & ShellPresentation;

  /** Primary sidebar registration and retained presentation lifecycle. */
  readonly primarySidebar!: ShellViewContainer;

  /** Secondary sidebar registration and retained presentation lifecycle. */
  readonly secondarySidebar!: ShellViewContainer;

  /** Menu-bar visibility and feature availability. */
  readonly menuBar!: ShellPresentation;

  /** History capture and restoration using the existing workspace and views. */
  get navigation(): Navigation<FrameNavigationLocation> {
    return this.shellNavigation.navigation;
  }

  /** Resets workspace content through navigation history. */
  get resetWorkspace(): () => void {
    return this.shellNavigation.resetWorkspace;
  }

  /** Current picker request and its completion callback, or null. */
  get quickInput(): ShallowRef<FramePickerRequest | null> {
    return this.quickInputController.quickInput;
  }

  /** Combined host and generated definitions supplied to the command registry. */
  private get commandDefinitions(): ComputedRef<Command[]> {
    return this.resourceCommands.commandDefinitions;
  }

  /** Computed primary root view definitions. */
  get sidePanels(): ComputedRef<SidePanelDefinition[]> {
    return this.viewRegistry.sidePanels;
  }

  /** Computed secondary root view definitions. */
  get secondaryTabs(): ComputedRef<PanelDefinition[]> {
    return this.viewRegistry.secondaryTabs;
  }

  /** Computed panel root view definitions. */
  get bottomTabs(): ComputedRef<PanelDefinition[]> {
    return this.viewRegistry.bottomTabs;
  }

  /** Authoritative command registration, discovery, and guarded execution. */
  readonly commands!: CommandRegistry;

  /** Shortcut overrides and shared preference editing state. */
  readonly keybindings!: Keybindings;

  /** Command selection and nested submenu navigation. */
  readonly commandCenter!: CommandCenter;

  /** Bound command registration shared by host and shell APIs. */
  readonly registerCommand!: (command: Command) => CommandRegistration;

  /** Live picker rows for the current category or explicit choice request. */
  get quickInputItems(): ComputedRef<QuickPickItem[]> {
    return this.quickInputController.quickInputItems;
  }

  /** Owns interactive view dragging and its insertion preview. */
  private get viewDrag(): ViewDrag {
    return this.viewRegistry.viewDrag;
  }

  /** Bound view-drag entry point retaining its controller ownership. */
  get beginViewDrag(): (
    event: PointerEvent,
    id: string,
    region: ViewRegion
  ) => void {
    return this.viewRegistry.beginViewDrag;
  }

  /** Bound registry execution path shared by picker and host calls. */
  readonly executeCommand!: (id: string) => Promise<void>;

  /** Whether the shell layout customization overlay is open. */
  get layoutCustomizerOpen(): ShallowRef<boolean> {
    return this.shellLayout.layoutCustomizerOpen;
  }

  /** Dock registration and presentation tied to shell availability. */
  readonly docks!: DockRegistry;

  /** Releases setting-field command bindings on disposal. */
  private readonly stopSettingsCommands!: () => void;

  /** Coordinates toolbar actions with their status-bar presentations. */
  private readonly toolbarStatus!: ToolbarStatus;

  /** Shares the existing settings.register operation or state with the public shell API. */
  readonly registerSettingsSection!: Frame['settings']['register'];

  /** Shares the existing notifications.notify operation or state with the public shell API. */
  readonly notify!: Frame['notifications']['notify'];

  /** Shares the existing viewDrag.state operation or state with the public shell API. */
  readonly dragState!: ViewDrag['state'];

  /** Shares the existing viewDrag.cancel operation or state with the public shell API. */
  readonly cancelViewDrag!: ViewDrag['cancel'];

  /** Shares the existing menuState operation or state with the public shell API. */
  readonly viewState!: Frame['menuState'];

  /** Shares the existing workspaceBanner operation or state with the public shell API. */
  readonly banner!: Frame['workspaceBanner'];

  /** Shares the existing registerWorkspaceBanner operation or state with the public shell API. */
  readonly registerBanner!: Frame['registerWorkspaceBanner'];

  /** Shares the existing openWorkspaceBanner operation or state with the public shell API. */
  readonly openBanner!: Frame['openWorkspaceBanner'];

  /** Shares the existing closeWorkspaceBanner operation or state with the public shell API. */
  readonly closeBanner!: Frame['closeWorkspaceBanner'];

  /** Shares the existing toggleWorkspaceBanner operation or state with the public shell API. */
  readonly toggleBanner!: Frame['toggleWorkspaceBanner'];

  /** Shares the existing registerView operation or state with the public shell API. */
  readonly registerMenu!: Frame['registerView'];

  /** Shares the existing openView operation or state with the public shell API. */
  readonly openMenu!: Frame['openView'];

  /** Shares the existing workspace.split operation or state with the public shell API. */
  readonly splitWorkspace!: Frame['workspace']['split'];

  /** Shares the existing workspace.close operation or state with the public shell API. */
  readonly closeWorkspacePane!: Frame['workspace']['close'];

  /** Shares the existing workspace.setPane operation or state with the public shell API. */
  readonly setWorkspacePane!: Frame['workspace']['setPane'];

  /**
   * Creates the services and shell wiring for one application instance.
   *
   * @param options - Explicit host adapters, optional features, and shell defaults.
   */
  constructor(options: FrameOptions = {}) {
    markRaw(this);
    this.options = options;
    this.use = this.use.bind(this);
    this.dispose = this.dispose.bind(this);
    this.openSettingsInTab = this.openSettingsInTab.bind(this);
    this.openSettingsJSON = this.openSettingsJSON.bind(this);
    this.openSetting = this.openSetting.bind(this);
    this.openKeybindings = this.openKeybindings.bind(this);
    this.openKeybindingsInTab = this.openKeybindingsInTab.bind(this);
    this.openKeybindingsInModal = this.openKeybindingsInModal.bind(this);
    this.openKeybindingsJSON = this.openKeybindingsJSON.bind(this);
    this.openSettingsInModal = this.openSettingsInModal.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.registerWorkspaceBanner = this.registerWorkspaceBanner.bind(this);
    this.openWorkspaceBanner = this.openWorkspaceBanner.bind(this);
    this.closeWorkspaceBanner = this.closeWorkspaceBanner.bind(this);
    this.toggleWorkspaceBanner = this.toggleWorkspaceBanner.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.registerToolbarAction = this.registerToolbarAction.bind(this);
    this.getViewCommand = this.getViewCommand.bind(this);
    this.getViewChildren = this.getViewChildren.bind(this);
    this.isViewVisible = this.isViewVisible.bind(this);
    this.setViewVisible = this.setViewVisible.bind(this);
    this.getViewParent = this.getViewParent.bind(this);

    this.viewRegion = this.viewRegion.bind(this);

    this.registerNavigationItem = this.registerNavigationItem.bind(this);
    this.canMoveView = this.canMoveView.bind(this);
    this.moveView = this.moveView.bind(this);
    this.viewKey = this.viewKey.bind(this);

    this.dragView = this.dragView.bind(this);
    this.dropView = this.dropView.bind(this);
    this.record = this.record.bind(this);

    this.openView = this.openView.bind(this);
    this.registerView = this.registerView.bind(this);
    this.registerSidePanel = this.registerSidePanel.bind(this);
    this.registerBottomTab = this.registerBottomTab.bind(this);
    this.registerSecondaryTab = this.registerSecondaryTab.bind(this);
    this.openSecondaryPanel = this.openSecondaryPanel.bind(this);
    this.selectSecondaryView = this.selectSecondaryView.bind(this);
    this.closeSecondaryPanel = this.closeSecondaryPanel.bind(this);
    this.toggleSecondaryPanel = this.toggleSecondaryPanel.bind(this);
    this.setZenMode = this.setZenMode.bind(this);
    this.resetLayout = this.resetLayout.bind(this);
    this.openSidePanel = this.openSidePanel.bind(this);
    this.selectSideView = this.selectSideView.bind(this);
    this.closeSidePanel = this.closeSidePanel.bind(this);
    this.toggleSidePanel = this.toggleSidePanel.bind(this);
    this.openBottomPanel = this.openBottomPanel.bind(this);
    this.closeBottomPanel = this.closeBottomPanel.bind(this);
    this.toggleBottomPanel = this.toggleBottomPanel.bind(this);
    this.closeQuickInput = this.closeQuickInput.bind(this);
    this.openQuickInput = this.openQuickInput.bind(this);
    this.openCommands = this.openCommands.bind(this);
    this.setQuickInputMode = this.setQuickInputMode.bind(this);
    this.showQuickPick = this.showQuickPick.bind(this);
    this.acceptQuickInput = this.acceptQuickInput.bind(this);
    this.resolveMenuItems = this.resolveMenuItems.bind(this);
    const owner = this;
    this.theme = this.scope.run(
      () => new FrameThemeController(this.options.theme)
    )!;
    this.host = this.scope.run(() => new HostController(this.options.host))!;
    this.permissions = this.scope.run(() => new PermissionRegistry())!;
    this.features = this.scope.run(
      () =>
        new FeatureRegistry({
          settings: this.options.settings !== false,
          keybindings: this.options.keybindings !== false,
          notifications: this.options.notifications ?? true,
          navigation: !!this.options.navigation,
          ...this.options.features,
        })
    )!;
    this.settings = this.scope.run(
      () =>
        new Settings(
          typeof this.options.settings === 'object' ? this.options.settings : {}
        )
    )!;
    void this.settings.load().catch(() => {});
    this.notifications = this.scope.run(() => new Notifications())!;
    this.settingsLauncher = new PreferenceLauncher(
      'settings',
      this.features,
      () => this.workspace,
      () => this.settings,
      this.closeQuickInput
    );
    this.keybindingsLauncher = new PreferenceLauncher(
      'keybindings',
      this.features,
      () => this.workspace,
      () => this.keybindings,
      this.closeQuickInput
    );

    this.manageMenu = new ManageMenu();
    this.workspace = this.scope.run(
      () => new Workspace(this.options.workspace)
    )!;
    this.workspaceBannerController = new WorkspaceBanner({
      get shellLayout() {
        return owner.shellLayout;
      },
    });
    this.modalRegistry = new ModalRegistry({
      get viewRegistry() {
        return owner.viewRegistry;
      },
      get quickInputController() {
        return owner.quickInputController;
      },
      get options() {
        return owner.options;
      },
    });
    this.activityLog = new ActivityLog();
    this.viewRegistry = new ViewRegistry({
      get commands() {
        return owner.commands;
      },
      get shellLayout() {
        return owner.shellLayout;
      },
      get status() {
        return owner.status;
      },
      get activityLog() {
        return owner.activityLog;
      },
      get features() {
        return owner.features;
      },
      get primaryViewBar() {
        return owner.primaryViewBar;
      },
      get shellNavigation() {
        return owner.shellNavigation;
      },
      get resourceCommands() {
        return owner.resourceCommands;
      },
      get secondaryViewBar() {
        return owner.secondaryViewBar;
      },
      get panelViewBar() {
        return owner.panelViewBar;
      },
      get registerCommand() {
        return owner.registerCommand;
      },
    });
    this.toolbarContributions = new ToolbarContributions({
      get commands() {
        return owner.commands;
      },
      get toolbarStatus() {
        return owner.toolbarStatus;
      },
      get toolbar() {
        return owner.toolbar;
      },
    });
    this.toolbar = this.scope.run(
      () => new Toolbar(this.options.toolbar, () => this.toolbarActions)
    )!;
    this.shellLayout = new ShellLayout({
      get features() {
        return owner.features;
      },
      get rawNavigationBar() {
        return owner.rawNavigationBar;
      },
      get modalRegistry() {
        return owner.modalRegistry;
      },
      get navigationBar() {
        return owner.navigationBar;
      },
      get panelViewBar() {
        return owner.panelViewBar;
      },
      get options() {
        return owner.options;
      },
      get status() {
        return owner.status;
      },
      get toolbar() {
        return owner.toolbar;
      },
      get primaryViewBar() {
        return owner.primaryViewBar;
      },
      get secondaryViewBar() {
        return owner.secondaryViewBar;
      },
      get panel() {
        return owner.panel;
      },
    });
    this.status = this.scope.run(
      () =>
        new Status(this.layout, this.options.status, (id) => {
          this.manageMenu.onStatusRemove(id, this.layout);
        })
    )!;
    this.manageMenu.connect(this.status, this.layout, this.features);
    this.resourceCommands = new ResourceCommands({
      get viewRegistry() {
        return owner.viewRegistry;
      },
      get commands() {
        return owner.commands;
      },
      get theme() {
        return owner.theme;
      },
      get workspace() {
        return owner.workspace;
      },
    });
    this.primaryViewBar = this.scope.run(() =>
      withPresentation(
        new PrimaryViewBar(
          this.viewRegistry.primaryRegistrations,
          this.options.primaryViewBar,
          this.viewRegistry.onPrimaryVisibilityChange,
          this.layout,
          () => this.interaction.dragging && this.interaction.primary
        ),
        new ShellPresentation(
          this.features,
          'primaryViewBar',
          () => this.layout.primaryViewBarVisible,
          () => {
            this.layout.primaryViewBarVisible = true;
          },
          () => {
            this.layout.primaryViewBarVisible = false;
          }
        )
      )
    )!;
    this.rawNavigationBar = this.scope.run(
      () =>
        new NavigationBar(
          this.options.navigationBar,
          {
            navigate: navigateBrowserLink,
            reportError(label, error) {
              owner.status.show(`Could not run ${label}`, {severity: 'error'});
              owner.record(
                `${label}: ${error instanceof Error ? error.message : String(error)}`
              );
            },
          },
          () => this.features.isAvailable('navigationBar')
        )
    )!;
    this.navigationBar = this.scope.run(() =>
      withPresentation(
        this.rawNavigationBar,
        new ShellPresentation(
          this.features,
          'navigationBar',
          () => this.rawNavigationBar.visible.value,
          () => {
            this.rawNavigationBar.setVisible(true);
          },
          () => {
            this.rawNavigationBar.setVisible(false);
          }
        )
      )
    )!;
    this.panelViewBar = this.scope.run(() =>
      withPresentation(
        new PanelViewBar(
          () => this.bottomTabs.value,
          this.isViewVisible,
          this.setViewVisible,
          this.layout,
          this.options.panelViewBar,
          () => this.interaction.dragging && this.interaction.bottom
        ),
        new ShellPresentation(
          this.features,
          'panelViewBar',
          () => this.layout.panelViewBarVisible,
          () => {
            this.layout.panelViewBarVisible = true;
          },
          () => {
            this.layout.panelViewBarVisible = false;
          }
        )
      )
    )!;
    this.panel = this.scope.run(() =>
      withPresentation(
        new Panel(this.layout, this.options.panel),
        new ShellViewContainer(
          this.features,
          'panel',
          () => this.layout.panelVisible,
          (id) => this.viewRegistry.openContainer('bottom', id),
          () => {
            void this.executeCommand('frame.panel.close');
          },
          () => this.bottomTabs.value,
          this.registerBottomTab,
          this.viewRegistry.executeViewCommand
        )
      )
    )!;
    this.secondaryViewBar = this.scope.run(() =>
      withPresentation(
        new SecondaryViewBar(
          () => this.secondaryTabs.value,
          this.isViewVisible,
          this.setViewVisible,
          this.layout,
          this.options.secondaryViewBar,
          () => this.interaction.dragging && this.interaction.secondary
        ),
        new ShellPresentation(
          this.features,
          'secondaryViewBar',
          () => this.layout.secondaryViewBarVisible,
          () => {
            this.layout.secondaryViewBarVisible = true;
          },
          () => {
            this.layout.secondaryViewBarVisible = false;
          }
        )
      )
    )!;
    this.primarySidebar = this.scope.run(
      () =>
        new ShellViewContainer(
          this.features,
          'primarySidebar',
          () => this.layout.primarySidebarVisible,
          (id) => this.viewRegistry.openContainer('primary', id),
          () => {
            void this.executeCommand('frame.sidebar.close');
          },
          () => this.sidePanels.value,
          this.registerSidePanel,
          this.viewRegistry.executeViewCommand
        )
    )!;
    this.secondarySidebar = this.scope.run(
      () =>
        new ShellViewContainer(
          this.features,
          'secondarySidebar',
          () => this.layout.secondarySidebarVisible,
          (id) => this.viewRegistry.openContainer('secondary', id),
          () => {
            void this.executeCommand('frame.secondary.close');
          },
          () => this.secondaryTabs.value,
          this.registerSecondaryTab,
          this.viewRegistry.executeViewCommand
        )
    )!;
    this.menuBar = this.scope.run(
      () =>
        new ShellPresentation(
          this.features,
          'menuBar',
          () => this.layout.menuBarVisible,
          () => {
            this.layout.menuBarVisible = true;
          },
          () => {
            this.layout.menuBarVisible = false;
          }
        )
    )!;
    this.shellNavigation = new ShellNavigation({
      get options() {
        return owner.options;
      },
      get features() {
        return owner.features;
      },
      get workspace() {
        return owner.workspace;
      },
      get viewRegistry() {
        return owner.viewRegistry;
      },
      get shellLayout() {
        return owner.shellLayout;
      },
    });
    this.quickInputController = new QuickInputController({
      get commands() {
        return owner.commands;
      },
      get features() {
        return owner.features;
      },
      get executeCommand() {
        return owner.executeCommand;
      },
    });
    this.commands = this.scope.run(
      () =>
        new CommandRegistry(
          this.commandDefinitions,
          this.resourceCommands.registerCommandDefinition,
          this.features,
          (command, error) => {
            this.status.show(`Could not run ${command.label}`, {
              severity: 'error',
            });
            this.record(
              `${this.state.message}: ${error instanceof Error ? error.message : String(error)}`
            );
          },
          this.permissions
        )
    )!;
    this.keybindings = this.scope.run(
      () =>
        new Keybindings(
          this.commands,
          typeof this.options.keybindings === 'object'
            ? this.options.keybindings
            : {}
        )
    )!;
    void this.keybindings.load().catch(() => {});
    this.commandCenter = this.scope.run(
      () =>
        new CommandCenter(
          this.commands,
          this.showQuickPick,
          () => this.openQuickInput(),
          this.closeQuickInput
        )
    )!;

    this.registerCommand = this.commands.register;
    this.navigationCommands = new NavigationCommands({
      get navigationBar() {
        return owner.navigationBar;
      },
      get commands() {
        return owner.commands;
      },
    });
    this.executeCommand = this.commands.execute;
    this.docks = this.scope.run(
      () =>
        new DockRegistry(
          (anchor) =>
            this.features.isAvailable('shell') &&
            this.features.isAvailable(anchor),
          (anchor) =>
            isDockAnchorVisible(
              anchor,
              this.layout,
              this.navigationBar.visible.value,
              this.features.isAvailable('workspace')
            )
        )
    )!;
    this.registerSettingsSection = this.settings.register;
    this.notify = this.notifications.notify;
    this.dragState = this.viewDrag.state;
    this.cancelViewDrag = this.viewDrag.cancel;
    this.viewState = this.menuState;
    this.banner = this.workspaceBanner;
    this.registerBanner = this.registerWorkspaceBanner;
    this.openBanner = this.openWorkspaceBanner;
    this.closeBanner = this.closeWorkspaceBanner;
    this.toggleBanner = this.toggleWorkspaceBanner;
    this.registerMenu = this.registerView;
    this.openMenu = this.openView;
    this.splitWorkspace = this.workspace.split;
    this.closeWorkspacePane = this.workspace.close;
    this.setWorkspacePane = this.workspace.setPane;
    this.stopSettingsCommands = this.scope.run(
      () => new SettingsCommands(this.settings, this.commands).dispose
    )!;
    new BuiltinCommands(this).install();
    new ShellCommandBindings(this).connect();
    this.toolbarStatus = this.scope.run(() => new ToolbarStatus(this))!;
    this.modules = new ModuleRegistry(this);
  }

  /** Requests settings in an eligible workspace tab without duplicating it. */
  openSettingsInTab() {
    return this.settingsLauncher.openInTab();
  }

  /** Requests JSON settings when an editor and settings are available. */
  openSettingsJSON() {
    return this.settingsLauncher.openJSON();
  }

  /** Selects a registered setting and opens its settings presentation. */
  openSetting(id: string) {
    return this.settingsLauncher.reveal(id);
  }

  /** Opens shortcut preferences in their retained presentation. */
  openKeybindings() {
    return this.keybindingsLauncher.open();
  }

  /** Requests shortcut preferences in an eligible workspace tab. */
  openKeybindingsInTab() {
    return this.keybindingsLauncher.openInTab();
  }

  /** Requests shortcut preferences in the modal presentation. */
  openKeybindingsInModal() {
    return this.keybindingsLauncher.openInModal();
  }

  /** Requests shortcut JSON when its editor capability is available. */
  openKeybindingsJSON() {
    return this.keybindingsLauncher.openJSON();
  }

  /** Requests settings in the modal presentation without saving its draft. */
  openSettingsInModal() {
    return this.settingsLauncher.openInModal();
  }

  /** Opens settings in its retained modal or tab presentation. */
  openSettings() {
    return this.settingsLauncher.open();
  }

  /** Registers one host banner and returns identity-checked cleanup. */
  registerWorkspaceBanner(banner: WorkspaceBannerDefinition) {
    return this.workspaceBannerController.registerWorkspaceBanner(banner);
  }

  /** Reveals the retained banner when one is registered. */
  openWorkspaceBanner() {
    return this.workspaceBannerController.openWorkspaceBanner();
  }

  /** Hides the banner while retaining its registration. */
  closeWorkspaceBanner() {
    return this.workspaceBannerController.closeWorkspaceBanner();
  }

  /** Toggles the registered banner presentation. */
  toggleWorkspaceBanner() {
    return this.workspaceBannerController.toggleWorkspaceBanner();
  }

  /** Closes the addressed modal, defaulting to the topmost presentation. */
  closeModal(id = this.modals[this.modals.length - 1]?.id) {
    return this.modalRegistry.closeModal(id);
  }

  /** Opens or activates a modal, cancelling conflicting transient interactions. */
  openModal(modal: ModalDefinition) {
    return this.modalRegistry.openModal(modal);
  }

  /** Registers a toolbar action and its command/status integration. */
  registerToolbarAction(action: ToolbarAction) {
    return this.toolbarContributions.registerToolbarAction(action);
  }

  /** Returns the command assigned to a registered view. */
  getViewCommand(id: string) {
    return this.viewRegistry.getViewCommand(id);
  }

  /** Returns ordered registered children for a view. */
  getViewChildren(id: string) {
    return this.viewRegistry.getViewChildren(id);
  }

  /** Reads effective view visibility independently of registration. */
  isViewVisible(id: string) {
    return this.viewRegistry.isViewVisible(id);
  }

  /** Changes view visibility through its current owning region. */
  setViewVisible(id: string, visible: boolean) {
    return this.viewRegistry.setViewVisible(id, visible);
  }

  /** Returns the registered parent view, if any. */
  getViewParent(id: string) {
    return this.viewRegistry.getViewParent(id);
  }

  /** Resolves the current region of a root or nested view. */
  viewRegion(id: string): ViewRegion | undefined {
    return this.viewRegistry.viewRegion(id);
  }

  /** Registers command-backed navigation actions with complete cleanup. */
  registerNavigationItem(input: NavigationItem) {
    return this.navigationCommands.registerNavigationItem(input);
  }

  /** Checks feature, region, parent, and host movement restrictions. */
  canMoveView(id: string, destination: ViewRegion, parentId?: string) {
    return this.viewRegistry.canMoveView(id, destination, parentId);
  }

  /** Relocates a registered view while retaining its content and identity. */
  moveView(
    id: string,
    destination: ViewRegion,
    before?: string,
    parentId?: string
  ) {
    return this.viewRegistry.moveView(id, destination, before, parentId);
  }

  /** Handles keyboard movement and activation for a registered view. */
  async viewKey(event: KeyboardEvent, id: string, region: ViewRegion) {
    return this.viewRegistry.viewKey(event, id, region);
  }

  /** Begins legacy drag-event integration through the existing view controller. */
  dragView(event: DragEvent, id: string, region: ViewRegion) {
    return this.viewRegistry.dragView(event, id, region);
  }

  /** Completes a permitted legacy drag-event view relocation. */
  dropView(event: DragEvent, region: ViewRegion, before?: string) {
    return this.viewRegistry.dropView(event, region, before);
  }

  /** Appends a bounded session-log entry with a stable identity. */
  record(message: string) {
    return this.activityLog.record(message);
  }

  /** Reveals a view through its current region and ancestor hierarchy. */
  openView(id: string) {
    return this.viewRegistry.openView(id);
  }

  /** Registers a view tree, commands, and current region membership. */
  registerView(input: SidePanelDefinition, region: ViewRegion) {
    return this.viewRegistry.registerView(input, region);
  }

  /** Registers a root view in the primary sidebar. */
  registerSidePanel(panel: SidePanelDefinition) {
    return this.viewRegistry.registerSidePanel(panel);
  }

  /** Registers a root view in the panel. */
  registerBottomTab(tab: PanelDefinition) {
    return this.viewRegistry.registerBottomTab(tab);
  }

  /** Registers a root view in the secondary sidebar. */
  registerSecondaryTab(tab: PanelDefinition) {
    return this.viewRegistry.registerSecondaryTab(tab);
  }

  /** Reveals the secondary sidebar and selects an eligible view. */
  openSecondaryPanel(id = this.state.activeSecondaryTab) {
    return this.viewRegistry.openSecondaryPanel(id);
  }

  /** Selects a secondary view through navigation and presentation guards. */
  selectSecondaryView(id: string) {
    return this.viewRegistry.selectSecondaryView(id);
  }

  /** Hides the secondary sidebar without unregistering content. */
  closeSecondaryPanel() {
    return this.viewRegistry.closeSecondaryPanel();
  }

  /** Toggles the secondary sidebar through its existing presentation path. */
  toggleSecondaryPanel() {
    return this.viewRegistry.toggleSecondaryPanel();
  }

  /** Enters or leaves Zen mode while retaining the layout restoration snapshot. */
  setZenMode(enabled: boolean) {
    return this.shellLayout.setZenMode(enabled);
  }

  /** Restores configured shell layout while respecting feature availability. */
  resetLayout() {
    return this.shellLayout.resetLayout();
  }

  /** Reveals the primary sidebar and selects an eligible view. */
  openSidePanel(id = this.state.activeSidePanel) {
    return this.viewRegistry.openSidePanel(id);
  }

  /** Selects a primary view through navigation and presentation guards. */
  selectSideView(id: string) {
    return this.viewRegistry.selectSideView(id);
  }

  /** Hides the primary sidebar while retaining its content. */
  closeSidePanel() {
    return this.viewRegistry.closeSidePanel();
  }

  /** Toggles the primary sidebar through its presentation path. */
  toggleSidePanel() {
    return this.viewRegistry.toggleSidePanel();
  }

  /** Reveals the panel and selects an eligible registered view. */
  openBottomPanel(id = this.state.activeBottomTab) {
    return this.viewRegistry.openBottomPanel(id);
  }

  /** Hides the panel without disposing its views. */
  closeBottomPanel() {
    return this.viewRegistry.closeBottomPanel();
  }

  /** Toggles the panel through its existing presentation path. */
  toggleBottomPanel() {
    return this.viewRegistry.toggleBottomPanel();
  }

  /** Cancels the current picker and resolves any pending selection. */
  closeQuickInput() {
    return this.quickInputController.closeQuickInput();
  }

  /** Opens live command discovery for an application or prefix category. */
  openQuickInput(destination: string = 'application') {
    return this.quickInputController.openQuickInput(destination);
  }

  /** Opens Frame command discovery using its reserved prefix. */
  openCommands() {
    return this.quickInputController.openCommands();
  }

  /** Switches a live command request between registered prefix categories. */
  setQuickInputMode(destination: string) {
    return this.quickInputController.setQuickInputMode(destination);
  }

  /** Opens explicit typed choices and resolves selection or cancellation. */
  showQuickPick<T extends QuickPickItem>(
    items: readonly T[],
    options: QuickPickOptions = {}
  ): Promise<T | undefined> {
    return this.quickInputController.showQuickPick(items, options);
  }

  /** Accepts an available selectable row from the current picker request. */
  acceptQuickInput(id: string) {
    return this.quickInputController.acceptQuickInput(id);
  }

  /** Projects command visibility, shortcuts, and enabled state into menu rows. */
  resolveMenuItems(items: readonly FrameMenuItem[]): FrameMenuItem[] {
    return this.commands.resolveMenuItems(items);
  }

  /**
   * Installs a module and exposes its typed capability on this same instance.
   *
   * @param module - Descriptor defining a unique ID, capability key, and installer.
   * @returns This instance, extended with the installed capability's type.
   * @throws If disposed, if a descriptor conflicts, or if its installation fails.
   */
  use<Key extends string, Capability>(
    module: FrameModule<Key, Capability>
  ): this & Record<Key, Capability> {
    this.modules.install(module);
    return this as this & Record<Key, Capability>;
  }

  /**
   * Disposes installed modules before shell services and owned reactive observers.
   * Repeated calls are harmless. A module cleanup failure still releases the shell.
   * Host-owned native windows and file services are never disposed by Frame.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.modules.dispose();
    } finally {
      try {
        this.disposeServices();
      } finally {
        this.scope.stop();
      }
    }
  }

  /** Releases shell services and retained registrations after module disposal. */
  private disposeServices() {
    this.docks.dispose();
    this.toolbarStatus.dispose();
    this.stopSettingsCommands();
    this.keybindings.dispose();
    this.commandCenter.dispose();
    this.commands.dispose();
    this.permissions.dispose();
    this.features.dispose();
    this.shellLayout.dispose();
    this.host.dispose();
    this.theme.dispose();
    this.manageMenu.dispose();
    this.status.dispose();
    this.shellNavigation.dispose();
    this.quickInputController.dispose();
    this.workspaceBannerController.dispose();
    this.viewRegistry.dispose();
    this.workspace.dispose();
    this.navigationCommands.dispose();
    this.navigationBar.dispose();
    this.primaryViewBar.dispose();
    this.secondaryViewBar.dispose();
    this.panel.dispose();
    this.panelViewBar.dispose();
    this.settings.dispose();
    this.notifications.dispose();
    this.modalRegistry.dispose();
    this.toolbar.dispose();
    this.toolbarContributions.dispose();
    this.resourceCommands.dispose();
  }
}

/** Creates a Frame instance through the existing public factory API. */
export function createFrame(options: FrameOptions = {}): Frame {
  return new Frame(options);
}
