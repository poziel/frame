import type {FrameMenuItem} from '../../components/navigation/generalMenu';
import {computed, shallowReactive, shallowRef, type ComputedRef} from 'vue';
import type {CommandOptions} from './command';
import {Command, type CommandRegistration} from './command';
import {CommandPrefixes} from './commandPrefixes';
import type {FeatureRegistry} from '../features/featureRegistry';
import type {PermissionRegistry} from '../permissions/permissionRegistry';
import {CommandKeybindings} from '../keybindings/commandKeybindings';
import {
  CommandShortcutResolver,
  type ShortcutCondition,
} from '../keybindings/commandShortcutResolver';

export interface CommandHookEvent {

  readonly id: string;

  readonly label: string;
}

export type CommandHookListener = (
  event: CommandHookEvent
) => void | Promise<void>;

/**
 * One execution gate shared by APIs, shortcuts, menus and retained command
 * references.
 */
export class CommandRegistry {

  /** Stable live command objects, independent of presentation projections. */
  private readonly handles = new Map<string, Command>();

  /**
   * Source callbacks distinguish regenerated resource commands from old
   * handles.
   */
  private readonly generatedSources = new Map<string, CommandOptions['run']>();

  /** Prefix categories used to navigate command lists. */
  readonly prefixes = new CommandPrefixes();

  /** Explicit restrictions retained independently of registered predicates. */
  private overrides = shallowReactive(
    new Map<
      string,
      {
        available?: boolean;
        enabled?: boolean;
        visible?: boolean;
      }
    >()
  );

  /** Prevents registration after the owning Frame is disposed. */
  private disposed = shallowRef(false);

  /** Instance-owned shortcut defaults and override storage. */
  private readonly keybindings: CommandKeybindings;

  /** Ordered keyboard matching and shortcut context evaluation. */
  private readonly shortcutResolver: CommandShortcutResolver;

  /**
   * Registration tokens preventing retained references from invoking
   * replacements.
   */
  private owners = new Map<string, symbol>();

  /** Completion listeners scoped to this Frame instance. */
  private completionHooks = new Set<{
    id?: string;
    listener: CommandHookListener;
  }>();

  /** Reactive command presentation shared by menus, shortcuts, and pickers. */
  readonly items: ComputedRef<readonly Command[]>;

  /** Authoritative definitions supplied by the owning Frame. */
  private readonly source: ComputedRef<readonly CommandOptions[]>;

  /** Feature availability shared with shell controllers. */
  private readonly features: FeatureRegistry;

  /** Permission evaluator shared with application-owned controls. */
  private readonly permissions?: PermissionRegistry;

  /** Dotted item lookup delegates to the same live objects as get(). */
  readonly [id: `${string}.${string}`]: Command;

  /**
   * Registers definitions through the existing Frame ownership contract.
   *
   * @param command - Command definition whose state or picker placement is
   * being resolved.
   */
  private readonly registerSource: (command: CommandOptions) => () => void;

  /**
   * Reports command failures through the owning Frame.
   *
   * @param command - Command definition whose state or picker placement is
   * being resolved.
   * @param error - Input supplied to this operation.
   */
  private readonly reportError: (
    command: CommandOptions,
    error: unknown
  ) => void;

  /**
   * Connects the registry to its instance-owned services.
   *
   * @param source - Authoritative reactive command definitions supplied by
   * Frame.
   * @param registerSource - Registers a definition and returns its ownership
   * cleanup.
   * @param features - Per-Frame feature availability shared with shell
   * controllers.
   * @param reportError - Reports action and completion-listener failures to the
   * host.
   * @param permissions - Optional per-Frame evaluator for required command
   * permissions.
   */
  constructor(
    source: ComputedRef<readonly CommandOptions[]>,
    registerSource: (command: CommandOptions) => () => void,
    features: FeatureRegistry,
    reportError: (command: CommandOptions, error: unknown) => void,
    permissions?: PermissionRegistry
  ) {
    this.source = source;
    this.registerSource = registerSource;
    this.features = features;
    this.reportError = reportError;
    this.permissions = permissions;
    this.keybindings = new CommandKeybindings((id) => this.read(id));
    this.shortcutResolver = new CommandShortcutResolver(
      () => this.items.value,
      (id) => this.read(id),
      (id) => this.isEnabled(id)
    );
    this.items = computed(() =>
      source.value.map((command) => this.get(command.id)!)
    );
  }

