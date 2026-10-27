import type {LayoutState} from './layout';
import {
  computed,
  markRaw,
  reactive,
  shallowReactive,
  type Component,
} from 'vue';

/** Shell regions and bars that can anchor contributed dock content. */
export const dockAnchors = [
  'workspace',
  'primarySidebar',
  'secondarySidebar',
  'panel',
  'primaryViewBar',
  'secondaryViewBar',
  'panelViewBar',
  'navigationBar',
  'statusBar',
] as const;

/** Supported shell anchor identity for a dock. */
export type DockAnchor = (typeof dockAnchors)[number];

/** Physical edge of the resolved anchor region. */
export type DockEdge = 'top' | 'right' | 'bottom' | 'left';

/** Space reservation strategy relative to the anchor. */
export type DockPlacement = 'inside' | 'outside' | 'overlay';

/** Surface treatment independent of dock placement. */
export type DockAppearance = 'none' | 'basic' | 'padded';

/** Host registration data for retained dock content and its placement. */
export interface DockDefinition {

  /** Unique dock registration identity within one Frame. */
  id: string;

  /** Accessible description of the dock contribution. */
  label: string;

  /** Host-owned Vue content retained while this dock moves. */
  component: Component;

  /** Properties passed to the contributed component. */
  props?: Record<string, unknown>;

  /** Shell region or bar followed by the dock. */
  anchor: DockAnchor;

  /** Physical anchor edge used for placement. */
  edge: DockEdge;

  /** Whether the dock reserves internal, adjacent, or overlay space. */
  placement: DockPlacement;

  /** Themed surface treatment; defaults to padded. */
  appearance?: DockAppearance;

  /** Content inset independent of the surface appearance. */
  padding?: 'normal' | 'small' | 'none';

  /** Optional positive explicit width in pixels. */
  width?: number;

  /** Optional positive explicit height in pixels. */
  height?: number;

  /** Initial presentation visibility; defaults to true. */
  visible?: boolean;

  /** Ordering among docks sharing a location; defaults to zero. */
  order?: number;
}

/** Immutable dock snapshot with resolved presentation defaults. */
export type Dock = Readonly<
  DockDefinition & {
    appearance: DockAppearance;
    padding: 'normal' | 'small' | 'none';
    visible: boolean;
    order: number;
  }
>;

/** Validated changes to a dock, excluding its registration identity. */
export type DockUpdate = Partial<Omit<DockDefinition, 'id'>>;

/** Reserved pixels along each physical edge of a resolved shell region. */
export type DockSpace = Record<DockEdge, number>;

/** Creates independent zero reservation values for an unmeasured region. */
const emptySpace = (): DockSpace => ({top: 0, right: 0, bottom: 0, left: 0});

/** Validates a complete dock snapshot before registration or replacement. */
function validate(value: DockDefinition) {
  if (
    !value.id?.trim() ||
    !value.label?.trim() ||
    !value.component ||
    !dockAnchors.includes(value.anchor) ||
    !['top', 'right', 'bottom', 'left'].includes(value.edge) ||
    !['inside', 'outside', 'overlay'].includes(value.placement)
  )
    throw new Error('Invalid dock definition');
  if (
    value.appearance !== undefined &&
    !['none', 'basic', 'padded'].includes(value.appearance)
  )
    throw new Error('Invalid dock appearance');
  if (
    value.padding !== undefined &&
    !['normal', 'small', 'none'].includes(value.padding)
  )
    throw new Error('Invalid dock padding');
  for (const key of ['width', 'height'] as const)
    if (
      value[key] !== undefined &&
      (!Number.isFinite(value[key]) || value[key]! <= 0)
    )
      throw new Error(`Invalid dock ${key}`);
  if (value.order !== undefined && !Number.isFinite(value.order))
    throw new Error('Invalid dock order');
  if (value.visible !== undefined && typeof value.visible !== 'boolean')
    throw new Error('Invalid dock visibility');
}

/**
 * Owns dock registrations, retained hosts, and measured space for one Frame.
 * Host content keeps its identity while placement and anchor visibility change.
 */
export class DockRegistry {

  /** Reads feature availability for an anchor without owning host features. */
  private readonly available: (anchor: DockAnchor) => boolean;

  /** Reads anchor presentation independently of feature availability. */
  private readonly anchorVisible: (anchor: DockAnchor) => boolean;

  /** Immutable dock snapshots indexed by registration ID. */
  private readonly entries = shallowReactive(new Map<string, Dock>());

  /** Tokens prevent stale cleanup from removing replacement registrations. */
  private readonly owners = new Map<string, symbol>();

