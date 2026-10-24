import { shallowReactive, shallowRef, computed, type ComputedRef } from 'vue';
import type { SidePanelDefinition } from '../types';

export interface FeatureController {
  readonly available: boolean;
  setAvailable(value: boolean): void;
  enable(): void;
  disable(): void;
}
export interface PresentationController extends FeatureController {
  readonly visible: ComputedRef<boolean>;
  open(id?: string): void;
  close(): void;
  toggle(): void;
}

/** Availability is per Frame, independent of registration and presentation. */
export class FeatureRegistry {
  private states = shallowReactive(new Map<string, boolean>());
  private disposed = shallowRef(false);
  private listeners = new Set<() => void>();
  private parents = new Map([['primaryViewBar', 'primarySidebar'], ['secondaryViewBar', 'secondarySidebar'], ['panelViewBar', 'panel']]);
  constructor(initial: Readonly<Record<string, boolean>> = {}) {
    Object.entries(initial).forEach(([id, value]) => this.states.set(id, value));
  }
  isAvailable = (id: string): boolean => !this.disposed.value && (this.states.get(id) ?? true) && (!this.parents.has(id) || this.isAvailable(this.parents.get(id)!));
  setAvailable = (id: string, value: boolean): void => {
    if (this.disposed.value) return;
    if (!id.trim()) throw new Error('Feature ID must not be empty');
    this.states.set(id, value); this.listeners.forEach(listener => listener());
  };
  subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  /** Compatibility with existing boolean feature switches. */
  get settings() { return this.isAvailable('settings'); }
  set settings(value: boolean) { this.setAvailable('settings', value); }
  get navigation() { return this.isAvailable('navigation'); }
  set navigation(value: boolean) { this.setAvailable('navigation', value); }
  get notifications() { return this.isAvailable('notifications'); }
  set notifications(value: boolean) { this.setAvailable('notifications', value); }
  dispose() { this.disposed.value = true; this.listeners.forEach(listener => listener()); this.listeners.clear(); this.states.clear(); }
}

/** Shared implementation for independently controlled shell presentations. */
export class ShellPresentation implements PresentationController {
  readonly visible: ComputedRef<boolean>;
  constructor(private features: FeatureRegistry, readonly feature: string, readVisible: () => boolean,
    private showPresentation: (id?: string) => void, private hidePresentation: () => void) {
    this.visible = computed(() => this.available && readVisible());
  }
  get available() { return this.features.isAvailable(this.feature); }
  setAvailable = (value: boolean) => { this.features.setAvailable(this.feature, value); };
  enable = () => { this.setAvailable(true); };
  disable = () => { this.setAvailable(false); };
  open = (id?: string) => { if (this.available) this.showPresentation(id); };
  close = () => { this.hidePresentation(); };
  toggle = () => { if (this.available) { if (this.visible.value) this.close(); else this.open(); } };
}

export interface ViewContainerController extends PresentationController {
  readonly views: ComputedRef<readonly SidePanelDefinition[]>;
  register(view: SidePanelDefinition): () => void;
  select(id: string): void;
}

export class ShellViewContainer extends ShellPresentation implements ViewContainerController {
  readonly views: ComputedRef<readonly SidePanelDefinition[]>;
  readonly register: (view: SidePanelDefinition) => () => void;
  readonly select: (id: string) => void;
  constructor(features: FeatureRegistry, feature: string, readVisible: () => boolean,
    open: (id?: string) => void, close: () => void, views: () => readonly SidePanelDefinition[],
    register: (view: SidePanelDefinition) => () => void, select: (id: string) => void) {
    super(features, feature, readVisible, open, close);
    this.views = computed(views); this.register = register;
    this.select = id => { if (this.available) select(id); };
  }
}

/** Preserve existing specialized controller methods while adding the shared class contract. */
export function withPresentation<T extends object, P extends ShellPresentation>(controller: T, presentation: P): T & P {
  const descriptors = Object.getOwnPropertyDescriptors(controller);
  delete descriptors.visible;
  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (typeof descriptor.value === 'function' && /^(set|move|add|remove|activate)/.test(name)) {
      const run = descriptor.value;
      descriptor.value = (...args: unknown[]) => presentation.available ? run(...args) : name === 'addSeparator' ? undefined : false;
    }
  }
  Object.defineProperties(presentation, descriptors);
  return presentation as T & P;
}
