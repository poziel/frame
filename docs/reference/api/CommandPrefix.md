# CommandPrefix

Public interface declared in packages/core/src/framework/commands/commandPrefixes.ts.

## Usage

Import CommandPrefix from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface CommandPrefix {

  /** Unique single-symbol prefix used to enter this command category. */
  prefix: string;

  /** Human-readable category label. */
  label: string;

  /** Optional search hint displayed inside this category. */
  placeholder?: string;
}
```

## Reference

<!-- frame:generated type="CommandPrefix" -->

```ts
export interface CommandPrefix {

  /** Unique single-symbol prefix used to enter this command category. */
  prefix: string;

  /** Human-readable category label. */
  label: string;

  /** Optional search hint displayed inside this category. */
  placeholder?: string;
}
```

| Name          | Type     | Description                                                      |
| ------------- | -------- | ---------------------------------------------------------------- |
| `prefix`      | `string` | Unique single-symbol prefix used to enter this command category. |
| `label`       | `string` | Human-readable category label.                                   |
| `placeholder` | `string` | Optional search hint displayed inside this category.             |

<!-- /frame:generated -->

## Notes

- **prefix** (string): Prefix configuration for this component; see its Features examples for usage.
- **label** (string): Visible or accessible label for the control.
- **placeholder** (string): Hint displayed when the field is empty.
