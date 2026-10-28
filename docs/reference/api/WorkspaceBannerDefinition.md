# WorkspaceBannerDefinition

Public interface declared in packages/core/src/framework/workspace/workspaceBanner.ts.

## Usage

Import WorkspaceBannerDefinition from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface WorkspaceBannerDefinition {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}
```

## Reference

<!-- frame:generated type="WorkspaceBannerDefinition" -->

```ts
export interface WorkspaceBannerDefinition {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}
```

| Name        | Type                      | Description                                                 |
| ----------- | ------------------------- | ----------------------------------------------------------- |
| `id`        | `string`                  | Stable identity used to address this contribution.          |
| `label`     | `string`                  | Human-readable name displayed by the owning surface.        |
| `component` | `Component`               | Host-supplied Vue component rendered for this contribution. |
| `props`     | `Record<string, unknown>` | Properties forwarded to the host-supplied component.        |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **label** (string): Visible or accessible label for the control.
- **component** (Component): Component configuration for this component; see its Features examples for usage.
- **props** (Record<string, unknown>): Props configuration for this component; see its Features examples for usage.
