# SettingDefinition

Metadata used by the settings system to assemble a form. Individual components such as FrameSlider and FrameTextArea do not require this object.

## Usage

Use the public package export for this contract.

```typescript
import type { SettingDefinition } from '@frame/core';
const setting: SettingDefinition = {
  id: 'volume', label: 'Volume', type: 'range', default: 50, min: 0, max: 100,
  onChange: value => { preferences.volume = Number(value); },
};
```

## Reference

<!-- frame:generated type="SettingDefinition" -->

```ts
export interface SettingDefinition {

  /** Hide this persisted field from the settings form, while keeping it editable in JSON. */
  visible?: boolean;

  /** Exclude a contextual form control from the application preferences file. */
  persist?: boolean;

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Explanatory text displayed alongside the entry. */
  description?: string;

  /** Kind of control or structural row represented by this definition. */
  type:
    'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'range' | 'color';

  /** Value restored when this field is reset. */
  default: SettingValue;

  /** Hint displayed when the input or search field is empty. */
  placeholder?: string;

  /** Minimum accepted numeric value. */
  min?: number;

  /** Maximum accepted numeric value. */
  max?: number;

  /** Increment supplied to the numeric or range control. */
  step?: number;

  /** Selectable values and structural separator rows offered by the control. */
  options?: readonly SelectItem[];

  /** Whether user interaction with this entry is currently blocked. */
  disabled?: boolean;

  /** Reads the effective value from host-owned domain state. */
  getValue?: () => SettingValue;

  /** Receives validated edits before controller fallback values are updated. */
  onChange?: (value: SettingValue) => void;

  /** Custom control, including a FieldGroup. Frame retains the label, description and row actions. */
  component?: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}
```

| Name          | Type                                                                               | Description                                                                                   |
| ------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `visible`     | `boolean`                                                                          | Hide this persisted field from the settings form, while keeping it editable in JSON.          |
| `persist`     | `boolean`                                                                          | Exclude a contextual form control from the application preferences file.                      |
| `id`          | `string`                                                                           | Stable identity used to address this contribution.                                            |
| `label`       | `string`                                                                           | Human-readable name displayed by the owning surface.                                          |
| `description` | `string`                                                                           | Explanatory text displayed alongside the entry.                                               |
| `type`        | `'text' \| 'textarea' \| 'number' \| 'checkbox' \| 'select' \| 'range' \| 'color'` | Kind of control or structural row represented by this definition.                             |
| `default`     | `SettingValue`                                                                     | Value restored when this field is reset.                                                      |
| `placeholder` | `string`                                                                           | Hint displayed when the input or search field is empty.                                       |
| `min`         | `number`                                                                           | Minimum accepted numeric value.                                                               |
| `max`         | `number`                                                                           | Maximum accepted numeric value.                                                               |
| `step`        | `number`                                                                           | Increment supplied to the numeric or range control.                                           |
| `options`     | `readonly SelectItem[]`                                                            | Selectable values and structural separator rows offered by the control.                       |
| `disabled`    | `boolean`                                                                          | Whether user interaction with this entry is currently blocked.                                |
| `getValue`    | `() => SettingValue`                                                               | Reads the effective value from host-owned domain state.                                       |
| `onChange`    | `(value: SettingValue) => void`                                                    | Receives validated edits before controller fallback values are updated.                       |
| `component`   | `Component`                                                                        | Custom control, including a FieldGroup. Frame retains the label, description and row actions. |
| `props`       | `Record<string, unknown>`                                                          | Properties forwarded to the host-supplied component.                                          |

<!-- /frame:generated -->

## Notes

- **id / label** (string): Unique setting identifier and visible label.
- **type** ("text" | "textarea" | "number" | "checkbox" | "select" | "range" | "color"): text, textarea, number, checkbox, select, range, color.
- **default** (SettingValue): Initial/reset value: string, boolean, or number. See [SettingValue](SettingValue.md).
- **description / placeholder** (string): Optional supporting text.
- **options** (readonly SelectItem[]): SelectItem[] for selects; may contain separators. See [SelectItem](SelectItem.md).
- **min / max / step** (number): Numeric control bounds and increment.
- **getValue / onChange** ((() => SettingValue) / ((value: SettingValue) => void)): Connect a reactive preference store and persistence. See [SettingValue](SettingValue.md).
- **disabled** (boolean): Disables edits.
