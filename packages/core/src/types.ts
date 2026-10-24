import type { PanelOptions } from './frame/panel';
import type { StatusOptions } from './frame/status';
export type { PanelOptions, PanelDisplay, PanelController } from './frame/panel';
import type { SecondaryViewBarOptions } from './frame/secondaryViewBar';
export type { SecondaryViewBarOptions, SecondaryViewBarDisplay, SecondaryViewBarSize, SecondaryViewBarItem, SecondaryViewBarController } from './frame/secondaryViewBar';
import type { Component } from "vue";
import type { WorkspaceOptions } from './frame/workspaceTypes';
export type * from './frame/workspaceTypes';
import type { ViewBadge, PrimaryViewBarOptions } from "./frame/primaryViewBar";
import type { ToolbarOptions } from "./frame/toolbar";
export type { ViewBadge, PrimaryViewBarOptions, ViewBarPosition, ViewBarSize, ViewBarDisplay, ViewItem, PrimaryViewBarController } from "./frame/primaryViewBar";
export type { ToolbarOptions } from "./frame/toolbar";

export interface Command {
  id: string;
  icon?: string | Component;
  label: string;
  detail?: string;
  group?: string;
  shortcut?: string;
  /** Picker destination; defaults to application. Shortcuts work in either mode. */
  scope?: "application" | "frame";
  /** Hide from pickers while retaining command and shortcut access. */
  quickInput?: boolean | string;
  /** Owning feature. A resolver supports views that move between regions. */
  feature?: string | (() => string);
  available?: boolean | (() => boolean);
  visible?: boolean | (() => boolean);
  enabled?: boolean | (() => boolean);
  run: () => void | Promise<void>;
}
export interface QuickPickItem {
  id: string;
  icon?: string | Component;
  label: string;
  detail?: string;
  shortcut?: string;
  disabled?: boolean;
}
export interface QuickPickOptions {
  title?: string;
  placeholder?: string;
}
export interface ViewContentSlot {
  component: Component;
  props?: Record<string, unknown>;
  padded?: boolean;
}
export interface PanelDefinition {
  /** Optional view-item badge; presentation is controlled by frame.primaryViewBar or frame.secondaryViewBar. */
  badge?: ViewBadge;
  id: string;
  label: string;
  icon?: Component;
  actions?: readonly PanelAction[];
  padded?: boolean;
  top?: ViewContentSlot;
  bottom?: ViewContentSlot;
  draggable?: boolean;
  movable?: boolean;
  collapsed?: boolean;
  /** Initial presentation visibility; hiding does not unregister or dispose the view. */
  visible?: boolean;
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
export interface PanelAction { id: string; label: string; icon?: Component; run: () => void; disabled?: boolean; menu?: readonly FrameMenuItem[]; onSelect?: (item: FrameMenuItem) => void }
export interface ToolbarActionFeature {
  label: string;
  readonly enabled: boolean;
  setEnabled(enabled: boolean): void;
}
export interface ToolbarAction extends PanelAction {
  /** Choose title-bar or status-bar presentation without changing the action. */
  placement?: import('./frame/toolbar').ToolbarPlacement;
  /** Bridge features that already own an alternate status presentation. */
  onPlacementChange?: (placement: import('./frame/toolbar').ToolbarPlacement) => void;
  /** Override automatic status presentation, independently of the title-bar gate. */
  showInStatusBar?: () => boolean;
  /** Whether the available action is pinned on the title bar. */
  visible?: boolean;
  /** Optional feature availability, independent of pinning. */
  feature?: ToolbarActionFeature;
  /** Whether this action currently belongs to the title bar (for movable indicators). */
  showInToolbar?: () => boolean;
}

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
export interface ModalOptions {
  /** Minimum height in pixels, capped by available shell space. Default: 160. */
  minHeight?: number;
  width?: number;
  height?: number;
  /** CSS padding shorthand or pixels; zero removes padding. */
  contentPadding?: number | string;
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
}
export interface ModalDefinition extends ModalOptions {
  id: string;
  title: string;
  component: Component;
  props?: Record<string, unknown>;
  icon?: Component;
  actions?: readonly PanelAction[];
  width?: number;
  height?: number;
  maximized?: boolean;
  footer?: Component;
  footerProps?: Record<string, unknown>;
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
export type { NavigationBarOptions, NavigationBarPosition, NavigationBarJustification } from './frame/navigationBar';
import type { NavigationBarOptions } from './frame/navigationBar';
import type { PanelViewBarOptions } from './frame/panelViewBar';
export type { PanelViewBarOptions, PanelViewBarController } from './frame/panelViewBar';
export type { NavigationItem, NavigationActionItem, NavigationLinkItem, NavigationDropdownItem, NavigationSeparatorItem } from './frame/navigationItems';
export interface FrameOptions { modal?: ModalOptions; features?: Readonly<Record<string, boolean>>; host?: import('./frame/host').FrameHost; /** Initial per-instance theme. Omitted: inherit document CSS tokens. */ theme?: import('./themes/theme').FrameTheme | import('./themes/theme').FrameThemeDefinition; workspace?: WorkspaceOptions; panelViewBar?: PanelViewBarOptions; status?: StatusOptions; navigationBar?: boolean | NavigationBarOptions; /** Manage button location. Default: bottom (status bar). */ manageButtonPosition?: "top" | "bottom"; panel?: PanelOptions; secondaryViewBar?: SecondaryViewBarOptions; toolbar?: ToolbarOptions; primaryViewBar?: PrimaryViewBarOptions; settings?: boolean; notifications?: boolean; /** Enable application navigation history and title-bar arrows. Default: false. */ navigation?: boolean }

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

export type {BarSeparator,BarSeparatorOptions} from './frame/barSeparators';
