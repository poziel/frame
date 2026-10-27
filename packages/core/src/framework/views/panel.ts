import type {ComputedRef, ShallowRef} from 'vue';
import {viewControllerKeys} from './withPresentation';
import {computed, shallowRef} from 'vue';
import type {
  PanelAlignment,
  PanelPosition,
  LayoutState,
} from '../layout/layout';

export type PanelDisplay = 'icons' | 'text' | 'both';

/** Panel Options contract used by its owning shell controller. */
export interface PanelOptions {

  /** Initial placement within the owning shell region. */
  position?: PanelPosition;

  /** Preferred panel alignment while top or bottom docking permits it. */
  alignment?: PanelAlignment;
}

/**
 * Controls panel docking and alignment through the existing layout state.
 * Hiding presentation retains registered views. Shell composition supplies
 * shared feature availability and container operations.
 */
export class Panel {

  /** Public projection used when composing this controller with shell availability. */
  readonly [viewControllerKeys] = [
    'position',
    'alignment',
    'canAlign',
    'setPosition',
    'setAlignment',
    'hide',
    'resetPresentation',
    'dispose',
  ] as const;

  /** Shared layout state; this controller never creates a parallel layout store. */
  private readonly layout: LayoutState;

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly options: PanelOptions;

  /** Prevents operations after this controller has released its resources. */
  private readonly disposed: ShallowRef<boolean, boolean>;

  /** Reactive placement read from the existing layout state. */
  readonly position: ComputedRef<PanelPosition>;

  /** Reactive panel alignment read from the existing layout. */
  readonly alignment: ComputedRef<PanelAlignment>;

  /** Whether the current panel docking position supports alignment changes. */
  readonly canAlign: ComputedRef<boolean>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(layout: LayoutState, options: PanelOptions = {}) {
    this.layout = layout;
    this.options = options;
    this.setPosition = this.setPosition.bind(this);
    this.setAlignment = this.setAlignment.bind(this);
    this.hide = this.hide.bind(this);
    this.resetPresentation = this.resetPresentation.bind(this);
    this.dispose = this.dispose.bind(this);
    this.disposed = shallowRef(false);
    this.position = computed(() => this.layout.panelPosition);
    this.alignment = computed(() => this.layout.panelAlignment);
    this.canAlign = computed(
      () =>
        this.layout.panelPosition === 'top' ||
        this.layout.panelPosition === 'bottom'
    );
    this.resetPresentation();
  }

  /** Changes presentation placement when the controller and layout permit it. */
  setPosition(value: PanelPosition) {
    if (
      this.disposed.value ||
      !['top', 'bottom', 'left', 'right'].includes(value)
    )
      return false;
    this.layout.panelPosition = value;
    return true;
  }

  /** Updates panel alignment only for a compatible docking position. */
  setAlignment(value: PanelAlignment) {
    if (
      this.disposed.value ||
      !this.canAlign.value ||
      !['left', 'right', 'center', 'justify'].includes(value)
    )
      return false;
    this.layout.panelAlignment = value;
    return true;
  }

  /** Hides the panel without disposing its registered content. */
  hide() {
    if (this.disposed.value) return false;
    this.layout.panelVisible = false;
    return true;
  }

  /** Restores configured presentation defaults without unregistering content. */
  resetPresentation() {
    if (this.disposed.value) return;
    this.setPosition(this.options.position ?? 'bottom');
    this.layout.panelAlignment = this.options.alignment ?? 'center';
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.disposed.value = true;
  }
}

export type PanelController = Panel &
  import('./shellViewContainer').ViewContainerController;
