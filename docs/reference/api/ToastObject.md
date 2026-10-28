# ToastObject

Public interface declared in node_modules/.bun/reka-ui@2.11.0+501eebc2bdcde416/node_modules/reka-ui/dist/index3.d.ts.

## Usage

Import ToastObject from reka-ui. The definition below is the source contract; optional fields may be omitted.

```typescript
interface ToastObject<Data extends object = any> {
  /** The unique identifier for the toast. */
  id: string;
  /** Whether the toast is open. Closed toasts stay in the list until their exit animation ends. */
  open: boolean;
  /** The title of the toast. Rendered by `ToastTitle` when it has no slot content. */
  title?: string;
  /** The description of the toast. Rendered by `ToastDescription` when it has no slot content. */
  description?: string;
  /**
   * The sensitivity of the toast for accessibility purposes. Overrides the `type` prop of `ToastRoot`.
   * `foreground` toasts are announced immediately, `background` toasts politely.
   */
  type?: 'foreground' | 'background';
  /** The status of the toast. Exposed as `data-status` on `ToastRoot`. */
  status?: ToastStatus;
  /**
   * Time in milliseconds before the toast is dismissed automatically. Overrides
   * the `duration` of `ToastRoot` and `ToastProvider`. `0` or `Infinity` keeps it open.
   */
  duration?: number;
  /** Props for `ToastAction` inside the toast. */
  actionProps?: ToastActionOptions;
  /** Props for `ToastPositioner`, used to anchor the toast to an element. */
  positionerProps?: ToastPositionerOptions;
  /** Custom data for the toast. */
  data?: Data;
  /** Called when the toast is closed. */
  onClose?: () => void;
  /** Called when the toast is removed from the list, after its exit animation. */
  onRemove?: () => void;
  /** Increments whenever the toast is updated, or added again with the same `id`. */
  updateKey: number;
}
```

## Reference

<!-- frame:generated type="ToastObject" -->

```ts
interface ToastObject<Data extends object = any> {
  /** The unique identifier for the toast. */
  id: string;
  /** Whether the toast is open. Closed toasts stay in the list until their exit animation ends. */
  open: boolean;
  /** The title of the toast. Rendered by `ToastTitle` when it has no slot content. */
  title?: string;
  /** The description of the toast. Rendered by `ToastDescription` when it has no slot content. */
  description?: string;
  /**
   * The sensitivity of the toast for accessibility purposes. Overrides the `type` prop of `ToastRoot`.
   * `foreground` toasts are announced immediately, `background` toasts politely.
   */
  type?: 'foreground' | 'background';
  /** The status of the toast. Exposed as `data-status` on `ToastRoot`. */
  status?: ToastStatus;
  /**
   * Time in milliseconds before the toast is dismissed automatically. Overrides
   * the `duration` of `ToastRoot` and `ToastProvider`. `0` or `Infinity` keeps it open.
   */
  duration?: number;
  /** Props for `ToastAction` inside the toast. */
  actionProps?: ToastActionOptions;
  /** Props for `ToastPositioner`, used to anchor the toast to an element. */
  positionerProps?: ToastPositionerOptions;
  /** Custom data for the toast. */
  data?: Data;
  /** Called when the toast is closed. */
  onClose?: () => void;
  /** Called when the toast is removed from the list, after its exit animation. */
  onRemove?: () => void;
  /** Increments whenever the toast is updated, or added again with the same `id`. */
  updateKey: number;
}
```

| Name              | Type                           | Description                                                                                                                                                                     |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | `string`                       | The unique identifier for the toast.                                                                                                                                            |
| `open`            | `boolean`                      | Whether the toast is open. Closed toasts stay in the list until their exit animation ends.                                                                                      |
| `title`           | `string`                       | The title of the toast. Rendered by `ToastTitle` when it has no slot content.                                                                                                   |
| `description`     | `string`                       | The description of the toast. Rendered by `ToastDescription` when it has no slot content.                                                                                       |
| `type`            | `'foreground' \| 'background'` | The sensitivity of the toast for accessibility purposes. Overrides the `type` prop of `ToastRoot`. `foreground` toasts are announced immediately, `background` toasts politely. |
| `status`          | `ToastStatus`                  | The status of the toast. Exposed as `data-status` on `ToastRoot`.                                                                                                               |
| `duration`        | `number`                       | Time in milliseconds before the toast is dismissed automatically. Overrides the `duration` of `ToastRoot` and `ToastProvider`. `0` or `Infinity` keeps it open.                 |
| `actionProps`     | `ToastActionOptions`           | Props for `ToastAction` inside the toast.                                                                                                                                       |
| `positionerProps` | `ToastPositionerOptions`       | Props for `ToastPositioner`, used to anchor the toast to an element.                                                                                                            |
| `data`            | `Data`                         | Custom data for the toast.                                                                                                                                                      |
| `onClose`         | `() => void`                   | Called when the toast is closed.                                                                                                                                                |
| `onRemove`        | `() => void`                   | Called when the toast is removed from the list, after its exit animation.                                                                                                       |
| `updateKey`       | `number`                       | Increments whenever the toast is updated, or added again with the same `id`.                                                                                                    |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **open** (boolean): Open configuration for this component; see its Features examples for usage.
- **title** (string): Visible heading.
- **description** (string): Description configuration for this component; see its Features examples for usage.
- **type** ('foreground' | 'background'): Native input/button behavior.
- **status** (ToastStatus): Status configuration for this component; see its Features examples for usage.
- **duration** (number): Duration configuration for this component; see its Features examples for usage.
- **actionProps** (ToastActionOptions): Action Props configuration for this component; see its Features examples for usage.
- **positionerProps** (ToastPositionerOptions): Positioner Props configuration for this component; see its Features examples for usage.
- **data** (Data): Data configuration for this component; see its Features examples for usage.
- **onClose** (() => void): On Close configuration for this component; see its Features examples for usage.
- **onRemove** (() => void): On Remove configuration for this component; see its Features examples for usage.
- **updateKey** (number): Update Key configuration for this component; see its Features examples for usage.
