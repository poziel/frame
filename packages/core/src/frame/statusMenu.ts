import type { Frame } from './createFrame';
import type { FrameMenuItem } from '../types';
import { toolbarStatusPrefix } from './toolbarStatus';
import type { ToolbarItemId } from './toolbar';

export function statusMenuItems(frame: Frame, targetId?: string): FrameMenuItem[] {
  const installed = frame.status.items.value.filter(item => item.available && (!item.id.startsWith(toolbarStatusPrefix) || item.showInStatusBar));
  const target = installed.find(item => item.id === targetId);
  const separator = frame.status.separators.value.find(item => item.id === targetId);
  const items: FrameMenuItem[] = [];
  if (frame.status.allowAddSeparator.value) items.push({ id: 'add-separator', label: 'Add Separator' });
  if (separator?.allowRemove) items.push({ id: 'delete-separator', label: 'Delete Separator' });
  if (separator && frame.status.allowMove.value) {
    const peers = installed.filter(item => item.side === (installed.find(item => item.id === separator.before)?.side ?? 'left'));
    const at = separator.before === undefined ? peers.length : peers.findIndex(item => item.id === separator.before);
    items.push({ id: 'separator-earlier', label: 'Move Earlier', disabled: at <= 0 }, { id: 'separator-later', label: 'Move Later', disabled: at >= peers.length });
  }
  if (items.length) items.push({ id: 'edit-divider', type: 'separator' });
  if (target) items.push(
    { id: 'hide-target', label: `Hide '${target.label}'` },
    { id: 'badge-target', label: target.badgeVisible ? 'Hide Badge' : 'Show Badge' },
    { id: 'target-separator', type: 'separator' },
  );
  items.push(...installed.map(item => ({ id: `toggle:${item.id}`, label: item.label, checked: item.visible })));
  if (target && frame.status.allowMove.value) {
    items.push({ id: 'position-separator', type: 'separator' });
    if (target.id === 'frame.manage') items.push({ id: 'manage-position', label: frame.layout.manageButtonPosition === 'bottom' ? 'Move to Title Bar' : 'Move to Status Bar' });
    if (target.id.startsWith(toolbarStatusPrefix)) items.push({ id: 'toolbar-title', label: 'Move to Title Bar' });
    if (frame.status.allowMove.value) items.push({ id: 'move-target', label: target.side === 'left' ? 'Move to Right' : 'Move to Left' });
  }
  if (items.length) items.push({ id: 'bar-separator', type: 'separator' });
  items.push({ id: 'hide-bar', label: 'Hide Status Bar' });
  return items;
}

export function selectStatusMenuItem(frame: Frame, targetId: string | undefined, id: string) {
  const target = frame.status.items.value.find(item => item.id === targetId && item.available);
  const separator = frame.status.separators.value.find(item => item.id === targetId);
  if (id === 'add-separator') frame.status.addSeparator(target?.id ?? separator?.before);
  else if (id === 'delete-separator' && targetId) frame.status.removeSeparator(targetId);
  else if (separator && (id === 'separator-earlier' || id === 'separator-later')) {
    const peers = frame.status.items.value.filter(item => item.available && item.side === (frame.status.items.value.find(item => item.id === separator.before)?.side ?? 'left'));
    const at = separator.before === undefined ? peers.length : peers.findIndex(item => item.id === separator.before);
    const next = at + (id === 'separator-earlier' ? -1 : 1);
    if (next >= 0 && next <= peers.length) frame.status.moveSeparator(separator.id, peers[next]?.id);
  }
  else if (id === 'hide-bar') frame.status.setBarVisible(false);
  else if (id.startsWith('toggle:')) {
    const item = frame.status.items.value.find(item => item.id === id.slice(7) && item.available);
    if (item) frame.status.setVisible(item.id, !item.visible);
  } else if (target) {
    if (id === 'hide-target') frame.status.setVisible(target.id, false);
    else if (id === 'badge-target') frame.status.setBadgeVisible(target.id, !target.badgeVisible);
    else if (id === 'move-target') frame.status.move(target.id, target.side === 'left' ? 'right' : 'left');
    else if (id === 'manage-position' && frame.status.allowMove.value && target.id === 'frame.manage') frame.layout.manageButtonPosition = frame.layout.manageButtonPosition === 'bottom' ? 'top' : 'bottom';
    else if (id === 'toolbar-title' && frame.status.allowMove.value && target.id.startsWith(toolbarStatusPrefix)) frame.toolbar.setPlacement(target.id.slice(toolbarStatusPrefix.length) as ToolbarItemId, { area: 'titleBar' });
  }
}
