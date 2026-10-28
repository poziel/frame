# FrameToolbarItem

Public interface declared in packages/core/src/components/actions/toolbarTypes.ts.

## Usage

Import FrameToolbarItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
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
```

## Reference

<!-- frame:generated type="FrameToolbarItem" -->

```ts
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
```

| Name        | Type      | Description                                                           |
| ----------- | --------- | --------------------------------------------------------------------- |
| `id`        | `string`  | Stable rendering identity within the toolbar.                         |
| `label`     | `string`  | Visible text for a button or link; unused when rendering a separator. |
| `icon`      | `string`  | Optional icon displayed before a non-separator label.                 |
| `disabled`  | `boolean` | Prevents activation and renders a button instead of an active link.   |
| `href`      | `string`  | Link destination used when the item is enabled and not a separator.   |
| `separator` | `boolean` | Renders a structural separator instead of a button or link.           |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **label** (string): Visible or accessible label for the control.
- **icon** (string): Optional leading icon; provide an accessible label for icon-only actions.
- **disabled** (boolean): Prevents user interaction while retaining the current value.
- **href** (string): Href configuration for this component; see its Features examples for usage.
- **separator** (boolean): Separator configuration for this component; see its Features examples for usage.
