/**
 * One button, link, or separator rendered by FrameToolbar.
 * Activating a non-separator emits this item through the component's action
 * event. Application command registration remains separate from this contract.
 */
export interface FrameToolbarItem {

  /** Stable rendering identity within the toolbar. */
  id: string;

  /** Visible text for a button or link; unused when rendering a separator. */
  label: string;

  /** Optional icon displayed before a non-separator label. */
  icon?: string;

  /** Prevents activation and renders a button instead of an active link. */
  disabled?: boolean;

  /** Link destination used when the item is enabled and not a separator. */
  href?: string;

  /** Renders a structural separator instead of a button or link. */
  separator?: boolean;
}
