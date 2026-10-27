import type {Command, CommandOptions} from '../commands/command';
import {matchesShortcut} from '../shortcuts/shortcuts';

/** Context projection shared by keyboard dispatch and the binding editor. */
export interface ShortcutCondition {

  /** Human-readable condition expression supplied by the command. */
  label: string;

  /** Whether command gates and the current shortcut predicate both allow it. */
  active: boolean;
}

/**
 * Resolves keyboard events against live command bindings in registration order.
 * The registry supplies its execution gates, keeping feature and permission
 * enforcement authoritative without duplicating command state here.
 */
export class CommandShortcutResolver {

  /** Supplies the current ordered command handles. */
  private readonly list: () => readonly Command[];

  /** Supplies registered predicates and their display labels. */
  private readonly read: (id: string) => CommandOptions | undefined;

  /** Evaluates the owning registry's complete command execution gate. */
  private readonly enabled: (id: string) => boolean;

  /** Connects shortcut resolution to live, instance-owned command state. */
  constructor(
    list: () => readonly Command[],
    read: (id: string) => CommandOptions | undefined,
    enabled: (id: string) => boolean
  ) {
    this.list = list;
    this.read = read;
    this.enabled = enabled;
  }

  /** Describes and evaluates the same context used during keyboard dispatch. */
  condition(id: string): ShortcutCondition {
    const command = this.read(id);
    if (!command) return {label: 'false', active: false};
    return {
      label: command.whenLabel ?? (command.when ? 'customCondition' : 'true'),
      active: this.enabled(id) && (!command.when || command.when()),
    };
  }

  /** Returns the first matching command whose execution and context gates allow it. */
  resolve(event: KeyboardEvent): Command | undefined {
    return this.list().find(
      (command) =>
        command.shortcut &&
        matchesShortcut(event, command.shortcut) &&
        this.condition(command.id).active
    );
  }
}
