# FrameStepItem

Public interface declared in packages/core/src/components/navigation/stepperTypes.ts.

## Usage

Import FrameStepItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface FrameStepItem {

  /** Step value forwarded to Reka and displayed in the default indicator. */
  step: number;

  /** Visible step title. */
  label: string;

  /** Optional supporting text displayed below the title. */
  description?: string;

  /** Prevents user activation of this step. */
  disabled?: boolean;

  /** Explicit completion state forwarded to the underlying step item. */
  completed?: boolean;
}
```

## Reference

<!-- frame:generated type="FrameStepItem" -->

```ts
export interface FrameStepItem {

  /** Step value forwarded to Reka and displayed in the default indicator. */
  step: number;

  /** Visible step title. */
  label: string;

  /** Optional supporting text displayed below the title. */
  description?: string;

  /** Prevents user activation of this step. */
  disabled?: boolean;

  /** Explicit completion state forwarded to the underlying step item. */
  completed?: boolean;
}
```

| Name          | Type      | Description                                                          |
| ------------- | --------- | -------------------------------------------------------------------- |
| `step`        | `number`  | Step value forwarded to Reka and displayed in the default indicator. |
| `label`       | `string`  | Visible step title.                                                  |
| `description` | `string`  | Optional supporting text displayed below the title.                  |
| `disabled`    | `boolean` | Prevents user activation of this step.                               |
| `completed`   | `boolean` | Explicit completion state forwarded to the underlying step item.     |

<!-- /frame:generated -->

## Notes

- **step** (number): Increment used by the control.
- **label** (string): Visible or accessible label for the control.
- **description** (string): Description configuration for this component; see its Features examples for usage.
- **disabled** (boolean): Prevents user interaction while retaining the current value.
- **completed** (boolean): Completed configuration for this component; see its Features examples for usage.
