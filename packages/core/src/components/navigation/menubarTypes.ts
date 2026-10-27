/** A data-driven action supplied through FrameMenubar's items prop. */
export interface FrameMenubarAction {

  /** Stable action identity included in the emitted selection payload. */
  id: string;

  /** Visible action label in the menu. */
  label: string;

  /** Prevents user activation of the menu action. */
  disabled?: boolean;

  /** Shortcut annotation displayed beside the label; registers no keybinding. */
  shortcut?: string;

  /** Inserts a separator before this action during menu normalization. */
  separator?: boolean;
}

/**
 * One top-level menu supplied through FrameMenubar's data-driven items prop.
 * The menus prop supports the separate FrameMenuItem command-oriented model;
 * this contract preserves the existing simpler action-event API.
 */
export interface FrameMenubarItem {

  /** Stable selection value identifying this top-level menu. */
  value: string;

  /** Visible top-level trigger label. */
  label: string;

  /** Prevents user activation of the menu trigger. */
  disabled?: boolean;

  /** Ordered actions normalized into the menu's displayed entries. */
  items: FrameMenubarAction[];
}