  /** Retained renderer hosts used to preserve component identity across moves. */
  readonly hosts = shallowReactive(new Map<string, HTMLElement>());

  /** Measured reserved space for each resolved shell region. */
  private readonly sizes = reactive<Record<string, DockSpace>>({});

  /** Latest measured viewport bounds for each dock anchor. */
  private readonly anchorRects = reactive<
    Record<
      string,
      {
        left: number;
        top: number;
        width: number;
        height: number;
      }
    >
  >({});

  /** Natural content sizes used by shell layout calculations. */
  private readonly intrinsicSizes = reactive<
    Record<
      string,
      {
        width: number;
        height: number;
      }
    >
  >({});

  /** Prevents registration and renderer updates after disposal. */
  private disposed = false;

  /** Reactive dock list sorted by explicit presentation order. */
  readonly items = computed<readonly Dock[]>(() =>
    [...this.entries.values()].sort((a, b) => a.order - b.order)
  );

  /** Creates an independently owned DockRegistry controller. */
  constructor(
    available: (anchor: DockAnchor) => boolean,
    anchorVisible: (anchor: DockAnchor) => boolean
  ) {
    this.available = available;
    this.anchorVisible = anchorVisible;
    this.remove = this.remove.bind(this);
    this.register = this.register.bind(this);
    this.update = this.update.bind(this);
    this.resolve = this.resolve.bind(this);
    this.at = this.at.bind(this);
    this.has = this.has.bind(this);
    this.setHost = this.setHost.bind(this);
    this.reportAnchor = this.reportAnchor.bind(this);
    this.anchorRect = this.anchorRect.bind(this);
    this.measure = this.measure.bind(this);
    this.space = this.space.bind(this);
    this.intrinsic = this.intrinsic.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.get = this.get.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Removes one dock and releases its retained renderer host. */
  remove(id: string) {
    this.owners.delete(id);
    this.hosts.delete(id);
    return this.entries.delete(id);
  }

  /** Registers a dock and returns identity-checked cleanup. */
  register(value: DockDefinition) {
    if (this.disposed) throw new Error('Frame docks disposed');
    if (this.entries.has(value.id))
      throw new Error(`Dock already registered: ${value.id}`);
    const entry = this.normalize(value),
      owner = Symbol(value.id);
    this.entries.set(value.id, entry);
    this.owners.set(value.id, owner);
    return () => {
      if (this.owners.get(value.id) === owner) this.remove(value.id);
    };
  }

  /** Validates a replacement snapshot before changing a registered dock. */
  update(id: string, patch: DockUpdate) {
    const entry = this.entries.get(id);
    if (this.disposed || !entry) return false;
    this.entries.set(id, this.normalize({...entry, ...patch, id}));
    return true;
  }

  /** Resolves availability, visibility, region, and hidden-anchor fallback placement. */
  resolve(id: string) {
    const dock = this.entries.get(id);
    if (!dock) return undefined;
    const enabled = !this.disposed && this.available(dock.anchor);
    const hidden = !this.anchorVisible(dock.anchor);
    const placement =
      hidden && dock.placement !== 'overlay' ? 'outside' : dock.placement;
    let region: string = dock.anchor;
    if (placement === 'outside') {
      if (dock.anchor === 'primarySidebar' || dock.anchor === 'primaryViewBar')
        region = 'primary';
      if (
        dock.anchor === 'secondarySidebar' ||
        dock.anchor === 'secondaryViewBar'
      )
        region = 'secondary';
      if (dock.anchor === 'panel' || dock.anchor === 'panelViewBar')
        region = 'bottom';
    }
    return {
      available: enabled,
      visible:
        enabled && dock.visible && !(hidden && dock.placement === 'overlay'),
      region,
      placement,
    };
  }

  /** Lists visible docks at one resolved region, placement, and optional edge. */
  at(region: string, placement: DockPlacement, edge?: DockEdge) {
    return this.items.value.filter((d) => {
      const r = this.resolve(d.id);
      return (
        r?.visible &&
        r.region === region &&
        r.placement === placement &&
        (!edge || d.edge === edge)
      );
    });
  }

  /** Reports whether a resolved region contains any visible docks. */
  has(region: string) {
    return this.items.value.some((d) => {
      const r = this.resolve(d.id);
      return r?.visible && r.region === region;
    });
  }

  /** Tracks renderer ownership without allowing stale unmounts to remove a newer host. */
  setHost(id: string, element: HTMLElement | null, previous?: HTMLElement) {
    if (this.disposed) return;
    if (element) this.hosts.set(id, element);
    else if (!previous || this.hosts.get(id) === previous)
      this.hosts.delete(id);
  }

  /** Stores anchor bounds only when movement exceeds the measurement tolerance. */
  reportAnchor(
    anchor: string,
    rect: {left: number; top: number; width: number; height: number}
  ) {
    if (this.disposed) return;
    const old = this.anchorRects[anchor];
    if (
      !old ||
      (['left', 'top', 'width', 'height'] as const).some(
        (k) => Math.abs(old[k] - rect[k]) > 0.25
      )
    )
      this.anchorRects[anchor] = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
  }

  /** Returns viewport bounds only while the anchor is visible. */
  anchorRect(anchor: DockAnchor) {
    return this.anchorVisible(anchor) ? this.anchorRects[anchor] : undefined;
  }

  /** Records reserved and intrinsic space without triggering subpixel update loops. */
  measure(region: string, space: DockSpace, intrinsic = {width: 0, height: 0}) {
    if (this.disposed) return;
    const old = this.sizes[region];
    if (
      !old ||
      (['top', 'right', 'bottom', 'left'] as const).some(
        (e) => Math.abs(old[e] - space[e]) > 0.25
      )
    )
      this.sizes[region] = space;
    const natural = this.intrinsicSizes[region];
    if (
      !natural ||
      Math.abs(natural.width - intrinsic.width) > 0.25 ||
      Math.abs(natural.height - intrinsic.height) > 0.25
    )
      this.intrinsicSizes[region] = intrinsic;
  }

  /** Returns reserved edge space or a fresh empty result for an unmeasured region. */
  space(region: string): DockSpace {
    return this.sizes[region] ?? emptySpace();
  }

  /** Returns measured natural dimensions or zero dimensions. */
  intrinsic(region: string) {
    return this.intrinsicSizes[region] ?? {width: 0, height: 0};
  }

  /** Updates dock presentation without ending its registration. */
  setVisible(id: string, visible: boolean) {
    return this.update(id, {visible});
  }

  /** Returns the immutable snapshot for a registered dock. */
  get(id: string) {
    return this.entries.get(id);
  }

  /** Makes a registered dock visible through the normal update path. */
  show(id: string) {
    return this.setVisible(id, true);
  }

  /** Hides presentation while retaining the dock registration and content. */
  hide(id: string) {
    return this.setVisible(id, false);
  }

  /** Toggles presentation through the normal update path. */
  toggle(id: string) {
    return this.setVisible(id, !this.entries.get(id)?.visible);
  }

  /** Releases registrations, hosts, and measurements owned by this registry. */
  dispose() {
    this.disposed = true;
    this.entries.clear();
    this.owners.clear();
    this.hosts.clear();
    for (const key of Object.keys(this.sizes)) delete this.sizes[key];
    for (const key of Object.keys(this.anchorRects))
      delete this.anchorRects[key];
    for (const key of Object.keys(this.intrinsicSizes))
      delete this.intrinsicSizes[key];
  }

  /** Validates and freezes a dock definition with resolved defaults. */
  private normalize(value: DockDefinition): Dock {
    validate(value);
    return Object.freeze({
      ...value,
      component: markRaw(value.component),
      appearance: value.appearance ?? 'padded',
      padding: value.padding ?? 'normal',
      visible: value.visible ?? true,
      order: value.order ?? 0,
    });
  }
}

/** Public controller contract retained for existing host integrations. */
export type DockController = Pick<DockRegistry, keyof DockRegistry>;

/** Resolves whether a dock anchor currently has a visible shell presentation. */
export function isDockAnchorVisible(
  anchor: DockAnchor,
  layout: LayoutState,
  navigationVisible: boolean,
  workspaceAvailable: boolean
): boolean {
  const visibility: Record<DockAnchor, boolean> = {
    workspace: workspaceAvailable,
    primarySidebar: layout.primarySidebarVisible,
    secondarySidebar: layout.secondarySidebarVisible,
    panel: layout.panelVisible,
    primaryViewBar:
      layout.primaryViewBarVisible &&
      (layout.primaryViewBarPosition === 'default' ||
        layout.primarySidebarVisible),
    secondaryViewBar:
      layout.secondaryViewBarVisible &&
      (layout.secondaryViewBarPosition === 'default' ||
        layout.secondarySidebarVisible),
    panelViewBar: layout.panelViewBarVisible && layout.panelVisible,
    navigationBar: navigationVisible,
    statusBar: layout.statusBarVisible,
  };
  return visibility[anchor];
}
