# NavigationItem

A navigation-only union: action, link, dropdown, or separator. Navigation items never own sidebar/panel content.

## Usage

Use the public package export for this contract.

```typescript
frame.registerNavigationItem({ id: 'home', type: 'link', label: 'Home', href: '#/home' });
```

## Reference

<!-- frame:generated type="NavigationItem" -->

```ts
export type NavigationItem =
  | NavigationActionItem
  | NavigationLinkItem
  | NavigationDropdownItem
  | NavigationSeparatorItem;
```

No declared entries.

<!-- /frame:generated -->

## Notes

- **type** ('action' | 'link' | 'dropdown' | 'separator'): Explicit behavior discriminator.
- **id** (string): Unique throughout one navigation tree; separate from view ids.
- **run** (() => void | Promise<void>): Required only for an action.
- **href / onNavigate** (string / optional callback): A link destination and optional host router integration.
- **items** (readonly NavigationItem[]): Required for dropdowns; nested dropdowns are supported.
