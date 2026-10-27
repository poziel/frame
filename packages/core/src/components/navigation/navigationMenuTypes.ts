/** A link or submenu entry supplied to FrameNavigationMenu. */
export interface FrameNavigationItem {

  /** Stable item value forwarded to the navigation menu primitive. */
  value: string;

  /** Visible link text or submenu trigger label. */
  label: string;

  /** Link destination used when this entry has no submenu children. */
  href?: string;

  /** Blocks navigation or submenu activation without removing the entry. */
  disabled?: boolean;

  /** Links shown in the default submenu, or supplied to its custom content slot. */
  children?: FrameNavigationItem[];
}
