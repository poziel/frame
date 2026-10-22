import type { Component } from "vue";

export interface Command {
  id: string;
  label: string;
  detail?: string;
  group?: string;
  shortcut?: string;
  enabled?: () => boolean;
  run: () => void | Promise<void>;
}
export interface QuickPickItem {
  id: string;
  label: string;
  detail?: string;
  shortcut?: string;
  disabled?: boolean;
}
export interface QuickPickOptions {
  searchable?: boolean;
  title?: string;
  placeholder?: string;
}
export interface PanelDefinition {
  id: string;
  label: string;
  icon?: Component;
  actions?: readonly PanelAction[];
  padded?: boolean;
  draggable?: boolean;
  movable?: boolean;
  collapsed?: boolean;
  component?: Component;
  children?: readonly PanelDefinition[];
  props?: Record<string, unknown>;
}
export interface SidePanelDefinition extends PanelDefinition {
  icon?: Component;
  showInRail?: boolean;
}
export interface ActivityEntry { id: number; time: string; message: string }

export type FrameMenuItem =
  | { id: string; type: "separator" }
  | { id: string; type?: "item"; label: string; command?: string; shortcut?: string; disabled?: boolean; checked?: boolean; visibility?: boolean; children?: readonly FrameMenuItem[] };


export type ViewRegion = "primary" | "secondary" | "bottom";
export interface PanelAction { id: string; label: string; icon?: Component; run: () => void; disabled?: boolean }
export interface ToolbarAction extends PanelAction { visible?: boolean }

export interface WorkspaceBannerDefinition {
  id: string;
  label: string;
  component: Component;
  props?: Record<string, unknown>;
}
export interface WorkspacePaneContent {
  label: string;
  component?: Component;
  props?: Record<string, unknown>;
}
export interface WorkspacePane extends WorkspacePaneContent { id: string }
export type WorkspaceSplitDirection = "left" | "right" | "up" | "down";
export type WorkspaceNode = { type: "pane"; id: string } | { type: "split"; id: string; axis: "x" | "y"; ratio: number; first: WorkspaceNode; second: WorkspaceNode };

export type MenuDefinition = PanelDefinition;

export type ViewDefinition = SidePanelDefinition;
export type BannerDefinition = WorkspaceBannerDefinition;
export interface ModalDefinition {
  id: string;
  title: string;
  component: Component;
  props?: Record<string, unknown>;
  icon?: Component;
  actions?: readonly PanelAction[];
  width?: number;
  height?: number;
  maximized?: boolean;
}

export type SettingValue = string | number | boolean;
export interface SettingDefinition {
  id: string; label: string; description?: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "range" | "color";
  default: SettingValue; placeholder?: string; min?: number; max?: number; step?: number;
  options?: readonly SelectItem[];
  disabled?: boolean; getValue?: () => SettingValue; onChange?: (value: SettingValue) => void;
}
export interface SettingsSection { id: string; title: string; description?: string; settings?: readonly SettingDefinition[]; children?: readonly SettingsSection[] }
export type NotificationSeverity = "info" | "success" | "warning" | "error";
export interface NotificationAction { label: string; run: () => void | Promise<void> }
export interface FrameNotification {
  id: string; title: string; severity: NotificationSeverity; details?: string; source?: string;
  priority?: string; duration: number; action?: NotificationAction; running: boolean;
}
export interface NotificationOptions {
  id?: string; title: string; severity?: NotificationSeverity; details?: string; source?: string;
  priority?: string; duration?: number; action?: NotificationAction;
}
export interface FrameOptions { settings?: boolean; notifications?: boolean; /** Enable application navigation history and title-bar arrows. Default: false. */ navigation?: boolean }

export interface ActivityAction { id: string; label: string; icon?: Component; run: () => void; disabled?: boolean; active?: boolean | (() => boolean) }
/** Shared runtime base. The SelectItem type narrows to an option or separator. */
export const SelectItem = class SelectItem {};
export class SelectOption extends SelectItem {
  value: string;
  label: string;
  description?: string;
  detail?: string;
  disabled?: boolean;
  constructor(options: { value: string; label: string; description?: string; detail?: string; disabled?: boolean }) {
    super();
    this.value = options.value;
    this.label = options.label;
    this.description = options.description;
    this.detail = options.detail;
    this.disabled = options.disabled;
  }
}
export class SelectSeparator extends SelectItem {
  readonly type = "separator" as const;
  id: string;
  constructor(id: string) { super(); this.id = id; }
}
/** Value-bearing option or non-selectable separator. Plain object inputs remain compatible. */
export type SelectItem = SelectOption | SelectSeparator;
