import type {ShellViewContainer} from '../views/shellViewContainer';
import type {Panel} from '../views/panel';
import type {SecondaryViewBar} from '../views/secondaryViewBar';
import type {PrimaryViewBar} from '../views/primaryViewBar';
import type {Toolbar} from '../views/toolbar';
import type {Status} from '../views/status';
import type {PanelViewBar} from '../views/panelViewBar';
import type {ShellPresentation} from '../views/shellPresentation';
import type {NavigationBar} from '../views/navigationBar';
import type {FeatureRegistry} from '../features/featureRegistry';
import type {ShallowRef, WatchHandle} from 'vue';
import {effectScope, reactive, shallowRef, watch} from 'vue';
import {Layout, defaultLayout, type LayoutState} from './layout';
import type {FrameOptions} from '../frame';
import type {ModalRegistry} from '../views/modalRegistry';

/** Narrow dependencies connected by the owning Frame instance. */
export interface ShellLayoutServices {

  /** Feature availability shared by shell presentation and execution guards. */
  readonly features: FeatureRegistry;

  /** Original navigation operations captured before command routing. */
  readonly rawNavigationBar: NavigationBar;

  /** Owns modal registrations, stacking, and presentation activation. */
  readonly modalRegistry: ModalRegistry;

  /** Navigation contributions and shared presentation guards. */
  readonly navigationBar: NavigationBar & ShellPresentation;

  /** Panel selectors and their independent bar presentation. */
  readonly panelViewBar: PanelViewBar & ShellPresentation;

  /** Initial configuration shared by the owning service constructors. */
  readonly options: FrameOptions;

  /** Status contributions, separators, and transient messages. */
  readonly status: Status;

  /** Toolbar placement, presentation, and registration policy. */
  readonly toolbar: Toolbar;

  /** Primary view selection, display, and separator preferences. */
  readonly primaryViewBar: PrimaryViewBar & ShellPresentation;

  /** Secondary view selection, display, and separator preferences. */
  readonly secondaryViewBar: SecondaryViewBar & ShellPresentation;

  /** Panel views, placement, alignment, and retained presentation. */
  readonly panel: Panel & ShellViewContainer;
}

/**
 * Owns feature-gated layout state, Zen restoration, and presentation reset.
 * Existing bar controllers retain their specialized placement and display operations.
 */
export class ShellLayout {

  /** Observers belong to this service rather than a caller's temporary scope. */
  private readonly scope = effectScope(true);

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: ShellLayoutServices;

  /** Feature dependencies for layout visibility fields. */
  private readonly layoutFeatures: Partial<Record<keyof LayoutState, string>>;

  /** Reactive shell arrangement guarded by feature availability. */
  readonly layout: Layout;

  /** Releases feature-driven layout visibility synchronization. */
  private readonly stopFeatureLayout: () => void;

  /** Bar visibility and placement snapshot restored after Zen mode. */
  private beforeZenBars:
    | {
        nav: boolean;
        navPosition: import('../views/navigationBar').NavigationBarPosition;
        panelBar: boolean;
      }
    | undefined;

  /** Layout snapshot restored when leaving Zen mode. */
  private beforeZen:
    | Pick<
        LayoutState,
        | 'menuBarVisible'
        | 'primaryViewBarVisible'
        | 'secondaryViewBarVisible'
        | 'primarySidebarVisible'
        | 'secondarySidebarVisible'
        | 'panelVisible'
        | 'statusBarVisible'
        | 'bannerVisible'
        | 'centered'
      >
    | undefined;

  /** Releases maximized-region synchronization when presentations close. */
  private readonly stopMaximizedWatch: WatchHandle;

  /** Releases feature-driven presentation synchronization. */
  private readonly stopFeaturePresentation: () => void;

