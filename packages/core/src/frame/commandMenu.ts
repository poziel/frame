import type { Frame } from './createFrame';
import type { FrameMenuItem } from '../types';

/** Context-bound commands live as long as their owning shell contribution. */
export function createCommandMenu(frame: Frame, namespace: string, feature: () => string, execute: (item: FrameMenuItem) => void | Promise<void>) {
  const current = new Map<string, FrameMenuItem>();
  const removers = new Map<string, () => void>();
  function bind(items: readonly FrameMenuItem[]): FrameMenuItem[] {
    const seen = new Set<string>();
    function visit(items: readonly FrameMenuItem[]): FrameMenuItem[] {
      return items.map(item => {
        if (item.type === 'separator') return item;
        if (item.children) return { ...item, children: visit(item.children) };
        if (item.command) return item;
        const owner = feature();
        const match = /^(display|size|position):(.+)$/.exec(item.id);
        const builtin = match ? `frame.${owner}.${match[1]}.${match[2]}` : item.id === 'hide-panel' ? 'frame.panel.close' : undefined;
        if (builtin && frame.commands.get(builtin)) return { ...item, command: builtin };
        const id = `${namespace}.${item.id}`;
        seen.add(id); current.set(id, item);
        if (!removers.has(id)) removers.set(id, frame.commands.register({ id, label: item.label, feature,
          quickInput: false,
          available: () => {
            const destination = item.id === 'move-primary' ? 'primarySidebar' : item.id === 'move-secondary' ? 'secondarySidebar' : item.id === 'move-panel' ? 'panel' : undefined;
            return !destination || frame.features.isAvailable(destination);
          },
          enabled: () => { const entry = current.get(id); return !!entry && entry.type !== 'separator' && !entry.disabled; },
          run: async () => { const entry = current.get(id); if (entry) await execute(entry); },
        }));
        return { ...item, command: id };
      });
    }
    const result = visit(items);
    for (const [id, remove] of removers) if (!seen.has(id)) { remove(); removers.delete(id); current.delete(id); }
    return frame.resolveMenuItems(result);
  }
  return { bind, dispose() { removers.forEach(remove => remove()); removers.clear(); current.clear(); } };
}
