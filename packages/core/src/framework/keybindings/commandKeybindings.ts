import {shallowReactive} from 'vue';
import type {CommandOptions} from '../commands/command';
import {normalizeShortcut} from '../shortcuts/shortcuts';

/**
 * Owns reactive shortcut overrides for one command registry.
 * Defaults remain on command definitions; null overrides explicitly unbind them.
 * Bulk replacement validates every entry before changing the current overrides
 * and retains unknown IDs so persisted bindings can precede registration.
 */
export class CommandKeybindings {

  /** User overrides isolated from registered command defaults. */
  private readonly bindings = shallowReactive(new Map<string, string | null>());

  /** Reads current definitions without traversing live command handles. */
  private readonly read: (id: string) => CommandOptions | undefined;

  /** Connects binding lookup to the owning registry's authoritative definitions. */
  constructor(read: (id: string) => CommandOptions | undefined) {
    this.read = read;
  }

  /** Returns an override or the registered default; null removes the shortcut. */
  get(id: string): string | undefined {
    return this.bindings.has(id)
      ? (this.bindings.get(id) ?? undefined)
      : this.read(id)?.shortcut;
  }

  /** Returns a detached snapshot suitable for host persistence. */
  snapshot(): Readonly<Record<string, string | null>> {
    return Object.fromEntries(this.bindings);
  }

  /**
   * Normalizes and overrides a registered command's shortcut.
   * @throws If the command is unknown or a non-null shortcut is empty.
   */
  set(id: string, shortcut: string | null): void {
    if (!this.read(id)) throw new Error(`Unknown command: ${id}`);
    if (shortcut !== null && !shortcut.trim()) {
      throw new Error('Shortcut must not be empty; use null to remove it');
    }
    this.bindings.set(
      id,
      shortcut === null ? null : normalizeShortcut(shortcut)
    );
  }

  /** Removes an override so the current registered default applies again. */
  reset(id: string): void {
    this.bindings.delete(id);
  }

  /**
   * Replaces overrides atomically, including IDs not yet registered.
   * @throws If an identifier or non-null shortcut is empty or invalid.
   */
  replace(input: Readonly<Record<string, string | null>>): void {
    const values = Object.entries(input).map(([id, shortcut]) => {
      if (
        !id.trim() ||
        (shortcut !== null &&
          (typeof shortcut !== 'string' || !shortcut.trim()))
      ) {
        throw new Error(`Invalid keybinding: ${id}`);
      }
      return [
        id,
        shortcut === null ? null : normalizeShortcut(shortcut),
      ] as const;
    });
    this.bindings.clear();
    for (const [id, shortcut] of values) this.bindings.set(id, shortcut);
  }

  /** Releases the overrides owned by the disposing registry. */
  dispose(): void {
    this.bindings.clear();
  }
}
