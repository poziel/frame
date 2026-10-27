import type {Component} from 'vue';
import type {ShallowRef} from 'vue';
import {markRaw, shallowRef} from 'vue';
import type {ShellLayout} from '../layout/shellLayout';

/** Public name for the root-owned workspace banner registration. */
export type BannerDefinition = WorkspaceBannerDefinition;

/** Host-owned banner content registered and presented by a Frame instance. */
export interface WorkspaceBannerDefinition {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}

/** Narrow dependencies connected by the owning Frame instance. */
export interface WorkspaceBannerServices {

  /** Owns feature-gated layout state, Zen restoration, and presentation reset. */
  readonly shellLayout: ShellLayout;
}

/**
 * Owns the host banner registration and its retained presentation lifecycle.
 * Hiding the banner and unregistering its content remain separate operations.
 */
export class WorkspaceBanner {

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: WorkspaceBannerServices;

  /** Retained host banner definition, independent of its visibility. */
  readonly workspaceBanner: ShallowRef<
    WorkspaceBannerDefinition | undefined,
    WorkspaceBannerDefinition | undefined
  >;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: WorkspaceBannerServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.registerWorkspaceBanner = this.registerWorkspaceBanner.bind(this);
    this.openWorkspaceBanner = this.openWorkspaceBanner.bind(this);
    this.closeWorkspaceBanner = this.closeWorkspaceBanner.bind(this);
    this.toggleWorkspaceBanner = this.toggleWorkspaceBanner.bind(this);

    this.workspaceBanner = shallowRef<WorkspaceBannerDefinition>();
  }

  /** Registers one host banner and returns identity-checked cleanup. */
  registerWorkspaceBanner(banner: WorkspaceBannerDefinition) {
    if (this.workspaceBanner.value)
      throw new Error('A banner is already registered');
    const definition = {...banner, component: markRaw(banner.component)};
    this.workspaceBanner.value = definition;
    return () => {
      if (this.workspaceBanner.value === definition) {
        this.workspaceBanner.value = undefined;
        this.services.shellLayout.layout.bannerVisible = false;
      }
    };
  }

  /** Reveals the retained banner when one is registered. */
  openWorkspaceBanner() {
    if (this.workspaceBanner.value)
      this.services.shellLayout.layout.bannerVisible = true;
  }

  /** Hides the banner while retaining its registration. */
  closeWorkspaceBanner() {
    this.services.shellLayout.layout.bannerVisible = false;
  }

  /** Toggles the registered banner presentation. */
  toggleWorkspaceBanner() {
    if (this.workspaceBanner.value)
      this.services.shellLayout.layout.bannerVisible =
        !this.services.shellLayout.layout.bannerVisible;
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.workspaceBanner.value = undefined;
    this.services.shellLayout.layout.bannerVisible = false;
  }
}
