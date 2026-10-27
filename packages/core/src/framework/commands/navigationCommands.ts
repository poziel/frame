import type {CommandRegistry} from './commandRegistry';
import type {ShellPresentation} from '../views/shellPresentation';
import type {NavigationBar} from '../views/navigationBar';
import type {ViewBadge} from '../layout/barTypes';
import type {NavigationItem} from '../views/navigationItems';

/** Narrow dependencies connected by the owning Frame instance. */
export interface NavigationCommandsServices {

  /** Navigation contributions and shared presentation guards. */
  readonly navigationBar: NavigationBar & ShellPresentation;

  /** Authoritative command registration, discovery, and guarded execution. */
  readonly commands: CommandRegistry;
}

/**
 * Binds navigation actions to the shared command execution and presentation gates.
 * Registrations retain independent cleanup and nested menu cycle validation.
 */
export class NavigationCommands {

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: NavigationCommandsServices;

  /** Original navigation registration before command-backed wrapping. */
  private readonly registerNavigationSource: (
    item: NavigationItem
  ) => () => void;

  /** Original navigation enabled-state lookup before command guards. */
  private readonly navigationItemEnabled: (id: string) => boolean;

  /** Original navigation state lookup before command guards. */
  private readonly navigationItemState: (id: string) =>
    | Readonly<{
        visible: boolean;
        badgeVisible: boolean;
        badge: ViewBadge | undefined;
      }>
    | undefined;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: NavigationCommandsServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.registerNavigationItem = this.registerNavigationItem.bind(this);

    this.registerNavigationSource = this.services.navigationBar.register;
    this.navigationItemEnabled = this.services.navigationBar.enabled;
    this.navigationItemState = this.services.navigationBar.getItemState;
    this.services.navigationBar.register = this.registerNavigationItem;
    this.services.navigationBar.enabled = (id) =>
      this.navigationItemEnabled(id) &&
      (this.services.navigationBar.find(id)?.type !== 'action' ||
        this.services.commands.isEnabled(id));
    this.services.navigationBar.getItemState = (id) => {
      const state = this.navigationItemState(id);
      return (
        state && {
          ...state,
          visible:
            state.visible &&
            (this.services.navigationBar.find(id)?.type !== 'action' ||
              this.services.commands.isVisible(id)),
        }
      );
    };
  }

  /** Registers command-backed navigation actions with complete cleanup. */
  registerNavigationItem(input: NavigationItem) {
    const owner = this;
    const removers: (() => void)[] = [];
    const visiting = new Set<NavigationItem>();
    function bind(item: NavigationItem): NavigationItem {
      if (visiting.has(item))
        throw new Error('Navigation items must not contain cycles');
      if (item.type === 'dropdown') {
        visiting.add(item);
        const result = {...item, items: item.items.map(bind)};
        visiting.delete(item);
        return result;
      }
      if (item.type !== 'action') return item;
      if (typeof item.run !== 'function')
        throw new Error(`Invalid navigation behavior: ${item.id}`);
      if (!owner.services.commands.get(item.id))
        removers.push(
          owner.services.commands.register({
            id: item.id,
            label: item.label,
            feature: 'navigationBar',
            enabled: () => !item.disabled,
            run: item.run,
          })
        );
      return {...item, run: () => owner.services.commands.execute(item.id)};
    }
    try {
      const remove = this.registerNavigationSource(bind(input));
      return () => {
        remove();
        removers.forEach((remove) => remove());
      };
    } catch (error) {
      removers.forEach((remove) => remove());
      throw error;
    }
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.services.navigationBar.register = this.registerNavigationSource;
    this.services.navigationBar.enabled = this.navigationItemEnabled;
    this.services.navigationBar.getItemState = this.navigationItemState;
  }
}