  /** Returns the effective shortcut, including overrides that unbind it. */
  getShortcut(id: string): string | undefined {
    return this.keybindings.get(id);
  }

  /** Returns a detached snapshot of host-persistable shortcut overrides. */
  getKeybindings = (): Readonly<Record<string, string | null>> =>
    this.keybindings.snapshot();

  /** Overrides a registered shortcut; null explicitly removes its binding. */
  setKeybinding = (id: string, shortcut: string | null) => {
    this.keybindings.set(id, shortcut);
  };

  /** Restores the command's registered default shortcut. */
  resetKeybinding = (id: string) => {
    this.keybindings.reset(id);
  };

  /** Atomically replaces persisted overrides, retaining future command IDs. */
  replaceKeybindings = (input: Readonly<Record<string, string | null>>) => {
    this.keybindings.replace(input);
  };

  /** Returns the shared keyboard-dispatch and binding-editor context. */
  getShortcutCondition = (id: string): ShortcutCondition =>
    this.shortcutResolver.condition(id);

  /** Returns the first enabled command matching the event and its context. */
  resolveShortcut = (event: KeyboardEvent) =>
    this.shortcutResolver.resolve(event);

  /**
   * Observe successful executions without replacing a command's handler.
   *
   * @param idOrListener - Command ID to observe, or a listener observing every
   * command.
   * @param listener - Callback invoked when the observed event occurs.
   *
   * @returns An idempotent callback that removes this subscription.
   *
   * @throws If the registry is disposed or no valid listener and command ID are
   * supplied.
   */
  hook: {
    (listener: CommandHookListener): () => void;
    (id: string, listener: CommandHookListener): () => void;
  } = (
    idOrListener: string | CommandHookListener,
    listener?: CommandHookListener
  ) => {
    if (this.disposed.value) {
      throw new Error('Command registry is disposed');
    }
    const callback = typeof idOrListener === 'string' ? listener : idOrListener;
    if (
      typeof callback !== 'function' ||
      (typeof idOrListener === 'string' && !idOrListener.trim())
    ) {
      throw new Error(
        'Command hook requires a listener and a nonempty command ID'
      );
    }
    const hook = {
      id: typeof idOrListener === 'string' ? idOrListener : undefined,
      listener: callback,
    };
    this.completionHooks.add(hook);
    return () => {
      this.completionHooks.delete(hook);
    };
  };

  /**
   * Coordinates this operation with its owning instance.
   *
   * @deprecated Use items.value or list().
   *
   * @returns The current live command objects.
   */
  get value() {
    return this.items.value;
  }

  /**
   * Registers an item and returns its live lifecycle operations.
   *
   * @param command - Command definition whose state or picker placement is
   * being resolved.
   *
   * @returns The live command API, also callable as legacy unregister cleanup.
   *
   * @throws If the registry is disposed, the definition is invalid, the
   * category is unknown, or the ID is reserved or duplicated.
   */
  register = (command: CommandOptions) => {
    if (this.disposed.value) {
      throw new Error('Command registry is disposed');
    }
    if (
      !command.id.trim() ||
      !command.label.trim() ||
      typeof command.run !== 'function'
    ) {
      throw new Error('Command requires an ID, label, and handler');
    }
    if (
      typeof command.quickInput === 'string' &&
      !this.prefixes.get(command.quickInput)
    ) {
      throw new Error(`Unknown command category: ${command.quickInput}`);
    }
    if (command.id in this) {
      throw new Error('Reserved or duplicate command ID: ' + command.id);
    }
    const remove = this.registerSource(command);
    this.owners.set(command.id, Symbol(command.id));
    let active = true;
    const cleanup = () => {
      if (!active) {
        return;
      }
      active = false;
      remove();
      this.overrides.delete(command.id);
      this.owners.delete(command.id);
      this.handles.delete(command.id);
      if (Object.prototype.hasOwnProperty.call(this, command.id)) {
        Reflect.deleteProperty(this, command.id);
      }
    };
    const item = new Command(command, this, cleanup);
    this.handles.set(command.id, item);
    if (!(command.id in this)) {
      Object.defineProperty(this, command.id, {
        configurable: true,
        get: () => this.get(command.id),
      });
    }
    return new Proxy(cleanup, {
      has: (target, key) => key in item || key in target,
      get: (_target, key) => {
        const value = Reflect.get(item, key);
        return typeof value === 'function' ? value.bind(item) : value;
      },
    }) as CommandRegistration;
  };

