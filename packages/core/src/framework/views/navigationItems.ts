import type {ComputedRef, ShallowReactive, ShallowRef} from 'vue';
import {computed, markRaw, shallowReactive, shallowRef} from 'vue';
import type {Component} from 'vue';
import type {ViewBadge} from '../layout/barTypes';

/** Navigation Base contract used by its owning shell controller. */
interface NavigationBase {

  /** Stable identifier within the owning registration collection. */
  id: string;

  /** Initial visibility preference; hiding retains the registration. */
  visible?: boolean;

  /** Whether the user may reorder or move this contribution. */
  draggable?: boolean;
}

/** Named Navigation Item contract used by its owning shell controller. */
interface NamedNavigationItem extends NavigationBase {

  /** Human-readable and accessible name for this contribution. */
  label: string;

  /** Optional icon displayed with the contribution. */
  icon?: Component;

  /** Optional badge supplied by the host contribution. */
  badge?: ViewBadge;

  /** Whether activation is temporarily blocked while the item remains registered. */
  disabled?: boolean;
}

/** Navigation Action Item contract used by its owning shell controller. */
export interface NavigationActionItem extends NamedNavigationItem {

  /** Discriminant selecting the supported item behavior. */
  type: 'action';

  /** Action invoked when this contribution is activated. */
  run: () => void | Promise<void>;

  /** Static or reactive indication that this navigation destination is selected. */
  active?: boolean | (() => boolean);
}

/** Navigation Link Item contract used by its owning shell controller. */
export interface NavigationLinkItem extends NamedNavigationItem {

  /** Discriminant selecting the supported item behavior. */
  type: 'link';

  /** Host navigation destination for this link. */
  href: string;

  /** Optional host target for opening the link. */
  target?: string;

  /** Optional relationship attributes supplied to the host link adapter. */
  rel?: string;

  /** Optional application-owned navigation override for this link. */
  onNavigate?: (href: string) => void | Promise<void>;

  /** Static or reactive indication that this navigation destination is selected. */
  active?: boolean | (() => boolean);
}

/** Navigation Dropdown Item contract used by its owning shell controller. */
export interface NavigationDropdownItem extends NamedNavigationItem {

  /** Discriminant selecting the supported item behavior. */
  type: 'dropdown';

  /** Nested navigation contributions retained in their declared order. */
  items: readonly NavigationItem[];
}

/** Navigation Separator Item contract used by its owning shell controller. */
export interface NavigationSeparatorItem extends NavigationBase {

  /** Discriminant selecting the supported item behavior. */
  type: 'separator';

  /** Human-readable and accessible name for this contribution. */
  label?: string;

  /** Whether user-facing removal of this separator is permitted. */
  allowRemove?: boolean;
}

export type NavigationItem =
  | NavigationActionItem
  | NavigationLinkItem
  | NavigationDropdownItem
  | NavigationSeparatorItem;

/** Navigation Services contract used by its owning shell controller. */
export interface NavigationServices {

  /** Delegates link activation to the host application. */
  navigate(href: string, target?: string, rel?: string): void | Promise<void>;

  /** Reports a contribution failure without throwing from UI event handling. */
  reportError(label: string, error: unknown): void;
}

/**
 * Owns action, link, dropdown, and separator registrations for navigation.
 * Maintains item identity, visibility, badges, and cleanup independently of
 * shell views; navigation actions never create or move view content.
 */
export class NavigationItems {

  /** Host navigation and error reporting used by contributed actions and links. */
  private readonly services: NavigationServices;

  /** Root navigation registrations in presentation order. */
  private readonly roots: ShallowReactive<NavigationItem[]>;

  /** Current position in the retained navigation history. */
  private readonly index: ShallowReactive<
    Map<string, {item: NavigationItem; parent?: string}>
  >;

  /** Per-item visibility overrides retained independently of registration data. */
  private readonly visibility: ShallowReactive<Map<string, boolean>>;

  /** Per-item badge visibility overrides. */
  private readonly badges: ShallowReactive<Map<string, boolean>>;

  /** Per-item badge values or fallback presentation data. */
  private readonly values: ShallowReactive<Map<string, ViewBadge | undefined>>;

  /** Cleanup operations for registrations and observers owned by this controller. */
  private readonly removers: Map<string, () => void>;

  /** Prevents operations after this controller has released its resources. */
  private readonly disposed: ShallowRef<boolean, boolean>;

  /** Reactive projection of current registrations and effective presentation preferences. */
  readonly items: ComputedRef<readonly NavigationItem[]>;

