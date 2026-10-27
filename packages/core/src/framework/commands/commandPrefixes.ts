import {shallowReactive} from 'vue';

export interface CommandPrefix {

  /** Unique single-symbol prefix used to enter this command category. */
  prefix: string;

  /** Human-readable category label. */
  label: string;

  /** Optional search hint displayed inside this category. */
  placeholder?: string;
}

/** Owns the command prefix categories available to one Frame. */
export class CommandPrefixes {

  /** Registered category definitions, tracked reactively for picker updates. */
  private entries = shallowReactive(
    new Map<string, CommandPrefix>([
      [
        '>',
        {
          prefix: '>',
          label: 'Frame commands',
          placeholder: 'Type a Frame command…',
        },
      ],
    ])
  );

  /** Prevents registration after the owning Frame is disposed. */
  private disposed = false;

  /**
   * Registers an item and returns its live lifecycle operations.
   *
   * @param category - Prefix category definition to add to this Frame.
   *
   * @returns Idempotent cleanup that removes this exact category definition.
   *
   * @throws If disposed, the prefix or label is invalid, or the prefix is
   * already registered.
   */
  register = (category: CommandPrefix): (() => void) => {
    if (this.disposed) {
      throw new Error('Command categories are disposed');
    }
    if (
      [...category.prefix].length !== 1 ||
      /[\p{L}\p{N}\s]/u.test(category.prefix) ||
      !category.label.trim()
    ) {
      throw new Error('Category requires one symbol prefix and a label');
    }
    if (this.entries.has(category.prefix)) {
      throw new Error(
        `Command category already registered: ${category.prefix}`
      );
    }
    const definition = Object.freeze({...category});
    this.entries.set(category.prefix, definition);
    return () => {
      if (this.entries.get(category.prefix) === definition) {
        this.entries.delete(category.prefix);
      }
    };
  };

  /**
   * Returns the registered item without creating an application action.
   *
   * @param prefix - Single-symbol category prefix to look up.
   *
   * @returns The category definition, or undefined if it is not registered.
   */
  get = (prefix: string) => this.entries.get(prefix);

  /**
   * Lists current entries without exposing mutable registry storage.
   *
   * @returns A snapshot of registered category definitions.
   */
  list = () => [...this.entries.values()];

  /**
   * Releases owned state and prevents later command execution.
   *
   * @remarks
   * Existing category definitions are removed and new registrations are
   * rejected.
   */
  dispose() {
    this.disposed = true;
    this.entries.clear();
  }
}
