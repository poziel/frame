import { watch } from 'vue';
import type { Frame } from './createFrame';
import type { ToolbarAction } from '../types';
import type { ToolbarButton, ToolbarItemId } from './toolbar';
import { regionIcon } from './layoutIcons';

export const toolbarStatusPrefix = 'frame.toolbar.';
const builtins: { id: ToolbarButton; label: string; command: string; region?: 'primary' | 'secondary' | 'panel'; shortcut?: string; controls?: string }[] = [
  { id: 'customize', label: 'Customize layout', command: 'frame.layout.customize' },
  { id: 'primary', label: 'Toggle primary sidebar', command: 'frame.sidebar.toggle', region: 'primary', shortcut: 'Ctrl+B', controls: 'side-panel' },
  { id: 'bottom', label: 'Toggle panel', command: 'frame.panel.toggle', region: 'panel', shortcut: 'Ctrl+J', controls: 'bottom-panel' },
  { id: 'secondary', label: 'Toggle secondary sidebar', command: 'frame.secondary.toggle', region: 'secondary', shortcut: 'Ctrl+Alt+B' },
];

/** A different presentation of the same commands; never owns application behavior. */
export function connectToolbarStatus(frame: Frame) {
  const removers = new Set<() => void>();
  function placement(id: ToolbarItemId) {
    const value = frame.toolbar.getPlacement(id);
    return value.area === 'statusBar' ? value : undefined;
  }
  function track(id: ToolbarItemId, remove: () => void) {
    const stop = watch(() => frame.toolbar.getPlacement(id), () => frame.status.resetItemPosition(toolbarStatusPrefix + id), { flush: 'sync' });
    const cleanup = () => { if (removers.delete(cleanup)) { stop(); remove(); } };
    removers.add(cleanup); return cleanup;
  }
  for (const button of builtins) {
    const expanded = () => button.region === 'primary' ? frame.layout.primarySidebarVisible : button.region === 'secondary' ? frame.layout.secondarySidebarVisible : button.region === 'panel' ? frame.layout.panelVisible : undefined;
    const remove = frame.status.register({
      id: toolbarStatusPrefix + button.id, kind: 'button', label: button.label,
      get icon() { return button.region ? regionIcon(button.region, !!expanded(), frame.layout.primarySide) : 'layout'; },
      get expanded() { return expanded(); }, controls: button.controls, shortcut: button.shortcut,
      get tooltip() { return button.region ? `${expanded() ? 'Hide' : 'Show'} ${button.region === 'panel' ? 'panel' : button.region + ' sidebar'}` : button.label; },
      get side() { return placement(button.id)?.side ?? 'left'; },
      get order() { return placement(button.id)?.order ?? 0; },
      get visible() { return frame.toolbar.isVisible(button.id); },
      get disabled() { return !frame.commands.isEnabled(button.command); },
      available: () => frame.commands.isVisible(button.command),
      showInStatusBar: () => !!placement(button.id) && frame.toolbar.isVisible(button.id),
      onMove: side => { frame.toolbar.setPlacement(button.id, { area: 'statusBar', side, order: placement(button.id)?.order }); },
      run: () => { void frame.commands.execute(button.command); },
    });
    track(button.id, remove);
  }
  function registerAction(action: ToolbarAction) {
    const id = `action:${action.id}` as const;
    const remove = frame.status.register({
      id: toolbarStatusPrefix + id, kind: 'button',
      get label() { return action.label; }, get icon() { return action.icon; },
      get side() { return placement(id)?.side ?? 'left'; }, get order() { return placement(id)?.order ?? 0; },
      get visible() { return action.visible !== false; },
      get disabled() { return !!action.disabled || !frame.commands.isEnabled(action.id); },
      available: () => action.feature?.enabled !== false && frame.commands.isVisible(action.id),
      showInStatusBar: () => !!placement(id) && action.visible !== false && action.showInStatusBar?.() !== false,
      onMove: side => { frame.toolbar.setPlacement(id, { area: 'statusBar', side, order: placement(id)?.order }); },
      run: () => { void frame.commands.execute(action.id); },
    });
    return track(id, remove);
  }
  return { registerAction, dispose() { for (const remove of [...removers]) remove(); } };
}
