import type {Frame} from '../frame';
import type {FrameMenuItem} from '../../components/navigation/generalMenu';

/**
 * Owns context-menu commands for one shell contribution.
 * Rebinding updates live actions and removes registrations no longer presented.
 */
export class ContextMenuCommands {

  /** Latest menu entries used by retained command callbacks. */
  private readonly current = new Map<string, FrameMenuItem>();

  /** Cleanup operations for commands owned by this menu. */
  private readonly removers = new Map<string, () => void>();

  /** Frame receiving command registrations and resolved menu entries. */
  private readonly frame: Frame;

  /** Unique command prefix for this contribution. */
  private readonly namespace: string;

  /** Reads the contribution's current feature ownership. */
  private readonly feature: () => string;

  /** Executes the most recently bound menu action. */
  private readonly execute: (item: FrameMenuItem) => void | Promise<void>;

  /** Creates a menu adapter; registration begins when bind is called. */
  constructor(
    frame: Frame,
    namespace: string,
    feature: () => string,
    execute: (item: FrameMenuItem) => void | Promise<void>
  ) {
    this.bind = this.bind.bind(this);
    this.dispose = this.dispose.bind(this);
    this.frame = frame;
    this.namespace = namespace;
    this.feature = feature;
    this.execute = execute;
  }

  /** Registers actionable entries and resolves shared command availability. */
  bind(items: readonly FrameMenuItem[]): FrameMenuItem[] {
    const seen = new Set<string>();
    const result = this.visit(items, seen);
    for (const [id, remove] of this.removers) {
      if (!seen.has(id)) {
        remove();
        this.removers.delete(id);
        this.current.delete(id);
      }
    }
    return this.frame.resolveMenuItems(result);
  }

  /** Releases all commands owned by this menu contribution. */
  dispose(): void {
    this.removers.forEach((remove) => remove());
    this.removers.clear();
    this.current.clear();
  }

  /** Recursively binds menu leaves while preserving explicit commands and rows. */
  private visit(
    items: readonly FrameMenuItem[],
    seen: Set<string>
  ): FrameMenuItem[] {
    return items.map((item) => {
      if (item.type === 'separator') return item;
      if (item.children)
        return {...item, children: this.visit(item.children, seen)};
      if (item.command) return item;
      const owner = this.feature();
      const match = /^(display|size|position):(.+)$/.exec(item.id);
      const builtin = match
        ? `frame.${owner}.${match[1]}.${match[2]}`
        : item.id === 'hide-panel'
          ? 'frame.panel.close'
          : undefined;
      if (builtin && this.frame.commands.get(builtin))
        return {...item, command: builtin};
      const id = `${this.namespace}.${item.id}`;
      seen.add(id);
      this.current.set(id, item);
      if (!this.removers.has(id))
        this.removers.set(
          id,
          this.frame.commands.register({
            id,
            label: item.label,
            feature: this.feature,
            quickInput: false,
            available: () => {
              const destination =
                item.id === 'move-primary'
                  ? 'primarySidebar'
                  : item.id === 'move-secondary'
                    ? 'secondarySidebar'
                    : item.id === 'move-panel'
                      ? 'panel'
                      : undefined;
              return (
                !destination || this.frame.features.isAvailable(destination)
              );
            },
            enabled: () => {
              const entry = this.current.get(id);
              return !!entry && entry.type !== 'separator' && !entry.disabled;
            },
            run: async () => {
              const entry = this.current.get(id);
              if (entry) await this.execute(entry);
            },
          })
        );
      return {...item, command: id};
    });
  }
}
