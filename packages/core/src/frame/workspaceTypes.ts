import type { Component } from 'vue';
import type { FrameMenuItem } from '../types';

export type WorkspaceOperationSource = 'api' | 'button' | 'shortcut' | 'middle-click' | 'menu' | 'drag' | 'double-click';
export type WorkspaceFailure = 'disabled' | 'missing' | 'limit' | 'cancelled' | 'stale' | 'disposed' | 'conflict' | 'invalid';
export type WorkspaceResult<T = void> = { ok: true; value: T } | { ok: false; reason: WorkspaceFailure };
export type WorkspacePaneMode = 'plain' | 'tabs';
export interface WorkspaceTabDefinition {
  id: string;
  title: string;
  icon?: string | Component;
  component?: Component;
  props?: Record<string, unknown>;
  /** Used when the pane opts into trackChanges. */
  dirty?: boolean;
  pinned?: boolean;
  closable?: boolean;
  movable?: boolean;
  showIcon?: boolean;
  showTitle?: boolean;
  showClose?: boolean;
}
export interface WorkspaceTab extends WorkspaceTabDefinition { readonly paneId: string }
export interface WorkspaceOperationContext {
  source: WorkspaceOperationSource;
  paneId: string;
  tabIds: readonly string[];
  signal: AbortSignal;
}
export interface WorkspaceChangeEvent {
  type: 'register' | 'update' | 'activate' | 'close' | 'pin' | 'move' | 'reset' | 'pane';
  source: WorkspaceOperationSource;
  paneId: string;
  tabIds: readonly string[];
  destinationPaneId?: string;
}
export interface WorkspaceCloseConfirmation {
  readonly tabs: readonly WorkspaceTab[];
  respond(discard: boolean): void;
}
export interface WorkspaceTabOptions {
  /** Enable dirty indicators and Frame's unsaved-close dialog. Default false. */
  trackChanges?: boolean;
  /** Show the strip for a single tab. Default false. */
  showSingleTab?: boolean;
  display?: 'icons' | 'text' | 'both';
  allowCreate?: boolean;
  allowClose?: boolean;
  allowMove?: boolean;
  lastTab?: 'keep-one' | 'allow-empty';
  showIcons?: boolean;
  showTitles?: boolean;
  showClose?: boolean;
  create?: (context: WorkspaceOperationContext) => WorkspaceTabDefinition | undefined | Promise<WorkspaceTabDefinition | undefined>;
  beforeClose?: (context: WorkspaceOperationContext) => boolean | Promise<boolean>;
  contextMenu?: (context: { paneId: string; tabId: string }, defaults: readonly FrameMenuItem[]) => readonly FrameMenuItem[];
}
export interface WorkspaceOptions {
  allowPaneCreation?: boolean;
  /** Commands offered beneath the shared Frame welcome logo. */
  welcome?: { commands: readonly string[] };
  maxPanes?: number;
  newPaneMode?: WorkspacePaneMode;
  tabs?: WorkspaceTabOptions;
}
