# PanelViewBarOptions

Presentation of panel view items, separate from panel docking/alignment.

## Usage

Use the public package export for this contract.

```typescript
const frame = createFrame({ panelViewBar: { visible: true, size: 'compact', display: 'both' } });
```

## Reference

<!-- frame:generated type="PanelViewBarOptions" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **allowAddSeparator** (boolean): Opt-in user separator creation; defaults to false.
- **visible** (boolean): Hides only the selector when false; retains panel content.
- **size** ('default' | 'compact'): Panel view-bar item size.
- **display** ('icons' | 'text' | 'both'): Panel view-item display.
- **hidden / hiddenBadges** (readonly string[]): Initial view-item or badge visibility.
