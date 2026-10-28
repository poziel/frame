# SettingsSection

Public object contract exported by @frame/core.

## Usage

Use this contract when calling the corresponding Frame API. Optional fields may be omitted.

```typescript
export interface SettingsSection { id: string; title: string; description?: string; settings?: readonly SettingDefinition[]; children?: readonly SettingsSection[] }
```

## Reference

<!-- frame:generated type="SettingsSection" -->

```ts
export interface SettingsSection {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Explanatory text displayed alongside the entry. */
  description?: string;

  /** Field definitions registered within this section. */
  settings?: readonly SettingDefinition[];

  /** Nested definitions rendered and registered beneath this entry. */
  children?: readonly SettingsSection[];

  /** Host-supplied Vue component rendered for this contribution. */
  component?: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}
```

| Name          | Type                           | Description                                                    |
| ------------- | ------------------------------ | -------------------------------------------------------------- |
| `id`          | `string`                       | Stable identity used to address this contribution.             |
| `title`       | `string`                       | Heading displayed by the owning presentation.                  |
| `description` | `string`                       | Explanatory text displayed alongside the entry.                |
| `settings`    | `readonly SettingDefinition[]` | Field definitions registered within this section.              |
| `children`    | `readonly SettingsSection[]`   | Nested definitions rendered and registered beneath this entry. |
| `component`   | `Component`                    | Host-supplied Vue component rendered for this contribution.    |
| `props`       | `Record<string, unknown>`      | Properties forwarded to the host-supplied component.           |

<!-- /frame:generated -->

## Notes

- **id** (string): Stable identifier used for registration, lookup, and disposal.
- **title** (string): Visible heading for the dialog, category, or picker.
- **description** (string | undefined): Supporting explanatory text displayed beneath the heading.
- **settings** (readonly SettingDefinition[] | undefined): Settings definitions rendered in this category. See [SettingDefinition](SettingDefinition.md).
- **children** (readonly SettingsSection[] | undefined): Nested definitions shown as child categories or view sections.
