import type {PanelAction} from './shellViewContainer';
import type {ShallowReactive} from 'vue';
import {reactive, readonly, shallowReactive} from 'vue';

/** Host feature bridge shared by alternate toolbar and status presentations. */
export interface ToolbarActionFeature {

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Current availability reported by the host-owned feature. */
  readonly enabled: boolean;

  /** Requests a feature availability change through its host owner. */
  setEnabled(enabled: boolean): void;
}

/** Registered shell action whose placement is coordinated by the Toolbar controller. */
export interface ToolbarAction extends PanelAction {

  /** Choose title-bar or status-bar presentation without changing the action. */
  placement?: ToolbarPlacement;

  /** Bridge features that already own an alternate status presentation. */
  onPlacementChange?: (placement: ToolbarPlacement) => void;

  /** Override automatic status presentation, independently of the title-bar gate. */
  showInStatusBar?: () => boolean;

  /** Whether the available action is pinned on the title bar. */
  visible?: boolean;

  /** Optional feature availability, independent of pinning. */
  feature?: ToolbarActionFeature;

  /** Whether this action currently belongs to the title bar (for movable indicators). */
  showInToolbar?: () => boolean;
}

export type ToolbarControl =
  | 'customize'
  | 'primary'
  | 'bottom'
  | 'secondary'
  | 'commandCenter'
  | 'layoutControls';

export type ToolbarButton = 'customize' | 'primary' | 'bottom' | 'secondary';

export type ToolbarItemId = ToolbarButton | `action:${string}`;

export type ToolbarPlacement = Readonly<
  | {area: 'titleBar'}
  | {area: 'statusBar'; side?: 'left' | 'right'; order?: number}
>;

export type ToolbarOptions = Partial<Record<ToolbarControl, boolean>> & {
  /** Allow the title-bar customization context menu. Default: true. */ contextMenu?: boolean;
  placements?: Readonly<Partial<Record<ToolbarItemId, ToolbarPlacement>>>;
};

const titlePlacement: ToolbarPlacement = Object.freeze({area: 'titleBar'});

export function validToolbarPlacement(value: ToolbarPlacement): boolean {
  return (
    !!value &&
    (value.area === 'titleBar' ||
      (value.area === 'statusBar' &&
        (value.side === undefined ||
          value.side === 'left' ||
          value.side === 'right') &&
        (value.order === undefined || Number.isFinite(value.order))))
  );
}

const buttonIds = new Set(['customize', 'primary', 'bottom', 'secondary']);

const samePlacement = (first: ToolbarPlacement, second: ToolbarPlacement) =>
  first.area === second.area &&
  (first.area === 'titleBar' ||
    (second.area === 'statusBar' &&
      first.side === second.side &&
      first.order === second.order));

const defaults: Record<ToolbarControl, boolean> = {
  customize: true,
  primary: false,
  bottom: false,
  secondary: false,
  commandCenter: true,
  layoutControls: true,
};

/**
 * Owns per-Frame toolbar visibility and placement preferences.
 * Application actions retain their own registration and execution lifecycle;
 * this controller coordinates their title-bar or status-bar presentation.
 */
export class Toolbar {

  /** Host configuration retained for validation, defaults, and reset operations. */
  private readonly options: ToolbarOptions;

  /** Reads current application toolbar actions without owning their registrations. */
  private readonly actions: () => readonly ToolbarAction[];

  /** Whether toolbar customization menus are enabled for this instance. */
  private readonly sourceContextMenuEnabled: boolean;

  /** Initial configuration retained for registration defaults and reset operations. */
  private readonly initial: {
    bottom: boolean;
    customize: boolean;
    primary: boolean;
    secondary: boolean;
    commandCenter: boolean;
    layoutControls: boolean;
  };

  /** Reactive toolbar visibility preferences exposed to consumers. */
  private readonly sourceControls: {
    bottom: boolean;
    customize: boolean;
    primary: boolean;
    secondary: boolean;
    commandCenter: boolean;
    layoutControls: boolean;
  };

  /** Validated configured placements used before user overrides. */
  private readonly initialPlacements: Map<ToolbarItemId, ToolbarPlacement>;

  /** User placement overrides retained independently of action registration. */
  private readonly placements: ShallowReactive<
    Map<ToolbarItemId, ToolbarPlacement>
  >;

  /** Prevents operations after this controller has released its resources. */
  private disposed: boolean;

