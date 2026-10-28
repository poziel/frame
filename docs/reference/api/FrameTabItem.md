# FrameTabItem

Public interface declared in packages/core/src/components/navigation/tabsTypes.ts.

## Usage

Import FrameTabItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
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
```

## Reference

<!-- frame:generated type="FrameTabItem" -->

```ts
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
```

| Name       | Type               | Description                                                               |
| ---------- | ------------------ | ------------------------------------------------------------------------- |
| `value`    | `string \| number` | Stable selection value shared by the trigger and corresponding panel.     |
| `label`    | `string`           | Visible text in the default tab trigger.                                  |
| `disabled` | `boolean`          | Prevents activation of this trigger while retaining its panel definition. |
| `content`  | `string`           | Fallback panel text when the content slot is not supplied.                |
| `icon`     | `string`           | Optional icon displayed before the default trigger label.                 |

<!-- /frame:generated -->

## Notes

- **value** (string | number): Value configuration for this component; see its Features examples for usage.
- **label** (string): Visible or accessible label for the control.
- **disabled** (boolean): Prevents user interaction while retaining the current value.
- **content** (string): Content configuration for this component; see its Features examples for usage.
- **icon** (string): Optional leading icon; provide an accessible label for icon-only actions.
