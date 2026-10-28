# FrameAccordionItem

Public interface declared in packages/core/src/components/layout/FrameAccordion.vue.ts.

## Usage

Import FrameAccordionItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface FrameAccordionItem { value: string; title: string; description?: string; disabled?: boolean }
```

## Reference

<!-- frame:generated type="FrameAccordionItem" -->

```ts
export interface FrameAccordionItem {

  /** Stable section value used for expanded-state selection. */
  value: string;

  /** Fallback visible text for the section trigger. */
  title: string;

  /** Fallback body text when no content slot is provided. */
  description?: string;

  /** Prevents user activation of this section trigger. */
  disabled?: boolean;
}
```

| Name          | Type      | Description                                             |
| ------------- | --------- | ------------------------------------------------------- |
| `value`       | `string`  | Stable section value used for expanded-state selection. |
| `title`       | `string`  | Fallback visible text for the section trigger.          |
| `description` | `string`  | Fallback body text when no content slot is provided.    |
| `disabled`    | `boolean` | Prevents user activation of this section trigger.       |

<!-- /frame:generated -->

## Notes

- **value** (string): Value configuration for this component; see its Features examples for usage.
- **title** (string): Visible heading.
- **description** (string): Description configuration for this component; see its Features examples for usage.
- **disabled** (boolean): Prevents user interaction while retaining the current value.