  /**
   * Returns the registered item without creating an application action.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns The live command, or undefined when no active definition exists.
   */
  get = (id: string): Command | undefined => {
    const definition = this.read(id);
    if (!definition) {
      return;
    }
    let item = this.handles.get(id);
    if (
      !this.owners.has(id) &&
      this.generatedSources.get(id) !== definition.run
    ) {
      item = undefined;
    }
    if (!item) {
      item = new Command(definition, this, () => {});
      this.handles.set(id, item);
      this.generatedSources.set(id, definition.run);
    }
    const metadata: Partial<CommandOptions> = {...definition};
    delete metadata.run;
    delete metadata.available;
    delete metadata.enabled;
    delete metadata.shortcut;
    Object.assign(item, metadata);
    return item;
  };

  /**
   * Lists current entries without exposing mutable registry storage.
   *
   * @returns The current live objects, including item-owned operations.
   */
  list = () => this.items.value;

  /**
   * Reads an authoritative definition only while this registry is active.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns The active source definition, or undefined after removal or
   * disposal.
   */
  private read = (id: string) =>
    this.disposed.value
      ? undefined
      : this.source.value.find((command) => command.id === id);

  /**
   * Checks feature ownership and command availability before presentation or
   * execution.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns Whether the command and its owning feature are available.
   */
  isAvailable = (id: string): boolean => {
    const command = this.read(id);
    return (
      !!command &&
      this.overrides.get(id)?.available !== false &&
      (!command.feature ||
        this.features.isAvailable(
          typeof command.feature === 'function'
            ? command.feature()
            : command.feature
        )) &&
      (typeof command.available === 'function'
        ? command.available()
        : (this.overrides.get(id)?.available ?? command.available !== false))
    );
  };

  /**
   * Combines availability, ancestor restrictions, permissions, and command
   * conditions.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns Whether every execution restriction currently allows the action.
   */
  isEnabled = (id: string): boolean => {
    const command = this.read(id);
    return (
      this.isAvailable(id) &&
      ![...this.overrides].some(
        ([prefix, state]) =>
          state.enabled === false &&
          (id === prefix || id.startsWith(prefix + '.'))
      ) &&
      (command?.requires ?? []).every(
        (permission) =>
          this.permissions?.check(permission, command?.context?.()).allowed ===
          true
      ) &&
      !!command &&
      (typeof command.enabled === 'function'
        ? command.enabled()
        : (this.overrides.get(id)?.enabled ?? command.enabled !== false))
    );
  };

  /**
   * Checks presentation independently of whether execution is enabled.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns Whether the command should appear in explicit presentations.
   */
  isVisible = (id: string): boolean => {
    const command = this.read(id);
    return (
      this.isAvailable(id) &&
      this.overrides.get(id)?.visible !== false &&
      !!command &&
      (typeof command.visible === 'function'
        ? command.visible()
        : (this.overrides.get(id)?.visible ?? command.visible !== false))
    );
  };

