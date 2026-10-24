/** One document listener routes keys to the focused or last-used shell, including its portals. */
interface ShortcutOwner { owns(target: Node): boolean; handle(event: KeyboardEvent): void }
export function registerShortcutOwner(owner: ShortcutOwner, document: Document): () => void {
  let registry = registries.get(document);
  if (!registry) {
    const owners = new Set<ShortcutOwner>();
    let active: ShortcutOwner | undefined;
    const find = (target: EventTarget | null) => target instanceof Node ? [...owners].find(item => item.owns(target)) : undefined;
    const activate = (event: Event) => { const found = find(event.target); if (found) active = found; };
    const key = (event: KeyboardEvent) => {
      const found = find(event.target);
      if (found && !active) active = found;
      // A focused element outside every shell belongs to the host, not Frame.
      if (!found && event.target !== document.body && event.target !== document.documentElement && event.target !== document) return;
      (active ?? (owners.size === 1 ? [...owners][0] : undefined))?.handle(event);
    };
    document.addEventListener('pointerdown', activate, true);
    document.addEventListener('focusin', activate, true);
    document.addEventListener('keydown', key, true);
    registry = { owners, remove(item) { owners.delete(item); if (active === item) active = undefined; if (!owners.size) {
      document.removeEventListener('pointerdown', activate, true); document.removeEventListener('focusin', activate, true); document.removeEventListener('keydown', key, true); registries.delete(document);
    } } };
    registries.set(document, registry);
  }
  registry.owners.add(owner);
  const current = registry;
  return () => current.remove(owner);
}
const registries = new WeakMap<Document, { owners: Set<ShortcutOwner>; remove(owner: ShortcutOwner): void }>();
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const modifiers = parts.slice(0, -1);
  const primary = modifiers.some(part => ['ctrl', 'cmd', 'meta', 'mod'].includes(part));
  return (event.ctrlKey || event.metaKey) === primary
    && event.shiftKey === modifiers.includes('shift') && event.altKey === modifiers.includes('alt')
    && !event.getModifierState?.('AltGraph') && event.key.toLowerCase() === parts[parts.length - 1];
}