  /** Connects the controller to its existing per-Frame services and configuration. */
  constructor(services: NavigationServices) {
    this.services = services;
    this.find = this.find.bind(this);
    this.register = this.register.bind(this);
    this.removeSeparator = this.removeSeparator.bind(this);
    this.getItemState = this.getItemState.bind(this);
    this.enabled = this.enabled.bind(this);
    this.activate = this.activate.bind(this);
    this.moveItem = this.moveItem.bind(this);
    this.setItemVisible = this.setItemVisible.bind(this);
    this.setBadgeVisible = this.setBadgeVisible.bind(this);
    this.setBadge = this.setBadge.bind(this);
    this.dispose = this.dispose.bind(this);
    this.roots = shallowReactive<NavigationItem[]>([]);
    this.index = shallowReactive(
      new Map<
        string,
        {
          item: NavigationItem;
          parent?: string;
        }
      >()
    );
    this.visibility = shallowReactive(new Map<string, boolean>());
    this.badges = shallowReactive(new Map<string, boolean>());
    this.values = shallowReactive(new Map<string, ViewBadge | undefined>());
    this.removers = new Map<string, () => void>();
    this.disposed = shallowRef(false);
    this.items = computed<readonly NavigationItem[]>(() =>
      this.disposed.value ? [] : Object.freeze([...this.roots])
    );
  }

  /** Looks up a current registration without creating or replacing its identity. */
  find(id: string) {
    return this.disposed.value ? undefined : this.index.get(id)?.item;
  }

  /** Registers a contribution and returns cleanup scoped to that exact registration. */
  register(input: NavigationItem) {
    const owner = this;
    if (owner.disposed.value) throw new Error('Frame is disposed');
    const pending = new Map<
      string,
      {
        item: NavigationItem;
        parent?: string;
      }
    >();
    const visiting = new Set<NavigationItem>();
    function copy(item: NavigationItem, parent?: string): NavigationItem {
      if (
        !item ||
        typeof item.id !== 'string' ||
        !item.id ||
        visiting.has(item) ||
        pending.has(item.id) ||
        owner.index.has(item.id)
      )
        throw new Error(`Invalid or duplicate navigation item: ${item?.id}`);
      if (!['action', 'link', 'dropdown', 'separator'].includes(item.type))
        throw new Error(`Unknown navigation item type: ${item.id}`);
      const allowed = new Set([
        'id',
        'type',
        'label',
        'visible',
        'draggable',
        ...(item.type === 'separator'
          ? ['allowRemove']
          : ['icon', 'badge', 'disabled']),
        ...(item.type === 'action'
          ? ['run', 'active']
          : item.type === 'link'
            ? ['href', 'target', 'rel', 'onNavigate', 'active']
            : item.type === 'dropdown'
              ? ['items']
              : []),
      ]);
      if (Object.keys(item).some((key) => !allowed.has(key)))
        throw new Error(`Mixed or unknown navigation fields: ${item.id}`);
      if ('component' in item || 'region' in item || 'bar' in item)
        throw new Error(
          'Navigation items cannot contain view placement or content'
        );
      if (item.type !== 'separator' && typeof item.label !== 'string')
        throw new Error(`Navigation item requires a label: ${item.id}`);
      if (
        (item.type === 'action' && typeof item.run !== 'function') ||
        (item.type === 'link' && typeof item.href !== 'string') ||
        (item.type === 'dropdown' && !Array.isArray(item.items))
      )
        throw new Error(`Invalid navigation behavior: ${item.id}`);
      visiting.add(item);
      const definition = {...item} as NavigationItem;
      pending.set(item.id, {item: definition, parent});
      if (definition.type !== 'separator' && definition.icon)
        definition.icon = markRaw(definition.icon);
      if (definition.type === 'dropdown' && item.type === 'dropdown')
        definition.items = Object.freeze(
          Array.from(item.items, (child) => copy(child, item.id))
        );
      visiting.delete(item);
      return Object.freeze(definition);
    }
    const root = copy(input);
    pending.forEach((entry, id) => owner.index.set(id, entry));
    owner.roots.push(root);
    const remove = () => {
      if (owner.index.get(root.id)?.item !== root) return;
      const at = owner.roots.indexOf(root);
      if (at >= 0) owner.roots.splice(at, 1);
      owner.removers.delete(root.id);
      pending.forEach((_entry, id) => {
        owner.index.delete(id);
        owner.visibility.delete(id);
        owner.badges.delete(id);
        owner.values.delete(id);
      });
    };
    owner.removers.set(root.id, remove);
    return remove;
  }