  /** Reactive toolbar visibility preferences exposed to consumers. */
  readonly controls: {
    readonly bottom: boolean;
    readonly customize: boolean;
    readonly primary: boolean;
    readonly secondary: boolean;
    readonly commandCenter: boolean;
    readonly layoutControls: boolean;
  };

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(
    options: ToolbarOptions = {},
    actions: () => readonly ToolbarAction[]
  ) {
    this.options = options;
    this.actions = actions;
    this.getPlacement = this.getPlacement.bind(this);
    this.setPlacement = this.setPlacement.bind(this);
    this.forgetAction = this.forgetAction.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.toggle = this.toggle.bind(this);
    this.setActionVisible = this.setActionVisible.bind(this);
    this.setActionEnabled = this.setActionEnabled.bind(this);
    this.reset = this.reset.bind(this);
    this.dispose = this.dispose.bind(this);
    this.sourceContextMenuEnabled = this.options.contextMenu !== false;
    this.initial = {...defaults};
    for (const key of Object.keys(defaults) as ToolbarControl[])
      if (typeof this.options[key] === 'boolean')
        this.initial[key] = this.options[key]!;
    this.sourceControls = reactive({...this.initial});
    this.initialPlacements = new Map<ToolbarItemId, ToolbarPlacement>();
    for (const [id, placement] of Object.entries(
      this.options.placements ?? {}
    )) {
      if (
        (!buttonIds.has(id) && !/^action:.+/.test(id)) ||
        !validToolbarPlacement(placement!)
      )
        throw new Error(`Invalid toolbar placement: ${id}`);
      this.initialPlacements.set(
        id as ToolbarItemId,
        Object.freeze({...placement!})
      );
    }
    this.placements = shallowReactive(
      new Map<ToolbarItemId, ToolbarPlacement>()
    );
    this.disposed = false;
    this.controls = readonly(this.sourceControls);
  }

  /** Reads the effective title-bar or status-bar placement for one toolbar item. */
  getPlacement(id: ToolbarItemId): ToolbarPlacement {
    return (
      this.placements.get(id) ??
      this.initialPlacements.get(id) ??
      (id.startsWith('action:')
        ? this.actions().find((action) => action.id === id.slice(7))?.placement
        : undefined) ??
      titlePlacement
    );
  }

  /** Validates and changes placement, notifying an application-owned action when needed. */
  setPlacement(id: ToolbarItemId, placement: ToolbarPlacement) {
    if (
      this.disposed ||
      (!buttonIds.has(id) &&
        !(
          id.startsWith('action:') &&
          this.actions().some((action) => action.id === id.slice(7))
        )) ||
      !validToolbarPlacement(placement)
    )
      return false;
    const previous = this.getPlacement(id);
    if (samePlacement(previous, placement)) return true;
    const next = Object.freeze({...placement});
    this.placements.set(id, next);
    if (id.startsWith('action:'))
      this.actions()
        .find((action) => action.id === id.slice(7))
        ?.onPlacementChange?.(next);
    return true;
  }

  /** Drops placement overrides after the corresponding action registration ends. */
  forgetAction(id: string) {
    this.placements.delete(`action:${id}`);
  }

  /** Reads the effective visibility preference of a registered contribution. */
  isVisible(control: ToolbarControl) {
    return this.sourceControls[control];
  }

  /** Changes visibility through the existing registration or presentation state. */
  setVisible(control: ToolbarControl, visible: boolean) {
    if (
      this.disposed ||
      !Object.prototype.hasOwnProperty.call(defaults, control)
    )
      return false;
    this.sourceControls[control] = visible;
    return true;
  }

  /** Flips one toolbar control visibility preference. */
  toggle(control: ToolbarControl) {
    return this.setVisible(control, !this.isVisible(control));
  }

  /** Changes an application toolbar action visibility without unregistering it. */
  setActionVisible(id: string, visible: boolean) {
    if (this.disposed) return false;
    const action = this.actions().find((item) => item.id === id);
    if (!action) return false;
    action.visible = visible;
    return true;
  }

  /** Changes an application action feature state through its installed feature handle. */
  setActionEnabled(id: string, enabled: boolean) {
    if (this.disposed) return false;
    const action = this.actions().find((item) => item.id === id);
    if (!action?.feature) return false;
    action.feature.setEnabled(enabled);
    return true;
  }

  /** Restores configured toolbar visibility and placement defaults. */
  reset() {
    if (!this.disposed) {
      const previous = new Map(
        this.actions().map((action) => [
          action.id,
          this.getPlacement(`action:${action.id}`),
        ])
      );
      Object.assign(this.sourceControls, this.initial);
      this.placements.clear();
      for (const action of this.actions()) {
        const next = this.getPlacement(`action:${action.id}`);
        if (!samePlacement(previous.get(action.id)!, next))
          action.onPlacementChange?.(next);
      }
    }
  }

  /** Whether toolbar customization menus are enabled for this instance. */
  get contextMenuEnabled() {
    return this.sourceContextMenuEnabled;
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.disposed = true;
    Object.assign(this.sourceControls, this.initial);
    this.placements.clear();
  }
}
