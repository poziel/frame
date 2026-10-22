import type { SplitterPanelProps } from 'reka-ui';
export interface FrameTabItem { value: string | number; label: string; disabled?: boolean; content?: string; icon?: string; }
export interface FrameStepItem { step: number; label: string; description?: string; disabled?: boolean; completed?: boolean; }
export interface FrameToolbarItem { id: string; label: string; icon?: string; disabled?: boolean; href?: string; separator?: boolean; }
export interface FrameTreeItem { id: string; label: string; icon?: string; disabled?: boolean; children?: FrameTreeItem[]; }
export interface FrameSplitPanel extends SplitterPanelProps { label?: string; content?: string; }
export interface FrameNavigationItem { value: string; label: string; href?: string; disabled?: boolean; children?: FrameNavigationItem[]; }
export interface FrameMenubarAction { id: string; label: string; disabled?: boolean; shortcut?: string; separator?: boolean; }
export interface FrameMenubarItem { value: string; label: string; disabled?: boolean; items: FrameMenubarAction[]; }
