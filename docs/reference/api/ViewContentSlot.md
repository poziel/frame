# ViewContentSlot

Public interface declared in packages/core/src/framework/views/shellViewContainer.ts.

## Usage

Import ViewContentSlot from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface ViewContentSlot {

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;

  /** Whether the surface applies its standard content padding. */
  padded?: boolean;
}
```

## Reference

<!-- frame:generated type="ViewContentSlot" -->

```ts
export interface ViewContentSlot {

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;

  /** Whether the surface applies its standard content padding. */
  padded?: boolean;
}
```

| Name        | Type                      | Description                                                 |
| ----------- | ------------------------- | ----------------------------------------------------------- |
| `component` | `Component`               | Host-supplied Vue component rendered for this contribution. |
| `props`     | `Record<string, unknown>` | Properties forwarded to the host-supplied component.        |
| `padded`    | `boolean`                 | Whether the surface applies its standard content padding.   |

<!-- /frame:generated -->

## Notes

- **component** (Component): Component configuration for this component; see its Features examples for usage.
- **props** (Record<string, unknown>): Props configuration for this component; see its Features examples for usage.
- **padded** (boolean): Padded configuration for this component; see its Features examples for usage.
