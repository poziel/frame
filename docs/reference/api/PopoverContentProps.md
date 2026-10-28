# PopoverContentProps

Public interface declared in node_modules/.bun/reka-ui@2.11.0+501eebc2bdcde416/node_modules/reka-ui/dist/index3.d.ts.

## Usage

Import PopoverContentProps from reka-ui. The definition below is the source contract; optional fields may be omitted.

```typescript
interface PopoverContentProps extends PopoverContentImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with Vue animation libraries.
   */
  forceMount?: boolean;
}
```

## Reference

<!-- frame:generated type="PopoverContentProps" -->

```ts
interface PopoverContentProps extends PopoverContentImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with Vue animation libraries.
   */
  forceMount?: boolean;
}
```

| Name         | Type      | Description                                                                                                         |
| ------------ | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `forceMount` | `boolean` | Used to force mounting when more control is needed. Useful when controlling animation with Vue animation libraries. |

<!-- /frame:generated -->

## Notes

- **forceMount** (boolean): Force Mount configuration for this component; see its Features examples for usage.
