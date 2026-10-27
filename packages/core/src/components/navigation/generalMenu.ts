/** A shell menu action or structural separator, with optional nested command entries. */
export type FrameMenuItem =
  | {
      /** Stable identity used to address this contribution. */
      id: string;

      /** Kind of control or structural row represented by this definition. */
      type: 'separator';
    }
  | {
      /** Stable identity used to address this contribution. */
      id: string;
      /** Kind of control or structural row represented by this definition. */
      type?: 'item';
      /** Human-readable name displayed by the owning surface. */
      label: string;
      /** Registered command whose state and execution are shared with this row. */
      command?: string;
      /** Shortcut text displayed with this menu action. */
      shortcut?: string;
      /** Whether user interaction with this entry is currently blocked. */
      disabled?: boolean;
      /** Current checked or visible state rendered by the menu row. */
      checked?: boolean;
      /** Uses a visibility indicator instead of an ordinary check mark. */
      visibility?: boolean;
      /** Nested definitions rendered and registered beneath this entry. */
      children?: readonly FrameMenuItem[];
    };

export interface FrameGeneralMenuItem {

  id: string;

  label: string;

  disabled?: boolean;

  shortcut?: string;

  /** Add a separator before this action. */
  separator?: boolean;
}

export function normalizeMenuItems(
  items: readonly (FrameGeneralMenuItem | FrameMenuItem)[]
): FrameMenuItem[] {
  return items.flatMap((item) =>
    'separator' in item && item.separator
      ? [
          {id: item.id + '-separator', type: 'separator' as const},
          item as FrameMenuItem,
        ]
      : [item as FrameMenuItem]
  );
}
