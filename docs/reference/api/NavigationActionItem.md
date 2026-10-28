# NavigationActionItem

Public interface declared in packages/core/src/framework/views/navigationItems.ts.

## Usage

Import NavigationActionItem from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface NavigationActionItem extends NamedNavigationItem {

  /** Discriminant selecting the supported item behavior. */
  type: 'action';

  /** Action invoked when this contribution is activated. */
  run: () => void | Promise<void>;

  /** Static or reactive indication that this navigation destination is selected. */
  active?: boolean | (() => boolean);
}
```

## Reference

<!-- frame:generated type="NavigationActionItem" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **type** ('action'): Native input/button behavior.
- **run** (() => void | Promise<void>): Run configuration for this component; see its Features examples for usage.
- **active** (boolean | (() => boolean)): Shows the loading presentation while retaining the mounted content.
