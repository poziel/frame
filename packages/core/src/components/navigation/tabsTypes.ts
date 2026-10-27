/**
 * One tab rendered by FrameTabs' default trigger and content slots.
 * The value identifies both the trigger and its panel; plain data objects can
 * also provide metadata to the component's custom item slots.
 */
export interface FrameTabItem {

  /** Stable selection value shared by the trigger and corresponding panel. */
  value: string | number;

  /** Visible text in the default tab trigger. */
  label: string;

  /** Prevents activation of this trigger while retaining its panel definition. */
  disabled?: boolean;

  /** Fallback panel text when the content slot is not supplied. */
  content?: string;

  /** Optional icon displayed before the default trigger label. */
  icon?: string;
}
