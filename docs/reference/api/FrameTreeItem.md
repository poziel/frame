# FrameTreeItem

Public interface declared in packages/core/src/components/data-display/treeTypes.ts.

## Usage

Import FrameTreeItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface FrameTreeItem {

  /** Default rendering and selection key, unless getKey overrides it. */
  id: string;

  /** Visible label in the default tree row. */
  label: string;

  /** Optional row icon, independent of the expansion indicator. */
  icon?: string;

  /** Disables interaction with this item through the underlying tree primitive. */
  disabled?: boolean;

  /** Descendants consumed by the tree's item-flattening behavior. */
  children?: FrameTreeItem[];
}
```

## Reference

<!-- frame:generated type="FrameTreeItem" -->

```ts
export interface FrameTreeItem {

  /** Default rendering and selection key, unless getKey overrides it. */
  id: string;

  /** Visible label in the default tree row. */
  label: string;

  /** Optional row icon, independent of the expansion indicator. */
  icon?: string;

  /** Disables interaction with this item through the underlying tree primitive. */
  disabled?: boolean;

  /** Descendants consumed by the tree's item-flattening behavior. */
  children?: FrameTreeItem[];
}
```

| Name       | Type              | Description                                                                |
| ---------- | ----------------- | -------------------------------------------------------------------------- |
| `id`       | `string`          | Default rendering and selection key, unless getKey overrides it.           |
| `label`    | `string`          | Visible label in the default tree row.                                     |
| `icon`     | `string`          | Optional row icon, independent of the expansion indicator.                 |
| `disabled` | `boolean`         | Disables interaction with this item through the underlying tree primitive. |
| `children` | `FrameTreeItem[]` | Descendants consumed by the tree's item-flattening behavior.               |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **label** (string): Visible or accessible label for the control.
- **icon** (string): Optional leading icon; provide an accessible label for icon-only actions.
- **disabled** (boolean): Prevents user interaction while retaining the current value.
- **children** (FrameTreeItem[]): Nested application-owned contributions.
