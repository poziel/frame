# PanelAction

Public object contract exported by @frame/core.

## Usage

Use this contract when calling the corresponding Frame API. Optional fields may be omitted.

```typescript
export interface PanelAction { id: string; label: string; icon?: Component; run: () => void; disabled?: boolean }
```

## Reference

<!-- frame:generated type="PanelAction" -->

```ts
export interface PanelAction {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Application callback invoked when the action is activated. */
  run: () => void;

  /** Whether user interaction with this entry is currently blocked. */
  disabled?: boolean;

  /** Optional nested menu displayed by this action. */
  menu?: readonly FrameMenuItem[];

  /** Receives a choice from the action's nested menu. */
  onSelect?: (item: FrameMenuItem) => void;
}
```

| Name       | Type                            | Description                                                    |
| ---------- | ------------------------------- | -------------------------------------------------------------- |
| `id`       | `string`                        | Stable identity used to address this contribution.             |
| `label`    | `string`                        | Human-readable name displayed by the owning surface.           |
| `icon`     | `Component`                     | Optional icon rendered beside the contribution.                |
| `run`      | `() => void`                    | Application callback invoked when the action is activated.     |
| `disabled` | `boolean`                       | Whether user interaction with this entry is currently blocked. |
| `menu`     | `readonly FrameMenuItem[]`      | Optional nested menu displayed by this action.                 |
| `onSelect` | `(item: FrameMenuItem) => void` | Receives a choice from the action's nested menu.               |

<!-- /frame:generated -->

## Notes

- **id** (string): Stable identifier used for registration, lookup, and disposal.
- **label** (string): Visible text shown in the corresponding control or view.
- **icon** (Component | undefined): Optional Vue component rendered as the contribution icon.
- **run** (() => void): Callback invoked when the user activates the action.
- **disabled** (boolean | undefined): Prevents activation or editing when true.
