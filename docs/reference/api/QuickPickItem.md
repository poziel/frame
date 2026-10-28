# QuickPickItem

Public object contract exported by @frame/core.

## Usage

Use this contract when calling the corresponding Frame API. Optional fields may be omitted.

```typescript
export interface QuickPickItem {
  id: string;
  label: string;
  detail?: string;
  shortcut?: string;
  disabled?: boolean;
}
```

## Reference

<!-- frame:generated type="QuickPickItem" -->

```ts
export interface QuickPickItem {

  /** Optional live availability for explicit command projections. */
  available?: () => boolean;

  /** Structural rows are not selectable. */
  type?: 'item' | 'separator' | 'heading' | 'submenu';

  /** Inline secondary text. */
  description?: string;

  /** Trailing category annotation. */
  sectionLabel?: string;

  /** Marks the current choice independently of keyboard highlight. */
  selected?: boolean;

  /** Nested choices, opened by the Command Center. */
  items?: readonly QuickPickItem[];

  /** Whether this nested submenu offers text filtering. */
  searchable?: boolean;

  /** Optional local action for non-command choices. */
  run?: () => void | Promise<void>;

  /** Independently accessible row actions. */
  actions?: readonly {
    /** Stable identity used to address this contribution. */
    id: string;
    /** Human-readable name displayed by the owning surface. */
    label: string;
    /** Optional icon rendered beside the contribution. */
    icon?: string;
    /** Application callback invoked when the action is activated. */
    run: () => void | Promise<void>;
  }[];

  /** Stable identity used to address this contribution. */
  id: string;

  /** Optional icon rendered beside the contribution. */
  icon?: string | Component;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Optional secondary text retained with this entry. */
  detail?: string;

  /** Shortcut text displayed with this choice. */
  shortcut?: string;

  /** Whether user interaction with this entry is currently blocked. */
  disabled?: boolean;
}
```

| Name           | Type                                                                                                                                                                                                                                                                                                                                                                          | Description                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `available`    | `() => boolean`                                                                                                                                                                                                                                                                                                                                                               | Optional live availability for explicit command projections.   |
| `type`         | `'item' \| 'separator' \| 'heading' \| 'submenu'`                                                                                                                                                                                                                                                                                                                             | Structural rows are not selectable.                            |
| `description`  | `string`                                                                                                                                                                                                                                                                                                                                                                      | Inline secondary text.                                         |
| `sectionLabel` | `string`                                                                                                                                                                                                                                                                                                                                                                      | Trailing category annotation.                                  |
| `selected`     | `boolean`                                                                                                                                                                                                                                                                                                                                                                     | Marks the current choice independently of keyboard highlight.  |
| `items`        | `readonly QuickPickItem[]`                                                                                                                                                                                                                                                                                                                                                    | Nested choices, opened by the Command Center.                  |
| `searchable`   | `boolean`                                                                                                                                                                                                                                                                                                                                                                     | Whether this nested submenu offers text filtering.             |
| `run`          | `() => void \| Promise<void>`                                                                                                                                                                                                                                                                                                                                                 | Optional local action for non-command choices.                 |
| `actions`      | `readonly {     /** Stable identity used to address this contribution. */     id: string;     /** Human-readable name displayed by the owning surface. */     label: string;     /** Optional icon rendered beside the contribution. */     icon?: string;     /** Application callback invoked when the action is activated. */     run: () => void \| Promise<void>;   }[]` | Independently accessible row actions.                          |
| `id`           | `string`                                                                                                                                                                                                                                                                                                                                                                      | Stable identity used to address this contribution.             |
| `icon`         | `string \| Component`                                                                                                                                                                                                                                                                                                                                                         | Optional icon rendered beside the contribution.                |
| `label`        | `string`                                                                                                                                                                                                                                                                                                                                                                      | Human-readable name displayed by the owning surface.           |
| `detail`       | `string`                                                                                                                                                                                                                                                                                                                                                                      | Optional secondary text retained with this entry.              |
| `shortcut`     | `string`                                                                                                                                                                                                                                                                                                                                                                      | Shortcut text displayed with this choice.                      |
| `disabled`     | `boolean`                                                                                                                                                                                                                                                                                                                                                                     | Whether user interaction with this entry is currently blocked. |

<!-- /frame:generated -->

## Notes

- **id** (string): Stable identifier used for registration, lookup, and disposal.
- **label** (string): Visible text shown in the corresponding control or view.
- **detail** (string | undefined): Secondary text shown alongside the picker label.
- **shortcut** (string | undefined): Displayed keyboard shortcut hint; does not register a shortcut.
- **disabled** (boolean | undefined): Prevents activation or editing when true.
