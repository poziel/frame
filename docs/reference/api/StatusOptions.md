# StatusOptions

Initial presentation for the three-section status bar owned by a Frame instance.

## Usage

Use the public package export for this contract.

```typescript
const frame = createFrame({ status: { message: 'Ready', visible: true, hidden: ['app.version'], hiddenBadges: [] } });
```

## Reference

<!-- frame:generated type="StatusOptions" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **message** (string): Initial persistent center text. Defaults to Ready.
- **visible** (boolean): Initial status-bar visibility. Defaults to true.
- **hidden** (readonly string[]): Ids whose item presentation starts hidden.
- **hiddenBadges** (readonly string[]): Ids whose badges start hidden.