  /**
   * Updates an explicit restriction without changing registered conditions.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   * @param patch - Explicit state overrides to merge with existing
   * restrictions.
   *
   * @throws If the identifier is empty.
   */
  private update(
    id: string,
    patch: {
      available?: boolean;
      enabled?: boolean;
      visible?: boolean;
    }
  ) {
    if (!id.trim()) {
      throw new Error('Command ID must not be empty');
    }
    this.overrides.set(id, {...this.overrides.get(id), ...patch});
  }

  /**
   * Changes command availability while preserving its registration.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   * @param available - Whether the action may appear and execute.
   */
  setAvailable = (id: string, available: boolean) => {
    this.update(id, {available});
  };

  /**
   * Changes presentation without granting execution permission.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   * @param visible - Whether the action should appear without changing
   * execution permission.
   */
  setVisible = (id: string, visible: boolean) => {
    this.update(id, {visible});
  };

  /**
   * Removes this namespace’s manual disable restriction.
   *
   * @remarks
   * Enabling a parent does not clear independently disabled descendants.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   */
  enable = (id: string) => {
    this.update(id, {enabled: true});
  };

  /**
   * Blocks this namespace and dot-delimited descendants, including future
   * commands.
   *
   * @remarks
   * The prefix need not have a registered action. Later descendant
   * registrations inherit the restriction.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   */
  disable = (id: string) => {
    this.update(id, {enabled: false});
  };

  /**
   * Runs an enabled command, reports failures, and notifies completion
   * listeners.
   *
   * @remarks
   * Handler and completion-listener failures are reported through the
   * configured error callback. Blocked commands do not emit completion events.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns A promise settled after the handler and completion listeners
   * finish.
   *
   * @throws If an availability, permission, or enabled predicate throws before
   * action execution.
   */
  execute = async (id: string): Promise<void> => {
    const command = this.read(id);
    if (!command || !this.isEnabled(id)) {
      return;
    }
    try {
      await command.run();
    } catch (error) {
      this.reportError(command, error);
      return;
    }
    const event = Object.freeze({id: command.id, label: command.label});
    for (const hook of [...this.completionHooks]) {
      if (this.disposed.value) {
        break;
      }
      if (
        !this.completionHooks.has(hook) ||
        (hook.id !== undefined && hook.id !== id)
      ) {
        continue;
      }
      try {
        await hook.listener(event);
      } catch (error) {
        if (!this.disposed.value) {
          this.reportError(command, error);
        }
      }
    }
  };

  /**
   * Resolves automatic picker placement without changing direct execution
   * access.
   *
   * @param command - Command definition whose state or picker placement is
   * being resolved.
   *
   * @returns The automatic picker prefix, or false to omit automatic listing.
   */
  category = (command: CommandOptions): string | false =>
    command.commandCenter === false || command.quickInput === false
      ? false
      : typeof command.quickInput === 'string'
        ? command.quickInput
        : command.quickInput === true
          ? ''
          : command.scope === 'frame'
            ? '>'
            : '';

  /**
   * Releases owned state and prevents later command execution.
   *
   * @remarks
   * Retained command references stop executing and subscriptions are released.
   */
  dispose() {
    this.disposed.value = true;
    this.keybindings.dispose();
    this.prefixes.dispose();
    this.overrides.clear();
    this.owners.clear();
    this.completionHooks.clear();
    this.handles.clear();
    this.generatedSources.clear();
  }

  /** Projects command visibility, shortcuts, and enabled state into menu rows. */
  resolveMenuItems(items: readonly FrameMenuItem[]): FrameMenuItem[] {
    return items.flatMap<FrameMenuItem>((item) => {
      if (item.type === 'separator') return [item];
      if (item.command && !this.isVisible(item.command)) return [];
      const children = item.children
        ? this.resolveMenuItems(item.children)
        : undefined;
      if (item.children && !children?.length) return [];
      return [
        {
          ...item,
          ...(children ? {children} : {}),
          shortcut: item.command
            ? this.get(item.command)?.shortcut
            : item.shortcut,
          disabled:
            item.disabled ||
            (item.command ? !this.isEnabled(item.command) : false),
        },
      ];
    });
  }
}
