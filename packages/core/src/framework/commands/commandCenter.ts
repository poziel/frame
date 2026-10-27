import type {QuickPickItem, QuickPickOptions} from '../../components/framework/quickPick';
import type {Command, CommandRegistration} from './command';
import type {CommandRegistry} from './commandRegistry';

/** A navigable submenu registered as one discoverable command. */
export interface CommandCenterSubmenuOptions extends QuickPickOptions {

  /** Unique command identifier for opening this submenu. */
  id: string;

  /** Optional feature ownership for the submenu-opening command. */
  feature?: string;

  /** Root command destination; defaults to application commands. */
  scope?: 'application' | 'frame';

  /** Permissions required to open and complete the submenu. */
  requires?: readonly string[];

  /** Explicit target used when checking submenu permissions. */
  context?: () => unknown;

  /** Additional synchronous prerequisites for opening the submenu. */
  enabled?: boolean | (() => boolean);

  /** Label displayed in the root command list. */
  label: string;

  /** Registered commands, local choices, structural rows, and nested submenus. */
  items: readonly (QuickPickItem | Command | CommandRegistration)[];
}

/** Navigation state retained while visiting child submenus. */
interface SubmenuState {

  /** Entries and presentation for this submenu. */
  submenu: CommandCenterSubmenuOptions;

  /** Search text and keyboard highlight restored on Back. */
  position: {
    query: string;
    selectedId: string;
  };
}

/** Coordinates command-backed submenus through the reusable QuickPick surface. */
export class CommandCenter {

  /** Registry providing authoritative command state and execution. */
  private readonly commands: CommandRegistry;

  /** Page registration cleanup owned by this controller. */
  private readonly registrations = new Set<CommandRegistration>();

  /** Invalidates pending navigation after disposal or replacement. */
  private revision = 0;

  /** Registered submenu commands addressable by their stable IDs. */
  private readonly submenus = new Map<string, CommandCenterSubmenuOptions>();

  /** Prevents registration after disposal. */
  private disposed = false;

  /**
   * Existing Frame-owned picker service.
   *
   * @typeParam T - Type of the synchronous source value.
   *
   * @param items - Input supplied to this operation.
   * @param options - Initial registration data retained by the owning object.
   */
  private readonly pick: <T extends QuickPickItem>(
    items: readonly T[],
    options?: QuickPickOptions
  ) => Promise<T | undefined>;

  /** Opens the existing root command experience. */
  private readonly openRoot: () => void;

  /** Closes the current Frame-owned picker. */
  private readonly closePicker: () => void;

  /**
   * Connects navigation to the existing instance-owned command and picker
   * services.
   *
   * @param commands - Per-Frame command registry used for state and execution.
   * @param pick - Opens the reusable picker and resolves its selection or
   * cancellation.
   * @param openRoot - Opens the existing root command experience.
   * @param closePicker - Dismisses the current Frame-owned picker.
   */
  constructor(
    commands: CommandRegistry,
    pick: CommandCenter['pick'],
    openRoot: () => void = () => {},
    closePicker: () => void = () => {}
  ) {
    this.commands = commands;
    this.pick = pick;
    this.openRoot = openRoot;
    this.closePicker = closePicker;
  }

  /**
   * Registers a root command that opens this submenu.
   *
   * @param submenu - Page definition and mixed entries registered as one root
   * command.
   *
   * @returns The live submenu-opening command, including unregister operations.
   *
   * @throws If disposed or the submenu-opening command cannot be registered.
   */
  register(submenu: CommandCenterSubmenuOptions): CommandRegistration {
    if (this.disposed) {
      throw new Error('Command Center is disposed');
    }
    const registration = this.commands.register({
      id: submenu.id,
      label: submenu.label,
      feature: submenu.feature,
      scope: submenu.scope,
      requires: submenu.requires,
      context: submenu.context,
      enabled: submenu.enabled,
      run: async () => {
        await this.open(submenu);
      },
    });
    this.registrations.add(registration);
    this.submenus.set(submenu.id, submenu);
    return registration;
  }

