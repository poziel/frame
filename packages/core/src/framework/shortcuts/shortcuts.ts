/** Tests a key event against the canonical shortcut modifiers and key. */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: string
): boolean {
  const parts = normalizeShortcut(shortcut).toLowerCase().split('+');
  const modifiers = parts.slice(0, -1);
  const key = parts[parts.length - 1] || '+';
  const primary = modifiers.some((part) =>
    ['ctrl', 'cmd', 'meta', 'mod'].includes(part)
  );
  return (
    (event.ctrlKey || event.metaKey) === primary &&
    event.shiftKey === modifiers.includes('shift') &&
    event.altKey === modifiers.includes('alt') &&
    !event.getModifierState?.('AltGraph') &&
    ((event.key === ' ' ? 'space' : event.key.toLowerCase()) === key ||
      (key === ',' && event.code === 'Comma'))
  );
}

/** Canonical display/search spelling, including a literal plus key. */
export function normalizeShortcut(shortcut: string): string {
  const parts = shortcut.toLowerCase().replace(/\s/g, '').split('+');
  const key = parts.pop() || '+';
  return [
    ...(parts.some((p) => ['ctrl', 'cmd', 'meta', 'mod'].includes(p))
      ? ['Ctrl']
      : []),
    ...(parts.includes('alt') ? ['Alt'] : []),
    ...(parts.includes('shift') ? ['Shift'] : []),
    key.length === 1 ? key.toUpperCase() : key,
  ].join('+');
}

/** Captures a usable shortcut while excluding modifier-only and composing input. */
export function shortcutFromEvent(event: KeyboardEvent): string | undefined {
  if (
    event.isComposing ||
    event.getModifierState?.('AltGraph') ||
    ['Control', 'Meta', 'Shift', 'Alt', 'Dead', 'Unidentified'].includes(
      event.key
    )
  )
    return;
  return normalizeShortcut(
    [
      ...(event.ctrlKey || event.metaKey ? ['Ctrl'] : []),
      ...(event.altKey ? ['Alt'] : []),
      ...(event.shiftKey ? ['Shift'] : []),
      event.key === ' ' ? 'Space' : event.key,
    ].join('+')
  );
}
