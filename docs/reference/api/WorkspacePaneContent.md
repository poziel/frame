# WorkspacePaneContent

Public object contract exported by @frame/core.

## Usage

Use this contract when calling the corresponding Frame API. Optional fields may be omitted.

```typescript
export interface WorkspacePaneContent {
  label: string;
  component?: Component;
  props?: Record<string, unknown>;
}
```

## Reference

<!-- frame:generated type="WorkspacePaneContent" -->

```ts
export interface WorkspacePaneContent {

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Host-supplied Vue component rendered for this contribution. */
  component?: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}
```

| Name        | Type                      | Description                                                 |
| ----------- | ------------------------- | ----------------------------------------------------------- |
| `label`     | `string`                  | Human-readable name displayed by the owning surface.        |
| `component` | `Component`               | Host-supplied Vue component rendered for this contribution. |
| `props`     | `Record<string, unknown>` | Properties forwarded to the host-supplied component.        |

<!-- /frame:generated -->

## Notes

- **label** (string): Visible text shown in the corresponding control or view.
- **component** (Component | undefined): Vue component rendered as the custom content.
- **props** (Record<string, unknown> | undefined): Values passed as props to the content component.
