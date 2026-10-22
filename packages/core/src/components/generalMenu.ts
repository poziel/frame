export interface FrameGeneralMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  /** Add a separator before this action. */
  separator?: boolean;
}
