# SecondaryViewBarOptions

Initial secondary sidebar view-bar presentation and item preferences.

## Usage

Use the public package export for this contract.

```typescript
const frame = createFrame({ secondaryViewBar: { position: 'top', display: 'both', size: 'default' } });
```

## Reference

<!-- frame:generated type="SecondaryViewBarOptions" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **allowAddSeparator** (boolean): Opt-in user separator creation; defaults to false.
- **position** (ViewBarPosition): Defaults to top; default follows the outer sidebar edge. See [ViewBarPosition](ViewBarPosition.md).
- **display** ('icons' | 'text' | 'both'): Available in vertical and horizontal placements.
- **size** (ViewBarSize): Independent default or compact item sizing. See [ViewBarSize](ViewBarSize.md).
- **hidden / hiddenBadges** (readonly string[]): Initial secondary-view or badge visibility.
