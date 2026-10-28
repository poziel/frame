# FrameMenuItem

A typed command-menu entry, shared by FrameMenu, ContextMenu, and the Manage menu. A menu item is either an action/submenu or a separator.

## Usage

Use the public package export for this contract.

```typescript
import type { FrameMenuItem } from '@frame/core';
const items: FrameMenuItem[] = [
  { id: 'save', label: 'Save', command: 'app.save', shortcut: 'Ctrl+S' },
  { id: 'view', label: 'View', children: [{ id: 'outline', label: 'Outline' }] },
  { id: 'divider', type: 'separator' },
  { id: 'autosave', label: 'Autosave', checked: true },
];
```

## Reference

<!-- frame:generated type="FrameMenuItem" -->

```ts
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
```

No declared entries.

<!-- /frame:generated -->

## Notes

- **id** (string): Required unique ID within this menu.
- **type** ("item" | "separator"): Omit or use item for choices; separator for a non-selectable divider.
- **label** (string): Required text for a choice; separators do not use it.
- **command** (string): Optional registered command ID. The host handles selection/dispatch.
- **shortcut** (string): Optional display hint; does not install a shortcut.
- **children** (readonly FrameMenuItem[]): Nested FrameMenuItem[] submenu. See [FrameMenuItem](FrameMenuItem.md).
- **disabled** (boolean): Skips pointer/keyboard selection.
- **checked** (boolean): Optional checkbox state; application updates the value.
- **visibility** (boolean): Use the hover/focus visibility indicator.