  /**
   * Opens mixed entries, retaining parent search and selection on Back.
   *
   * @param submenuOrId - Registered submenu ID or submenu definition; omit to open root
   * commands.
   *
   * @returns The final selected entry, or undefined on cancellation or blocked
   * access.
   *
   * @throws If a submenu ID is unknown, picker entries are invalid, or a selected
   * local action fails.
   */
  async open(
    submenuOrId?: CommandCenterSubmenuOptions | string
  ): Promise<QuickPickItem | undefined> {
    if (this.disposed) {
      return;
    }
    if (submenuOrId === undefined) {
      this.openRoot();
      return;
    }
    const submenu =
      typeof submenuOrId === 'string'
        ? this.get(submenuOrId)
          ? this.submenus.get(submenuOrId)
          : undefined
        : submenuOrId;
    if (!submenu) {
      throw new Error('Unknown Command Center submenu: ' + submenuOrId);
    }
    if (this.commands.get(submenu.id) && !this.commands.isEnabled(submenu.id)) {
      return;
    }
    const owner = this.commands.get(submenu.id);
    const revision = ++this.revision;
    const stack: SubmenuState[] = [
      {submenu, position: {query: '', selectedId: ''}},
    ];
    while (!this.disposed && revision === this.revision && stack.length) {
      const current = stack[stack.length - 1]!;
      const entries = current.submenu.items
        .map((item) => this.resolve(item, owner))
        .filter((item) => item !== undefined);
      const backId = '__frame_command_center_back__';
      if (entries.some((item) => item.id === backId)) {
        throw new Error('Reserved Command Center entry ID');
      }
      if (stack.length > 1) {
        entries.unshift({id: backId, label: 'Back'});
      }
      const selected = await this.pick(entries, {
        ...current.submenu,
        title: current.submenu.title ?? current.submenu.label,
        initialQuery: current.position.query,
        initialSelectedId: current.position.selectedId,
        onStateChange: (state) => {
          current.position = state;
        },
      });
      if (!selected || this.disposed || revision !== this.revision) {
        return;
      }
      if (selected.id === backId) {
        stack.pop();
        continue;
      }
      if (selected.items) {
        stack.push({
          submenu: {...selected, items: selected.items},
          position: {query: '', selectedId: ''},
        });
        continue;
      }
      if (
        !this.commands.isEnabled(submenu.id) &&
        this.commands.get(submenu.id)
      ) {
        return;
      }
      if (owner && this.commands.get(submenu.id) !== owner) {
        return;
      }
      await selected.run?.();
      return selected;
    }
  }

  /**
   * Looks up the live command used to open a registered submenu.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns The live submenu-opening command, or undefined if its registration
   * ended.
   */
  get(id: string): Command | undefined {
    return [...this.registrations].some(
      (registration) => registration.id === id && registration.registered
    )
      ? this.commands.get(id)
      : undefined;
  }

  /**
   * Closes navigation and resolves any pending picker without a choice.
   *
   * @remarks
   * Pending selection resolves without a choice and navigation cannot continue.
   */
  close(): void {
    this.revision++;
    this.closePicker();
  }

  /**
   * Removes owned submenu commands and stops pending navigation.
   *
   * @remarks
   * Owned submenu commands are unregistered and pending navigation is invalidated.
   */
  dispose(): void {
    this.disposed = true;
    this.revision++;
    for (const registration of this.registrations) {
      registration.unregister();
    }
    this.registrations.clear();
    this.submenus.clear();
  }

  /**
   * Projects live command state without converting ordinary choices into
   * commands.
   *
   * @param item - Command reference or local picker entry to project for
   * presentation.
   * @param owner - Optional submenu-opening command whose restrictions apply to
   * its entries.
   *
   * @returns An entry with live restrictions, or undefined for an invisible
   * command.
   */
  private resolve(
    item: QuickPickItem | Command | CommandRegistration,
    owner?: Command
  ): QuickPickItem | undefined {
    const commands = this.commands;
    if (!('unregister' in item)) {
      return {
        ...item,
        get disabled() {
          return !!item.disabled || (!!owner && !commands.isEnabled(owner.id));
        },
      };
    }
    if (!this.commands.isVisible(item.id)) {
      return;
    }
    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      detail: item.detail,
      available: () => commands.isVisible(item.id),
      get disabled() {
        return (
          !commands.isEnabled(item.id) ||
          (!!owner && !commands.isEnabled(owner.id))
        );
      },
      run: () => item.run(),
    };
  }
}
