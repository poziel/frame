import type { Frame } from './createFrame';
import type { Command } from '../types';

export function builtinFeature(id: string): string {
  if (id.startsWith('frame.layout.panel.') || id.startsWith('frame.panel.')) return 'panel';
  if (id.startsWith('frame.sidebar.') || id.startsWith('frame.layout.primary.')) return 'primarySidebar';
  if (id.startsWith('frame.secondary.')) return 'secondarySidebar';
  if (id === 'frame.layout.menuBarVisible') return 'menuBar';
  if (id === 'frame.layout.statusBarVisible') return 'statusBar';
  if (id === 'frame.layout.navigationVisible' || id.startsWith('frame.navigation.')) return 'navigation';
  if (id.startsWith('frame.banner.') || id.startsWith('frame.layout.banner.')) return 'banner';
  if (id.startsWith('frame.theme.')) return 'theme';
  if (id.startsWith('frame.workspace.')) return 'workspace';
  if (id === 'frame.settings') return 'settings';
  for (const name of ['primaryViewBar','secondaryViewBar','panelViewBar','navigationBar']) if (id.startsWith('frame.'+name+'.')) return name;
  return 'shell';
}

export function installBuiltinCommands(frame: Frame) {
const bars = { primaryViewBar: { ...frame.primaryViewBar }, secondaryViewBar: { ...frame.secondaryViewBar }, panelViewBar: { ...frame.panelViewBar }, navigationBar: { ...frame.navigationBar } };
const panel = { ...frame.panel };
const builtins: Command[] = [
  { id: 'frame.secondary.open', label: 'Layout: Open secondary sidebar', run: () => frame.openSecondaryPanel() },
  { id: 'frame.secondary.close', label: 'Layout: Close secondary sidebar', enabled: () => frame.layout.secondarySidebarVisible, run: frame.closeSecondaryPanel },
  ...(['secondary', 'panel'] as const).map(name => ({ id: `frame.${name}.maximize`, label: `Layout: Maximize or restore ${name === 'panel' ? 'panel' : 'secondary sidebar'}`, enabled: () => name === 'panel' ? frame.layout.panelVisible : frame.layout.secondarySidebarVisible, run: () => { const region = name === 'panel' ? 'bottom' : 'secondary'; frame.layout.maximizedRegion = frame.layout.maximizedRegion === region ? null : region; } })),
  { id: "frame.theme.reset", label: "Theme: Frame default", run: frame.theme.reset },
  { id: "frame.settings", label: "Settings: Open application settings", shortcut: "Ctrl+,", enabled: () => frame.features.settings, run: frame.openSettings },
  { id: "frame.layout.customize", label: "Layout: Customize layout", run: () => { frame.closeQuickInput(); frame.layoutCustomizerOpen.value = true; } },
  ...(["left", "right", "up", "down"] as const).map(direction => ({ id: `frame.workspace.split.${direction}`, label: `Workspace: Split ${direction}`, group: "Workspace", visible: () => !!frame.workspace.options.allowPaneCreation, enabled: () => frame.workspace.canSplit(), run: () => { frame.splitWorkspace(direction); } })),
  { id: "frame.workspace.tab.create", label: "Workspace: New tab", group: "Workspace", shortcut: "Ctrl+T", enabled: () => frame.workspace.canCreateTab(), run: async () => { await frame.workspace.requestTab(undefined, 'shortcut'); } },
  { id: "frame.workspace.tab.close", label: "Workspace: Close active tab", group: "Workspace", shortcut: "Ctrl+W", enabled: () => frame.workspace.canCloseTab(frame.workspace.activeTabs.value[frame.workspace.activePane.value] ?? ''), run: async () => { const id=frame.workspace.activeTabs.value[frame.workspace.activePane.value]; if(id)await frame.workspace.closeTabs([id], 'shortcut'); } },
  { id: "frame.workspace.close", label: "Workspace: Close active pane", visible: () => !!frame.workspace.options.allowPaneCreation || frame.workspace.panes.value.length > 1, enabled: () => frame.workspace.panes.value.length > 1, run: async () => { await frame.workspace.requestClosePane(); } },
  { id: "frame.banner.toggle", label: "Layout: Toggle banner", enabled: () => !!frame.workspaceBanner.value, run: frame.toggleWorkspaceBanner },
  { id: "frame.secondary.toggle", label: "Layout: Toggle secondary sidebar", shortcut: "Ctrl+Alt+B", run: frame.toggleSecondaryPanel },
  { id: "frame.zen.toggle", label: "Layout: Toggle Zen Mode", run: () => frame.setZenMode(!frame.layout.zenMode) },
  { id: "frame.fullscreen", label: "Window: Toggle full screen", shortcut: "F11", enabled: () => frame.host.window.supports('fullscreen'), run: () => frame.host.window.toggleFullscreen() },
  { id: "frame.sidebar.open", label: "Layout: Open primary sidebar", run: () => { if (!frame.state.sidebarVisible) frame.toggleSidePanel(); } },
  { id: "frame.sidebar.close", label: "Layout: Close primary sidebar", enabled: () => frame.state.sidebarVisible, run: frame.closeSidePanel },
  { id: "frame.sidebar.toggle", label: "Layout: Toggle primary sidebar", group: "View", shortcut: "Ctrl+B", run: frame.toggleSidePanel },
  { id: "frame.panel.open", label: "Layout: Open panel", run: () => frame.openBottomPanel() },
  { id: "frame.panel.close", label: "Layout: Close panel", enabled: () => frame.state.panelVisible, run: frame.closeBottomPanel },
  { id: "frame.panel.toggle", label: "Layout: Toggle panel", group: "View", shortcut: "Ctrl+J", run: frame.toggleBottomPanel },
  { id: "frame.layout.reset", label: "Layout: Reset layout", run: async () => { if (frame.host.window.state.value.fullscreen) await frame.host.window.toggleFullscreen(); frame.resetLayout(); frame.record("Layout reset"); } },
  { id: "frame.commands", label: "Show all commands", group: "View", shortcut: "Ctrl+Shift+P", run: frame.openCommands },
  ...(["minimize", "maximize", "close"] as const).map(action => ({
    id: `frame.window.${action}`, label: `Window: ${action === "maximize" ? "Maximize or restore" : action === "minimize" ? "Minimize" : "Close application"}`,
    enabled: () => frame.host.window.supports(action), run: () => frame.host.window.execute(action),
  })),
];
for (const [key, label] of [["menuBarVisible", "menu bar"], ["statusBarVisible", "status bar"], ["centered", "centered layout"]] as const) {
  builtins.push({ id: `frame.layout.${key}`, label: `Layout: Toggle ${label}`, run: () => { frame.layout[key] = !frame.layout[key]; } });
}
for (const value of ["left", "right"] as const) builtins.push({ id: `frame.layout.primary.${value}`, label: `Layout: Move primary sidebar ${value}`, run: () => { frame.layout.primarySide = value; } });
for (const value of ["left", "right", "center", "justify"] as const) builtins.push({ id: `frame.layout.panel.${value}`, label: `Layout: Align panel ${value}`, enabled: () => panel.canAlign.value, run: () => { panel.setAlignment(value); } });
for (const value of ["top", "bottom", "left", "right"] as const) builtins.push({ id: `frame.layout.panel.position.${value}`, label: `Layout: Position panel ${value}`, run: () => { panel.setPosition(value); } });
for (const value of ["left", "right", "center", "justify"] as const) builtins.push({ id: `frame.layout.banner.${value}`, label: `Layout: Align banner ${value}`, run: () => { frame.layout.bannerAlignment = value; } });
for (const value of ["top", "center"] as const) builtins.push({ id: `frame.layout.quick.${value}`, label: `Layout: Position quick input ${value}`, run: () => { frame.layout.quickInputPosition = value; } });
for (const value of ["default", "compact"] as const) builtins.push({ id: `frame.layout.density.${value}`, label: `Layout: Use ${value} density`, run: () => { frame.layout.density = value; } });
for (const [name,bar] of [['primaryViewBar',bars.primaryViewBar],['secondaryViewBar',bars.secondaryViewBar],['panelViewBar',bars.panelViewBar],['navigationBar',bars.navigationBar]] as const) {
 const label=name==='primaryViewBar'?'Primary View Bar':name==='secondaryViewBar'?'Secondary View Bar':name==='panelViewBar'?'Panel View Bar':'Navigation Bar';
 for (const action of ['open', 'close', 'toggle'] as const) builtins.push({ id: `frame.${name}.${action}`, label: `Layout: ${action === 'open' ? 'Open' : action === 'close' ? 'Close' : 'Toggle'} ${label}`, run: bar[action] });
 for(const mode of ['icons','text','both']as const)builtins.push({id:`frame.${name}.display.${mode}`,label:`Layout: ${label} display ${mode}`,visible:()=>!('allowDisplayChange' in bar)||bar.allowDisplayChange,enabled:()=>!('allowDisplayChange' in bar)||bar.allowDisplayChange,run:()=>{bar.setDisplay(mode);}});
 for(const size of ['default','compact']as const)builtins.push({id:`frame.${name}.size.${size}`,label:`Layout: ${label} size ${size}`,visible:()=>!('allowSizeChange' in bar)||bar.allowSizeChange,enabled:()=>!('allowSizeChange' in bar)||bar.allowSizeChange,run:()=>{bar.setSize(size);}});
}
for(const [name,bar] of [['primaryViewBar',bars.primaryViewBar],['secondaryViewBar',bars.secondaryViewBar]]as const)for(const position of ['default','top','bottom','hidden']as const)builtins.push({id:`frame.${name}.position.${position}`,label:`Layout: ${name==='primaryViewBar'?'Primary':'Secondary'} View Bar position ${position}`,run:()=>{bar.setPosition(position);}});
for(const position of ['top','bottom','left','right']as const)builtins.push({id:`frame.navigationBar.position.${position}`,label:`Layout: Navigation Bar position ${position}`,run:()=>{bars.navigationBar.setPosition(position);}});
for (const command of builtins) frame.commands.register({ ...command, feature: builtinFeature(command.id), quickInput: '>', scope: 'frame' });

  for (const direction of ['back', 'forward'] as const) frame.commands.register({ id: 'frame.navigation.' + direction, feature: 'navigation', label: 'Navigation: ' + direction, quickInput: '>', enabled: () => direction === 'back' ? frame.navigation.canGoBack : frame.navigation.canGoForward, run: () => { frame.navigation[direction](); } });
  frame.commands.register({ id: 'frame.layout.navigationVisible', feature: 'navigation', label: 'Layout: Toggle navigation history', quickInput: '>', run: () => { frame.layout.navigationVisible = !frame.layout.navigationVisible; } });
  frame.commands.register({ id: 'frame.quickInput', feature: 'shell', label: 'Quick input', quickInput: false, shortcut: 'Ctrl+P', run: () => frame.openQuickInput() });
}
