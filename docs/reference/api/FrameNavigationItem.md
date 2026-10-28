# FrameNavigationItem

Public interface declared in packages/core/src/components/navigation/navigationMenuTypes.ts.

## Usage

Import FrameNavigationItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
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
```

## Reference

<!-- frame:generated type="FrameNavigationItem" -->

```ts
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
```

| Name       | Type                    | Description                                                                 |
| ---------- | ----------------------- | --------------------------------------------------------------------------- |
| `value`    | `string`                | Stable item value forwarded to the navigation menu primitive.               |
| `label`    | `string`                | Visible link text or submenu trigger label.                                 |
| `href`     | `string`                | Link destination used when this entry has no submenu children.              |
| `disabled` | `boolean`               | Blocks navigation or submenu activation without removing the entry.         |
| `children` | `FrameNavigationItem[]` | Links shown in the default submenu, or supplied to its custom content slot. |

<!-- /frame:generated -->

## Notes

- **value** (string): Value configuration for this component; see its Features examples for usage.
- **label** (string): Visible or accessible label for the control.
- **href** (string): Href configuration for this component; see its Features examples for usage.
- **disabled** (boolean): Prevents user interaction while retaining the current value.
- **children** (FrameNavigationItem[]): Nested application-owned contributions.