  /** Removes a registered separator when its editing permissions allow removal. */
  removeSeparator(id: string) {
    const item = this.find(id);
    if (
      item?.type !== 'separator' ||
      !item.allowRemove ||
      !this.removers.has(id)
    )
      return false;
    this.removers.get(id)!();
    return true;
  }

  /** Reads effective item visibility and badge preferences without exposing mutable maps. */
  getItemState(id: string) {
    const item = this.find(id);
    if (!item) return undefined;
    return Object.freeze({
      visible: this.visibility.get(id) ?? item.visible !== false,
      badgeVisible: item.type !== 'separator' && (this.badges.get(id) ?? true),
      badge:
        item.type === 'separator'
          ? undefined
          : this.values.has(id)
            ? this.values.get(id)
            : item.badge,
    });
  }

  /** Checks this item and its ancestors before allowing activation. */
  enabled(id: string): boolean {
    const entry = this.index.get(id);
    return (
      !this.disposed.value &&
      !!entry &&
      !!this.getItemState(id)?.visible &&
      !(entry.item.type !== 'separator' && entry.item.disabled) &&
      (!entry.parent || this.enabled(entry.parent))
    );
  }

  /** Executes an available item through its registered action or host navigation service. */
  async activate(id: string) {
    const item = this.find(id);
    if (
      !item ||
      !this.enabled(id) ||
      item.type === 'dropdown' ||
      item.type === 'separator'
    )
      return false;
    try {
      if (item.type === 'action') await item.run();
      else if (item.onNavigate) await item.onNavigate(item.href);
      else await this.services.navigate(item.href, item.target, item.rel);
      return !this.disposed.value && this.find(id) === item;
    } catch (error) {
      if (!this.disposed.value) this.services.reportError(item.label, error);
      return false;
    }
  }

  /** Reorders a registered root item while respecting drag restrictions. */
  moveItem(id: string, beforeId?: string) {
    const at = this.roots.findIndex((item) => item.id === id),
      before =
        beforeId === undefined
          ? this.roots.length
          : this.roots.findIndex((item) => item.id === beforeId);
    if (
      this.disposed.value ||
      at < 0 ||
      before < 0 ||
      this.roots[at]!.draggable === false
    )
      return false;
    if (id === beforeId) return true;
    const [item] = this.roots.splice(at, 1);
    this.roots.splice(before > at ? before - 1 : before, 0, item!);
    return true;
  }

  /** Updates the visibility preference for a registered navigation item. */
  setItemVisible(id: string, value: boolean) {
    if (!this.find(id)) return false;
    this.visibility.set(id, value);
    return true;
  }

  /** Updates the badge visibility preference for an existing contribution. */
  setBadgeVisible(id: string, value: boolean) {
    const item = this.find(id);
    if (!item || item.type === 'separator') return false;
    this.badges.set(id, value);
    return true;
  }

  /** Overrides the badge value without changing contribution registration. */
  setBadge(id: string, value?: ViewBadge) {
    const item = this.find(id);
    if (!item || item.type === 'separator') return false;
    this.values.set(id, value);
    return true;
  }

  /** Releases resources owned by this controller and prevents subsequent state changes. */
  dispose() {
    this.disposed.value = true;
    this.roots.splice(0);
    this.removers.clear();
    this.index.clear();
    this.visibility.clear();
    this.badges.clear();
    this.values.clear();
  }
}

/** Apply visibility before removing leading, trailing and adjacent separators. */
export function normalizeNavigationItems(
  items: readonly NavigationItem[],
  visible: (id: string) => boolean
): NavigationItem[] {
  const result: NavigationItem[] = [];
  for (const item of items)
    if (
      visible(item.id) &&
      (item.type !== 'separator' ||
        (result.length && result[result.length - 1]!.type !== 'separator'))
    )
      result.push(item);
  if (result[result.length - 1]?.type === 'separator') result.pop();
  return result;
}

/** Opens a browser link with opener isolation for external targets. */
export function navigateBrowserLink(
  href: string,
  target?: string,
  rel?: string
): void {
  if (typeof window === 'undefined') return;
  if (target && target !== '_self')
    window.open(
      href,
      target,
      rel?.split(/\s+/).includes('noreferrer')
        ? 'noopener,noreferrer'
        : 'noopener'
    );
  else window.location.assign(href);
}
