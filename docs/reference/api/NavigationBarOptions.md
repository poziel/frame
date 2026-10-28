# NavigationBarOptions

Initial optional navigation-bar presentation and docking.

## Usage

Use the public package export for this contract.

```typescript
const frame = createFrame({ navigationBar: { position: 'left', display: 'both', size: 'compact' } });
```

## Reference

<!-- frame:generated type="NavigationBarOptions" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **allowAddSeparator** (boolean): Opt-in user separator creation; defaults to false.
- **collapsed** (boolean): Independent collapsed state for vertical icons-and-text navigation; defaults false.
- **position** ('top' | 'bottom' | 'left' | 'right'): Dock outside the entire workbench body; defaults to top.
- **visible** (boolean): An options object shows the bar unless false.
- **display** ('icons' | 'text' | 'both'): Works in every docking orientation.
- **justification** ('left' | 'center' | 'right'): Side-docked item alignment; defaults to left on either side. Also controlled by setJustification.
- **size** ('default' | 'compact'): Independent of overall shell density.
- **hidden / hiddenBadges** (readonly string[]): Initial navigation-item presentation preferences.
