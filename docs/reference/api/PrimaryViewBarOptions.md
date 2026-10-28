# PrimaryViewBarOptions

Initial view-bar presentation and contribution visibility, scoped to the Frame instance.

## Usage

Use the public package export for this contract.

```typescript
const frame = createFrame({ primaryViewBar: { position: 'top', size: 'compact' } });
frame.primaryViewBar.setPosition('bottom');
frame.primaryViewBar.setSize('default');
frame.primaryViewBar.movePrimarySide('right');
```

## Reference

<!-- frame:generated type="PrimaryViewBarOptions" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **allowAddSeparator** (boolean): Opt-in user separator creation; defaults to false.
- **position** (ViewBarPosition): Initial placement or hidden state; defaults to default. See [ViewBarPosition](ViewBarPosition.md).
- **size** (ViewBarSize): Initial item size; defaults to default. Independent of position and shell density. See [ViewBarSize](ViewBarSize.md).
- **hidden** (readonly string[]): Contributions whose view item or badge begins hidden.
- **hiddenBadges** (readonly string[]): Contributions whose view item or badge begins hidden.
