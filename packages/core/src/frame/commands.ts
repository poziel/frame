import { computed, shallowReactive, shallowRef, type ComputedRef } from 'vue';
import type { Command } from '../types';
import type { FeatureRegistry } from './features';

export interface CommandCategory { prefix: string; label: string; placeholder?: string }
export interface CommandHookEvent { readonly id: string; readonly label: string }
export type CommandHookListener = (event: CommandHookEvent) => void | Promise<void>;
export class CommandCategories {
  private entries = shallowReactive(new Map<string, CommandCategory>([['>', { prefix: '>', label: 'Frame commands', placeholder: 'Type a Frame command…' }]]));
  private disposed = false;
  register = (category: CommandCategory): (() => void) => {
    if (this.disposed) throw new Error('Command categories are disposed');
    if ([...category.prefix].length !== 1 || /[\p{L}\p{N}\s]/u.test(category.prefix) || !category.label.trim()) throw new Error('Category requires one symbol prefix and a label');
    if (this.entries.has(category.prefix)) throw new Error(`Command category already registered: ${category.prefix}`);
    const definition = Object.freeze({ ...category }); this.entries.set(category.prefix, definition);
    return () => { if (this.entries.get(category.prefix) === definition) this.entries.delete(category.prefix); };
  };
  get = (prefix: string) => this.entries.get(prefix);
  list = () => [...this.entries.values()];
  dispose() { this.disposed = true; this.entries.clear(); }
}

/** One execution gate shared by APIs, shortcuts, menus and retained command references. */
export class CommandRegistry {
  readonly categories = new CommandCategories();
  private overrides = shallowReactive(new Map<string, { available?: boolean; enabled?: boolean; visible?: boolean }>());
  private disposed = shallowRef(false);
  private owners = new Map<string, symbol>();
  private completionHooks = new Set<{ id?: string; listener: CommandHookListener }>();
  /** Observe successful executions without replacing a command's handler. */
  hook: {
    (listener: CommandHookListener): () => void;
    (id: string, listener: CommandHookListener): () => void;
  } = (idOrListener: string | CommandHookListener, listener?: CommandHookListener) => {
    if (this.disposed.value) throw new Error('Command registry is disposed');
    const callback = typeof idOrListener === 'string' ? listener : idOrListener;
    if (typeof callback !== 'function' || typeof idOrListener === 'string' && !idOrListener.trim()) throw new Error('Command hook requires a listener and a nonempty command ID');
    const hook = { id: typeof idOrListener === 'string' ? idOrListener : undefined, listener: callback };
    this.completionHooks.add(hook);
    return () => { this.completionHooks.delete(hook); };
  };
  readonly items: ComputedRef<readonly Command[]>;
  constructor(private source: ComputedRef<readonly Command[]>, private registerSource: (command: Command) => () => void,
    private features: FeatureRegistry, private reportError: (command: Command, error: unknown) => void) {
    this.items = computed(() => source.value.map(command => {
      const owner = this.owners.get(command.id);
      return { ...command,
        available: () => this.isAvailable(command.id), enabled: () => this.isEnabled(command.id),
        run: async () => { if (this.owners.get(command.id) === owner && this.source.value.find(item => item.id === command.id)?.run === command.run) await this.execute(command.id); },
      };
    }));
  }
  /** @deprecated Use items.value or list(). */
  get value() { return this.items.value; }
  register = (command: Command) => {
    if (this.disposed.value) throw new Error('Command registry is disposed');
    if (!command.id.trim() || !command.label.trim() || typeof command.run !== 'function') throw new Error('Command requires an ID, label, and handler');
    if (typeof command.quickInput === 'string' && !this.categories.get(command.quickInput)) throw new Error(`Unknown command category: ${command.quickInput}`);
    const remove = this.registerSource(command);
    this.owners.set(command.id, Symbol(command.id));
    let active = true;
    return () => { if (!active) return; active = false; remove(); this.overrides.delete(command.id); this.owners.delete(command.id); };
  };
  get = (id: string) => this.items.value.find(command => command.id === id);
  list = () => this.items.value;
  private read = (id: string) => this.disposed.value ? undefined : this.source.value.find(command => command.id === id);
  isAvailable = (id: string): boolean => {
    const command = this.read(id);
    return !!command && this.overrides.get(id)?.available !== false
      && (!command.feature || this.features.isAvailable(typeof command.feature === 'function' ? command.feature() : command.feature))
      && (typeof command.available === 'function' ? command.available() : this.overrides.get(id)?.available ?? command.available !== false);
  };
  isEnabled = (id: string): boolean => {
    const command = this.read(id);
    return this.isAvailable(id) && this.overrides.get(id)?.enabled !== false
      && !!command && (typeof command.enabled === 'function' ? command.enabled() : this.overrides.get(id)?.enabled ?? command.enabled !== false);
  };
  isVisible = (id: string): boolean => { const command = this.read(id); return this.isAvailable(id) && this.overrides.get(id)?.visible !== false && !!command && (typeof command.visible === 'function' ? command.visible() : this.overrides.get(id)?.visible ?? command.visible !== false); };
  private update(id: string, patch: { available?: boolean; enabled?: boolean; visible?: boolean }) { if (!this.read(id)) throw new Error(`Unknown command: ${id}`); this.overrides.set(id, { ...this.overrides.get(id), ...patch }); }
  setAvailable = (id: string, available: boolean) => { this.update(id, { available }); };
  setVisible = (id: string, visible: boolean) => { this.update(id, { visible }); };
  enable = (id: string) => { this.update(id, { enabled: true }); };
  disable = (id: string) => { this.update(id, { enabled: false }); };
  execute = async (id: string): Promise<void> => {
    const command = this.read(id); if (!command || !this.isEnabled(id)) return;
    try { await command.run(); } catch (error) { this.reportError(command, error); return; }
    const event = Object.freeze({ id: command.id, label: command.label });
    for (const hook of [...this.completionHooks]) {
      if (this.disposed.value) break;
      if (!this.completionHooks.has(hook) || hook.id !== undefined && hook.id !== id) continue;
      try { await hook.listener(event); } catch (error) { if (!this.disposed.value) this.reportError(command, error); }
    }
  };
  category = (command: Command): string | false => command.quickInput === false ? false : typeof command.quickInput === 'string' ? command.quickInput : command.quickInput === true ? '' : command.scope === 'frame' ? '>' : '';
  dispose() { this.disposed.value = true; this.categories.dispose(); this.overrides.clear(); this.owners.clear(); this.completionHooks.clear(); }
}
