# FrameMenubarItem

Public interface declared in packages/core/src/components/navigation/menubarTypes.ts.

## Usage

Import FrameMenubarItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
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
```

## Reference

<!-- frame:generated type="FrameMenubarItem" -->

```ts
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
```

| Name       | Type                   | Description                                                   |
| ---------- | ---------------------- | ------------------------------------------------------------- |
| `value`    | `string`               | Stable selection value identifying this top-level menu.       |
| `label`    | `string`               | Visible top-level trigger label.                              |
| `disabled` | `boolean`              | Prevents user activation of the menu trigger.                 |
| `items`    | `FrameMenubarAction[]` | Ordered actions normalized into the menu's displayed entries. |

<!-- /frame:generated -->

## Notes

- **value** (string): Value configuration for this component; see its Features examples for usage.
- **label** (string): Visible or accessible label for the control.
- **disabled** (boolean): Prevents user interaction while retaining the current value.
- **items** (FrameMenubarAction[]): Ordered application-owned entries.
