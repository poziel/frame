# FrameSplitPanel

Public interface declared in packages/core/src/components/layout/splitterTypes.ts.

## Usage

Import FrameSplitPanel from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface FrameSplitPanel extends SplitterPanelProps {

  /** Resize-handle name and fallback panel text when content is omitted. */
  label?: string;

  /** Fallback text displayed when the panel slot is not supplied. */
  content?: string;
}
```

## Reference

<!-- frame:generated type="FrameSplitPanel" -->

```ts
export interface FrameSplitPanel extends SplitterPanelProps {

  /** Resize-handle name and fallback panel text when content is omitted. */
  label?: string;

  /** Fallback text displayed when the panel slot is not supplied. */
  content?: string;
}
```

| Name      | Type     | Description                                                         |
| --------- | -------- | ------------------------------------------------------------------- |
| `label`   | `string` | Resize-handle name and fallback panel text when content is omitted. |
| `content` | `string` | Fallback text displayed when the panel slot is not supplied.        |

<!-- /frame:generated -->

## Notes

- **label** (string): Visible or accessible label for the control.
- **content** (string): Content configuration for this component; see its Features examples for usage.
