import type {Component} from 'vue';
import type {ViewBadge} from '../layout/barTypes';
import type {FrameMenuItem} from '../../components/navigation/generalMenu';
import {computed, type ComputedRef} from 'vue';

import type {FeatureRegistry} from '../features/featureRegistry';
import {
  ShellPresentation,
  type PresentationController,
} from './shellPresentation';

/** Optional host-owned content rendered above or below a registered view. */
export interface ViewContentSlot {

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;

  /** Whether the surface applies its standard content padding. */
  padded?: boolean;
}

/** Declarative view content, actions, and child sections retained by a shell container. */
export interface PanelDefinition {

  /** Render the bottom/secondary pane header. Defaults to true; false lets content supply its own toolbar. */
  showHeader?: boolean;

  /** CSS color for the view heading and selector label. Supports reactive getters. */
  titleColor?: string;

  /** Optional view-item badge; presentation is controlled by frame.primaryViewBar or frame.secondaryViewBar. */
  badge?: ViewBadge;

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Actions offered by the owning surface. */
  actions?: readonly PanelAction[];

  /** Whether the surface applies its standard content padding. */
  padded?: boolean;

  /** Optional content retained above the main view content. */
  top?: ViewContentSlot;

  /** Optional content retained below the main view content. */
  bottom?: ViewContentSlot;

  /** Whether pointer dragging is allowed for this contribution. */
  draggable?: boolean;

  /** Whether this contribution can move between eligible containers. */
  movable?: boolean;

  /** Initial collapsed state of this view section. */
  collapsed?: boolean;

  /** Initial presentation visibility; hiding does not unregister or dispose the view. */
  visible?: boolean;

  /** Host-supplied Vue component rendered for this contribution. */
  component?: Component;

  /** Nested definitions rendered and registered beneath this entry. */
  children?: readonly PanelDefinition[];

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}

/** View registration with optional primary activity-rail presentation. */
export interface SidePanelDefinition extends PanelDefinition {

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Whether this view contributes an activity-rail selector. */
  showInRail?: boolean;
}

/** Shell container currently owning a registered view. */
export type ViewRegion = 'primary' | 'secondary' | 'bottom';

/** Action displayed by a view or shell surface, optionally opening a nested menu. */
export interface PanelAction {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Application callback invoked when the action is activated. */
  run: () => void;

  /** Whether user interaction with this entry is currently blocked. */
  disabled?: boolean;

  /** Optional nested menu displayed by this action. */
  menu?: readonly FrameMenuItem[];

  /** Receives a choice from the action's nested menu. */
  onSelect?: (item: FrameMenuItem) => void;
}

/** Public name for a shell view collection definition. */
export type MenuDefinition = PanelDefinition;

/** Public name for a registered view and its sidebar presentation options. */
export type ViewDefinition = SidePanelDefinition;

/** View Container Controller contract used by its owning shell controller. */
export interface ViewContainerController extends PresentationController {

  /** Reactive list of registered views. */
  readonly views: ComputedRef<readonly SidePanelDefinition[]>;

  /**
   * Registers a view with this container.
   *
   * @param view - View definition contributed to this container.
   *
   * @returns Cleanup that unregisters this view.
   */
  register(view: SidePanelDefinition): () => void;

  /**
   * Selects a registered view while the container is available.
   *
   * @param id - Registered view identifier; omit to use the existing selection.
   */
  select(id: string): void;
}

/**
 * Owns the registered views and presentation lifecycle of one shell container.
 */
export class ShellViewContainer
  extends ShellPresentation
  implements ViewContainerController
{

  /** Reactive list of registered views. */
  readonly views: ComputedRef<readonly SidePanelDefinition[]>;

  /**
   * Registers a view through the owning container.
   *
   * @param view - Input supplied to this operation.
   *
   * @returns Cleanup that unregisters the contributed view.
   */
  readonly register: (view: SidePanelDefinition) => () => void;

  /**
   * Selects a view only while the container is available.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   */
  readonly select: (id: string) => void;

  /**
   * Connects this object to its owning services.
   *
   * @param features - Per-Frame feature availability shared with shell
   * controllers.
   * @param feature - Feature identifier controlling this view container.
   * @param readVisible - Reads visibility from the existing presentation
   * controller.
   * @param open - Opens the existing view presentation.
   * @param close - Closes the existing view presentation without disposing its
   * views.
   * @param views - Reads the views currently registered in the container.
   * @param register - Registers a view and returns its unregister callback.
   * @param select - Selects a view through the existing container behavior.
   */
  constructor(
    features: FeatureRegistry,
    feature: string,
    readVisible: () => boolean,
    open: (id?: string) => void,
    close: () => void,
    views: () => readonly SidePanelDefinition[],
    register: (view: SidePanelDefinition) => () => void,
    select: (id: string) => void
  ) {
    super(features, feature, readVisible, open, close);
    this.views = computed(views);
    this.register = register;
    this.select = (id) => {
      if (this.available) {
        select(id);
      }
    };
  }
}