  /** Whether the shell layout customization overlay is open. */
  readonly layoutCustomizerOpen: ShallowRef<boolean>;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: ShellLayoutServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.setZenMode = this.setZenMode.bind(this);
    this.resetLayout = this.resetLayout.bind(this);
    const owner = this;
    this.layoutFeatures = {
      primarySidebarVisible: 'primarySidebar',
      secondarySidebarVisible: 'secondarySidebar',
      panelVisible: 'panel',
      primaryViewBarVisible: 'primaryViewBar',
      secondaryViewBarVisible: 'secondaryViewBar',
      panelViewBarVisible: 'panelViewBar',
      menuBarVisible: 'menuBar',
      statusBarVisible: 'statusBar',
      navigationVisible: 'navigation',
      bannerVisible: 'banner',
    };
    this.layout = reactive(
      new Proxy(new Layout(), {
        set(target, key, value) {
          const feature = owner.layoutFeatures[key as keyof LayoutState];
          return Reflect.set(
            target,
            key,
            feature &&
              !owner.services.features.isAvailable(feature) &&
              value === true
              ? false
              : value
          );
        },
      })
    );
    this.stopFeatureLayout = this.services.features.subscribe(() => {
      for (const [key, feature] of Object.entries(this.layoutFeatures))
        if (!this.services.features.isAvailable(feature))
          Reflect.set(this.layout, key, false);
    });
    this.beforeZenBars = undefined;
    this.beforeZen = undefined;
    this.stopMaximizedWatch = this.scope.run(() =>
      watch(
        () => [this.layout.panelVisible, this.layout.secondarySidebarVisible],
        () => {
          if (
            (this.layout.maximizedRegion === 'bottom' &&
              !this.layout.panelVisible) ||
            (this.layout.maximizedRegion === 'secondary' &&
              !this.layout.secondarySidebarVisible)
          )
            this.layout.maximizedRegion = null;
        },
        {flush: 'sync'}
      )
    )!;
    this.stopFeaturePresentation = this.services.features.subscribe(() => {
      if (!this.services.features.isAvailable('navigationBar'))
        this.services.rawNavigationBar.setVisible(false);
      if (!this.services.features.settings)
        this.services.modalRegistry.closeModal('frame.settings');
      if (!this.services.features.isAvailable('keybindings'))
        this.services.modalRegistry.closeModal('frame.keybindings');
    });
    this.layoutCustomizerOpen = shallowRef(false);
    for (const [key, feature] of Object.entries(this.layoutFeatures))
      if (!this.services.features.isAvailable(feature))
        Reflect.set(this.layout, key, false);
    this.layout.manageButtonPosition =
      this.services.options.manageButtonPosition ?? 'bottom';
  }

  /** Enters or leaves Zen mode while retaining the layout restoration snapshot. */
  setZenMode(enabled: boolean) {
    if (enabled === this.layout.zenMode) return;
    if (enabled) {
      this.beforeZenBars = {
        nav: this.services.navigationBar.visible.value,
        navPosition: this.services.navigationBar.position.value,
        panelBar: this.services.panelViewBar.visible.value,
      };
      this.services.navigationBar.setVisible(false);
      this.services.panelViewBar.setBarVisible(false);
      this.beforeZen = {
        menuBarVisible: this.layout.menuBarVisible,
        primaryViewBarVisible: this.layout.primaryViewBarVisible,
        secondaryViewBarVisible: this.layout.secondaryViewBarVisible,
        primarySidebarVisible: this.layout.primarySidebarVisible,
        secondarySidebarVisible: this.layout.secondarySidebarVisible,
        panelVisible: this.layout.panelVisible,
        bannerVisible: this.layout.bannerVisible,
        statusBarVisible: this.layout.statusBarVisible,
        centered: this.layout.centered,
      };
      Object.assign(this.layout, {
        menuBarVisible: false,
        primaryViewBarVisible: false,
        secondaryViewBarVisible: false,
        primarySidebarVisible: false,
        secondarySidebarVisible: false,
        panelVisible: false,
        bannerVisible: false,
        statusBarVisible: false,
        centered: true,
        zenMode: true,
      });
    } else {
      if (this.beforeZen) Object.assign(this.layout, this.beforeZen);
      if (this.beforeZenBars) {
        this.services.navigationBar.setPosition(this.beforeZenBars.navPosition);
        this.services.navigationBar.setVisible(this.beforeZenBars.nav);
        this.services.panelViewBar.setBarVisible(this.beforeZenBars.panelBar);
        this.beforeZenBars = undefined;
      }
      this.layout.zenMode = false;
      this.beforeZen = undefined;
    }
  }

  /** Restores configured shell layout while respecting feature availability. */
  resetLayout() {
    this.beforeZen = undefined;
    this.beforeZenBars = undefined;
    Object.assign(this.layout, defaultLayout(), {
      manageButtonPosition:
        this.services.options.manageButtonPosition ?? 'bottom',
    });
    this.services.status.resetPresentation();
    this.services.toolbar.reset();
    this.services.navigationBar.resetPresentation();
    this.services.primaryViewBar.resetPresentation();
    this.services.secondaryViewBar.resetPresentation();
    this.services.panel.resetPresentation();
    this.services.panelViewBar.resetPresentation();
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.stopFeatureLayout();
    this.stopMaximizedWatch();
    this.stopFeaturePresentation();
    this.scope.stop();
  }
}
